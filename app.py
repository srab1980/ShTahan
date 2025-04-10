import os
import logging
import uuid
from datetime import datetime
from werkzeug.utils import secure_filename
from flask import Flask, render_template, request, jsonify, url_for, send_from_directory, redirect, flash, session
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from functools import wraps

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Create base class for SQLAlchemy models
class Base(DeclarativeBase):
    pass

# Initialize SQLAlchemy
db = SQLAlchemy(model_class=Base)

# Create Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "default_secret_key")

# Configure database
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "postgresql://neondb_owner:npg_HwBp7WMGd4ni@ep-flat-hall-a4pn3nar.us-east-1.aws.neon.tech/neondb?sslmode=require")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}

# Configure file uploads
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf'}

# Initialize the app with the SQLAlchemy extension
db.init_app(app)

# Import models after initializing db
from models import Book, Article, GalleryImage, ContactMessage, User

# Initialize Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'
login_manager.login_message = 'يرجى تسجيل الدخول للوصول إلى هذه الصفحة'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Role-based authorization decorators
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or not current_user.is_admin():
            return jsonify({'error': 'غير مصرح. يتطلب صلاحيات المسؤول'}), 403
        return f(*args, **kwargs)
    return decorated_function

def editor_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or not current_user.is_editor():
            return jsonify({'error': 'غير مصرح. يتطلب صلاحيات المحرر على الأقل'}), 403
        return f(*args, **kwargs)
    return decorated_function

# Helper function to check allowed file extensions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Helper function to generate a unique filename
def generate_unique_filename(filename):
    ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    unique_name = f"{uuid.uuid4().hex}.{ext}"
    return unique_name

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/gallery')
def gallery():
    return render_template('gallery.html')

# Authentication routes
@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
        
    if request.method == 'POST':
        data = request.json
        
        if not all(key in data for key in ['username', 'password']):
            return jsonify({'error': 'يرجى تقديم اسم المستخدم وكلمة المرور'}), 400
        
        user = User.query.filter_by(username=data['username']).first()
        
        if user is None or not user.check_password(data['password']):
            return jsonify({'error': 'اسم المستخدم أو كلمة المرور غير صحيحة'}), 401
        
        if not user.active:
            return jsonify({'error': 'تم تعطيل هذا الحساب، يرجى الاتصال بالمسؤول'}), 403
        
        # Update last login time
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        login_user(user)
        return jsonify({
            'message': 'تم تسجيل الدخول بنجاح',
            'user': {
                'id': user.id,
                'username': user.username,
                'role': user.role
            }
        })
    
    # GET request - serve the login page
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

@app.route('/api/auth/status')
def auth_status():
    if current_user.is_authenticated:
        return jsonify({
            'authenticated': True,
            'user': {
                'id': current_user.id,
                'username': current_user.username,
                'role': current_user.role,
                'is_admin': current_user.is_admin(),
                'is_editor': current_user.is_editor()
            }
        })
    else:
        return jsonify({'authenticated': False})

# Books API Endpoints
@app.route('/api/books', methods=['GET'])
def get_books():
    books = Book.query.all()
    return jsonify({'books': [book.to_dict() for book in books]})

@app.route('/api/books/<int:book_id>', methods=['GET'])
def get_book(book_id):
    book = Book.query.get_or_404(book_id)
    return jsonify({'book': book.to_dict()})

@app.route('/api/books', methods=['POST'])
@editor_required
def add_book():
    data = request.json
    
    if not all(key in data for key in ['title', 'language', 'category', 'cover', 'download', 'description']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    new_book = Book(
        title=data['title'],
        language=data['language'],
        category=data['category'],
        cover=data['cover'],
        download=data['download'],
        description=data['description']
    )
    
    db.session.add(new_book)
    db.session.commit()
    
    return jsonify({'message': 'Book added successfully', 'book': new_book.to_dict()}), 201

@app.route('/api/books/<int:book_id>', methods=['PUT'])
@editor_required
def update_book(book_id):
    book = Book.query.get_or_404(book_id)
    data = request.json
    
    if 'title' in data:
        book.title = data['title']
    if 'language' in data:
        book.language = data['language']
    if 'category' in data:
        book.category = data['category']
    if 'cover' in data:
        book.cover = data['cover']
    if 'download' in data:
        book.download = data['download']
    if 'description' in data:
        book.description = data['description']
    
    db.session.commit()
    
    return jsonify({'message': 'Book updated successfully', 'book': book.to_dict()})

@app.route('/api/books/<int:book_id>', methods=['DELETE'])
@editor_required
def delete_book(book_id):
    book = Book.query.get_or_404(book_id)
    
    db.session.delete(book)
    db.session.commit()
    
    return jsonify({'message': 'Book deleted successfully'})

# Articles API Endpoints
@app.route('/api/articles', methods=['GET'])
def get_articles():
    articles = Article.query.all()
    return jsonify({'articles': [article.to_dict() for article in articles]})

@app.route('/api/articles/<int:article_id>', methods=['GET'])
def get_article(article_id):
    article = Article.query.get_or_404(article_id)
    return jsonify({'article': article.to_dict()})

@app.route('/api/articles', methods=['POST'])
def add_article():
    data = request.json
    
    if not all(key in data for key in ['title', 'summary', 'content']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    new_article = Article(
        title=data['title'],
        summary=data['summary'],
        content=data['content']
    )
    
    db.session.add(new_article)
    db.session.commit()
    
    return jsonify({'message': 'Article added successfully', 'article': new_article.to_dict()}), 201

@app.route('/api/articles/<int:article_id>', methods=['PUT'])
def update_article(article_id):
    article = Article.query.get_or_404(article_id)
    data = request.json
    
    if 'title' in data:
        article.title = data['title']
    if 'summary' in data:
        article.summary = data['summary']
    if 'content' in data:
        article.content = data['content']
    
    db.session.commit()
    
    return jsonify({'message': 'Article updated successfully', 'article': article.to_dict()})

@app.route('/api/articles/<int:article_id>', methods=['DELETE'])
def delete_article(article_id):
    article = Article.query.get_or_404(article_id)
    
    db.session.delete(article)
    db.session.commit()
    
    return jsonify({'message': 'Article deleted successfully'})

# Gallery API Endpoints
@app.route('/api/gallery', methods=['GET'])
def get_gallery():
    images = GalleryImage.query.all()
    return jsonify({'images': [image.to_dict() for image in images]})

@app.route('/api/gallery/<int:image_id>', methods=['GET'])
def get_gallery_image(image_id):
    image = GalleryImage.query.get_or_404(image_id)
    return jsonify({'image': image.to_dict()})

@app.route('/api/gallery', methods=['POST'])
def add_gallery_image():
    data = request.json
    
    if not all(key in data for key in ['url', 'caption']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    new_image = GalleryImage(
        url=data['url'],
        caption=data['caption']
    )
    
    db.session.add(new_image)
    db.session.commit()
    
    return jsonify({'message': 'Image added successfully', 'image': new_image.to_dict()}), 201

@app.route('/api/gallery/<int:image_id>', methods=['PUT'])
def update_gallery_image(image_id):
    image = GalleryImage.query.get_or_404(image_id)
    data = request.json
    
    if 'url' in data:
        image.url = data['url']
    if 'caption' in data:
        image.caption = data['caption']
    
    db.session.commit()
    
    return jsonify({'message': 'Image updated successfully', 'image': image.to_dict()})

@app.route('/api/gallery/<int:image_id>', methods=['DELETE'])
def delete_gallery_image(image_id):
    image = GalleryImage.query.get_or_404(image_id)
    
    db.session.delete(image)
    db.session.commit()
    
    return jsonify({'message': 'Image deleted successfully'})

# Contact Form API Endpoint
@app.route('/api/contact', methods=['POST'])
def submit_contact():
    data = request.json
    
    if not all(key in data for key in ['name', 'email', 'message']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    new_message = ContactMessage(
        name=data['name'],
        email=data['email'],
        message=data['message']
    )
    
    db.session.add(new_message)
    db.session.commit()
    
    return jsonify({'message': 'Message sent successfully'}), 201

# File Upload Endpoints
@app.route('/api/upload/book-cover', methods=['POST'])
def upload_book_cover():
    # Check if a file part exists in the request
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    # Check if user submitted an empty form
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # Check if file is allowed
    if file and allowed_file(file.filename):
        # Create a unique filename to avoid collisions
        filename = generate_unique_filename(file.filename)
        
        # Save file to the books upload directory
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], 'books', filename)
        file.save(file_path)
        
        # Return the file path for use in the book cover field
        return jsonify({
            'message': 'File uploaded successfully',
            'file_url': f"/static/uploads/books/{filename}"
        }), 201
    else:
        return jsonify({'error': 'File type not allowed'}), 400

@app.route('/api/upload/book-pdf', methods=['POST'])
def upload_book_pdf():
    # Check if a file part exists in the request
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    # Check if user submitted an empty form
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # Check if file is allowed and is a PDF
    if file and file.filename.lower().endswith('.pdf'):
        # Create a unique filename to avoid collisions
        filename = generate_unique_filename(file.filename)
        
        # Save file to the books upload directory
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], 'books', filename)
        file.save(file_path)
        
        # Return the file path for use in the book download field
        return jsonify({
            'message': 'PDF uploaded successfully',
            'file_url': f"/static/uploads/books/{filename}"
        }), 201
    else:
        return jsonify({'error': 'File must be a PDF'}), 400

@app.route('/api/upload/gallery-image', methods=['POST'])
def upload_gallery_image():
    # Check if a file part exists in the request
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    # Check if user submitted an empty form
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # Check if file is an image
    if file and allowed_file(file.filename) and file.filename.lower().endswith(('png', 'jpg', 'jpeg', 'gif')):
        # Create a unique filename to avoid collisions
        filename = generate_unique_filename(file.filename)
        
        # Save file to the gallery upload directory
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], 'gallery', filename)
        file.save(file_path)
        
        # Return the file path for use in the gallery image
        return jsonify({
            'message': 'Image uploaded successfully',
            'file_url': f"/static/uploads/gallery/{filename}"
        }), 201
    else:
        return jsonify({'error': 'File must be an image (PNG, JPG, JPEG, GIF)'}), 400

@app.route('/api/upload/article-image', methods=['POST'])
def upload_article_image():
    # Check if a file part exists in the request
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    # Check if user submitted an empty form
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # Check if file is an image
    if file and allowed_file(file.filename) and file.filename.lower().endswith(('png', 'jpg', 'jpeg', 'gif')):
        # Create a unique filename to avoid collisions
        filename = generate_unique_filename(file.filename)
        
        # Save file to the articles upload directory
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], 'articles', filename)
        file.save(file_path)
        
        # Return the file path for use in the article content
        return jsonify({
            'message': 'Image uploaded successfully',
            'file_url': f"/static/uploads/articles/{filename}"
        }), 201
    else:
        return jsonify({'error': 'File must be an image (PNG, JPG, JPEG, GIF)'}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
