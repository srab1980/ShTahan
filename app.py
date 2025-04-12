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

# تحسين أمان التطبيق
app.config['SESSION_COOKIE_SECURE'] = True  # للتأكد من استخدام HTTPS فقط للجلسات
app.config['SESSION_COOKIE_HTTPONLY'] = True  # منع الوصول إلى ملفات تعريف الارتباط من JavaScript
app.config['PERMANENT_SESSION_LIFETIME'] = 86400  # تحديد مدة الجلسة بيوم واحد

# Configure database
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "postgresql://neondb_owner:npg_HwBp7WMGd4ni@ep-flat-hall-a4pn3nar.us-east-1.aws.neon.tech/neondb?sslmode=require")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}

# Configure file uploads
# Configure upload folder and ensure directories exist
app.config['UPLOAD_FOLDER'] = 'static/uploads'

# Create upload directories if they don't exist
os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'gallery'), exist_ok=True)
os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'books'), exist_ok=True)
os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'articles'), exist_ok=True)

# Add route for user journey page
@app.route('/user-journey')
@login_required
def user_journey():
    """Render user journey page"""
    # Add the current year to the template context
    from datetime import datetime
    return render_template('user_journey.html', now=datetime.now())
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf'}

# Initialize the app with the SQLAlchemy extension
db.init_app(app)

# Import models after initializing db
from models import Book, Article, GalleryImage, ContactMessage, User, UserActivity

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
    return render_template('index.html', now=datetime.now())

@app.route('/admin')
@login_required
def admin_dashboard():
    return render_template('admin.html')

@app.route('/admin/books')
@login_required
@editor_required
def books_management():
    return render_template('books-management.html')

@app.route('/admin/articles')
@login_required  # تحقق من تسجيل الدخول فقط
def articles_management():
    print("تم الوصول إلى صفحة إدارة المقالات بنجاح!")
    return render_template('articles-management.html')

# نبقي المسار البديل للتجربة حتى نتأكد من إصلاح المشكلة
@app.route('/articles-management-test')
def articles_management_test():
    print("تم الوصول إلى صفحة اختبار إدارة المقالات بدون التحقق من الصلاحيات!")
    return render_template('articles-management.html')

@app.route('/admin/users')
@login_required
@admin_required
def user_management():
    return render_template('user-management.html')

@app.route('/admin/gallery')
@login_required
@editor_required
def admin_gallery_management():
    return render_template('gallery-management-admin.html')

@app.route('/admin/messages')
@login_required
@editor_required
def admin_messages_management():
    return render_template('messages-management.html')

@app.route('/gallery')
def gallery():
    # Check for responsive URL parameter
    responsive = request.args.get('responsive', '0')
    if responsive == '1':
        return render_template('responsive-gallery.html', now=datetime.now())
    return render_template('gallery.html', now=datetime.now())

@app.route('/responsive-gallery')
def responsive_gallery():
    """Render responsive gallery page"""
    return render_template('responsive-gallery.html', now=datetime.now())
    
@app.route('/books')
def books_page():
    """Render the books page with all books"""
    return render_template('books_page.html', now=datetime.now())
    
@app.route('/articles')
def articles_page():
    """Render the articles page with all articles"""
    from models import Article
    # Load articles directly from the database
    articles = Article.query.order_by(Article.created_at.desc()).all()
    return render_template('articles_page.html', articles=articles, now=datetime.now())
    

@app.route('/login-link')
def login_link():
    return render_template('login-link.html')
    
@app.route('/login-button')
def login_button():
    return render_template('login_button.html')

# Authentication routes
@app.route('/login-form')
def login_form():
    # Always serve the login form through this route, regardless of authentication status
    return render_template('login_form.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    # For GET requests, redirect to the login form
    if request.method == 'GET':
        return redirect(url_for('login_form'))
        
    # Handle POST requests (API login)
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

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect('/')

@app.route('/api/auth-status')
def auth_status():
    if current_user.is_authenticated:
        return jsonify({
            'authenticated': True,
            'username': current_user.username,
            'role': current_user.role,
            'id': current_user.id,
            'last_login': current_user.last_login.strftime('%Y-%m-%d %H:%M:%S') if current_user.last_login else None
        })
    else:
        return jsonify({'authenticated': False})

# Books API Endpoints
@app.route('/api/books', methods=['GET'])
def get_books():
    # إضافة رأس التحكم بالتخزين المؤقت (Cache-Control) للمتصفح
    # تخزين البيانات لمدة 5 دقائق (300 ثانية) للتحسين من سرعة التحميل
    books = Book.query.all()
    response = jsonify({'books': [book.to_dict() for book in books]})
    response.headers['Cache-Control'] = 'public, max-age=300'
    return response

@app.route('/api/books/<int:book_id>', methods=['GET'])
def get_book(book_id):
    book = Book.query.get_or_404(book_id)
    return jsonify({'book': book.to_dict()})

@app.route('/api/books', methods=['POST'])
@login_required
@editor_required
def add_book():
    data = request.json
    
    # Check for required fields, allowing download to be empty or optional
    required_fields = ['title', 'language', 'category', 'cover', 'description']
    if not all(key in data for key in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Set default value for download if not provided or empty
    download_url = data.get('download', '#')
    if not download_url or download_url.strip() == '':
        download_url = '#'  # Default placeholder value
    
    # Print debug information
    print(f"Adding book: {data['title']}, download URL: {download_url}")
    
    new_book = Book(
        title=data['title'],
        language=data['language'],
        category=data['category'],
        cover=data['cover'],
        download=download_url,
        description=data['description']
    )
    
    db.session.add(new_book)
    db.session.commit()
    
    return jsonify({'message': 'Book added successfully', 'book': new_book.to_dict()}), 201

@app.route('/api/books/<int:book_id>', methods=['PUT'])
@login_required
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
    
    # Handle download URL - set to default '#' if empty
    if 'download' in data:
        download_url = data['download']
        if not download_url or download_url.strip() == '':
            download_url = '#'
        book.download = download_url
    
    if 'description' in data:
        book.description = data['description']
    
    # Print debug information
    print(f"Updating book: {book.title}, download URL: {book.download}")
    
    db.session.commit()
    
    return jsonify({'message': 'Book updated successfully', 'book': book.to_dict()})

@app.route('/api/books/<int:book_id>', methods=['DELETE'])
@login_required
@editor_required
def delete_book(book_id):
    book = Book.query.get_or_404(book_id)
    
    db.session.delete(book)
    db.session.commit()
    
    return jsonify({'message': 'Book deleted successfully'})

# Articles API Endpoints
@app.route('/api/articles', methods=['GET'])
def get_articles():
    # إضافة رأس التحكم بالتخزين المؤقت (Cache-Control) للمقالات
    # تخزين البيانات لمدة 5 دقائق (300 ثانية) للتحسين من سرعة التحميل
    articles = Article.query.all()
    response = jsonify({'articles': [article.to_dict() for article in articles]})
    response.headers['Cache-Control'] = 'public, max-age=300'
    return response

@app.route('/api/articles/<int:article_id>', methods=['GET'])
def get_article(article_id):
    article = Article.query.get_or_404(article_id)
    return jsonify({'article': article.to_dict()})

@app.route('/api/articles', methods=['POST'])
@login_required
@editor_required
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
@login_required
@editor_required
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
@login_required
@editor_required
def delete_article(article_id):
    article = Article.query.get_or_404(article_id)
    
    db.session.delete(article)
    db.session.commit()
    
    return jsonify({'message': 'Article deleted successfully'})

# Gallery API Endpoints
@app.route('/api/gallery', methods=['GET'])
def get_gallery():
    # إضافة رأس التحكم بالتخزين المؤقت (Cache-Control) للمعرض
    # تخزين البيانات لمدة 10 دقائق (600 ثانية) للتحسين من سرعة التحميل
    images = GalleryImage.query.all()
    response = jsonify({'images': [image.to_dict() for image in images]})
    response.headers['Cache-Control'] = 'public, max-age=600'
    return response

@app.route('/api/gallery/<int:image_id>', methods=['GET'])
def get_gallery_image(image_id):
    image = GalleryImage.query.get_or_404(image_id)
    return jsonify({'image': image.to_dict()})

@app.route('/api/gallery', methods=['POST'])
@login_required
@editor_required
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
@login_required
@editor_required
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
@login_required
@editor_required
def delete_gallery_image(image_id):
    image = GalleryImage.query.get_or_404(image_id)
    
    db.session.delete(image)
    db.session.commit()
    
    return jsonify({'message': 'Image deleted successfully'})

# Contact Form API Endpoints
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

@app.route('/api/contact-messages', methods=['GET'])
@login_required
@editor_required
def get_contact_messages():
    messages = ContactMessage.query.order_by(ContactMessage.created_at.desc()).all()
    return jsonify({'messages': [message.to_dict() for message in messages]})

@app.route('/api/contact-messages/<int:message_id>', methods=['GET'])
@login_required
@editor_required
def get_contact_message(message_id):
    message = ContactMessage.query.get_or_404(message_id)
    return jsonify({'message': message.to_dict()})

@app.route('/api/contact-messages/<int:message_id>', methods=['DELETE'])
@login_required
@editor_required
def delete_contact_message(message_id):
    message = ContactMessage.query.get_or_404(message_id)
    
    db.session.delete(message)
    db.session.commit()
    
    return jsonify({'message': 'Message deleted successfully'})

# User Management API Endpoints
@app.route('/api/users', methods=['GET'])
@login_required
@admin_required
def get_users():
    users = User.query.all()
    return jsonify({'users': [user.to_dict() for user in users]})

@app.route('/api/users/<int:user_id>', methods=['GET'])
@login_required
@admin_required
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify({'user': user.to_dict()})

@app.route('/api/users', methods=['POST'])
@login_required
@admin_required
def add_user():
    data = request.json
    
    if not all(key in data for key in ['username', 'email', 'password', 'role']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Check if username or email already exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'اسم المستخدم موجود بالفعل'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'البريد الإلكتروني موجود بالفعل'}), 400
    
    # Create new user
    new_user = User(
        username=data['username'],
        email=data['email'],
        role=data['role'],
        active=data.get('active', True)
    )
    
    new_user.set_password(data['password'])
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'message': 'تمت إضافة المستخدم بنجاح', 'user': new_user.to_dict()}), 201

@app.route('/api/users/<int:user_id>', methods=['PUT'])
@login_required
@admin_required
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.json
    
    # Check if username or email already exists for another user
    if 'username' in data and data['username'] != user.username:
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'اسم المستخدم موجود بالفعل'}), 400
    
    if 'email' in data and data['email'] != user.email:
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'البريد الإلكتروني موجود بالفعل'}), 400
    
    # Update user fields
    if 'username' in data:
        user.username = data['username']
    if 'email' in data:
        user.email = data['email']
    if 'role' in data:
        user.role = data['role']
    if 'active' in data:
        user.active = data['active']
    if 'password' in data and data['password']:
        user.set_password(data['password'])
    
    db.session.commit()
    
    return jsonify({'message': 'تم تحديث المستخدم بنجاح', 'user': user.to_dict()})

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
@login_required
@admin_required
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    
    # Prevent deleting the current user
    if user.id == current_user.id:
        return jsonify({'error': 'لا يمكنك حذف الحساب الذي تستخدمه حالياً'}), 400
    
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({'message': 'تم حذف المستخدم بنجاح'})

@app.route('/api/users/<int:user_id>/status', methods=['PUT'])
@login_required
@admin_required
def toggle_user_status(user_id):
    user = User.query.get_or_404(user_id)
    data = request.json
    
    # Prevent disabling the current user
    if user.id == current_user.id and 'active' in data and not data['active']:
        return jsonify({'error': 'لا يمكنك تعطيل الحساب الذي تستخدمه حالياً'}), 400
    
    if 'active' in data:
        user.active = data['active']
    
    db.session.commit()
    
    return jsonify({'message': 'تم تحديث حالة المستخدم بنجاح', 'user': user.to_dict()})

# File Upload Endpoints
@app.route('/api/upload/book-cover', methods=['POST'])
@login_required
@editor_required
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
@login_required
@editor_required
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
@login_required
@editor_required
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

# User Journey API Endpoints
@app.route('/api/user/activities', methods=['GET'])
@login_required
def get_user_activities():
    """Get activities for the current user"""
    activities = UserActivity.query.filter_by(user_id=current_user.id).order_by(UserActivity.created_at.desc()).limit(50).all()
    return jsonify({'activities': [activity.to_dict() for activity in activities]})

@app.route('/api/user/record-activity', methods=['POST'])
@login_required
def record_user_activity():
    """Record a new user activity"""
    data = request.json
    
    if 'activity_type' not in data:
        return jsonify({'error': 'نوع النشاط مطلوب'}), 400
    
    activity = current_user.record_activity(
        activity_type=data['activity_type'],
        content_id=data.get('content_id'),
        content_type=data.get('content_type'),
        content_title=data.get('content_title'),
        metadata=data.get('metadata')
    )
    
    db.session.commit()
    
    return jsonify({
        'message': 'تم تسجيل النشاط بنجاح',
        'activity': activity.to_dict()
    })

@app.route('/api/user/statistics', methods=['GET'])
@login_required
def get_user_statistics():
    """Get activity statistics for the current user"""
    # Count books viewed
    books_viewed = UserActivity.query.filter_by(
        user_id=current_user.id, 
        activity_type='view_book'
    ).distinct(UserActivity.content_id).count()
    
    # Count articles viewed
    articles_viewed = UserActivity.query.filter_by(
        user_id=current_user.id, 
        activity_type='view_article'
    ).distinct(UserActivity.content_id).count()
    
    # Count books downloaded
    downloads = UserActivity.query.filter_by(
        user_id=current_user.id, 
        activity_type='download_book'
    ).count()
    
    # Count active days
    active_days_query = db.session.query(
        db.func.date_trunc('day', UserActivity.created_at)
    ).filter(
        UserActivity.user_id == current_user.id
    ).distinct().count()
    
    return jsonify({
        'books_viewed': books_viewed,
        'articles_viewed': articles_viewed,
        'downloads': downloads,
        'active_days': active_days_query
    })

@app.route('/api/user/recommendations', methods=['GET'])
@login_required
def get_user_recommendations():
    """Get content recommendations for the current user"""
    # Get user preferences to personalize recommendations
    preferences = current_user.get_preferences()
    preferred_categories = preferences.get('categories', [])
    preferred_language = preferences.get('preferred_language', 'all')
    
    # Base query for books
    book_query = Book.query
    
    # Apply category filter if preferences exist
    if preferred_categories:
        book_query = book_query.filter(Book.category.in_(preferred_categories))
    
    # Apply language filter if set to something other than 'all'
    if preferred_language and preferred_language != 'all':
        book_query = book_query.filter_by(language=preferred_language)
    
    # Get recent books to recommend
    books = book_query.order_by(Book.created_at.desc()).limit(3).all()
    
    # Get recent articles to recommend
    articles = Article.query.order_by(Article.created_at.desc()).limit(3).all()
    
    # Create recommendations list
    recommendations = []
    
    # Add books to recommendations
    for book in books:
        recommendations.append({
            'id': book.id,
            'title': book.title,
            'type': 'book',
            'cover': book.cover,
            'language': book.language,
            'category': book.category
        })
    
    # Add articles to recommendations
    for article in articles:
        recommendations.append({
            'id': article.id,
            'title': article.title,
            'type': 'article',
            'summary': article.summary
        })
    
    return jsonify({
        'recommendations': recommendations
    })

@app.route('/api/user/preferences', methods=['GET'])
@login_required
def get_user_preferences():
    """Get preferences for the current user"""
    preferences = current_user.get_preferences()
    return jsonify({'preferences': preferences})

@app.route('/api/user/preferences', methods=['POST'])
@login_required
def update_user_preferences():
    """Update preferences for the current user"""
    data = request.json
    
    if 'preferences' not in data:
        return jsonify({'error': 'التفضيلات مطلوبة'}), 400
    
    current_user.set_preferences(data['preferences'])
    db.session.commit()
    
    return jsonify({
        'message': 'تم تحديث التفضيلات بنجاح',
        'preferences': current_user.get_preferences()
    })

@app.route('/api/upload/article-image', methods=['POST'])
@login_required
@editor_required
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
