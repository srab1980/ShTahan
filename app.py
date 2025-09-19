"""
Main Flask application for the Sheikh Mustafa Al-Tahhan website.

This file initializes the Flask application, configures the database,
and defines all the routes and API endpoints for the website.
It handles serving HTML pages, user authentication, and a RESTful API
for managing content like books, articles, and gallery images.
"""
import os
import logging
import uuid
import json
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename
from flask import Flask, render_template, request, jsonify, url_for, send_from_directory, redirect, flash, session, make_response
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from sqlalchemy import func, desc, func as sqlafunc
from functools import wraps
from database import db

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Create Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "default_secret_key")

# Configure proper response headers
@app.after_request
def add_header(response):
    """Adds headers to prevent caching of responses."""
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '-1'
    return response

# Security configuration for session cookies
app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = 86400  # 1 day

# Configure database
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "postgresql://neondb_owner:npg_HwBp7WMGd4ni@ep-flat-hall-a4pn3nar.us-east-1.aws.neon.tech/neondb?sslmode=require")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}

# Configure file uploads
app.config['UPLOAD_FOLDER'] = 'static/uploads'
os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'gallery'), exist_ok=True)
os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'books'), exist_ok=True)
os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'articles'), exist_ok=True)
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
    """Loads a user from the database for Flask-Login."""
    return User.query.get(int(user_id))

# --- Authorization Decorators ---

def admin_required(f):
    """Decorator to restrict access to admin users."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or not current_user.is_admin():
            return jsonify({'error': 'غير مصرح. يتطلب صلاحيات المسؤول'}), 403
        return f(*args, **kwargs)
    return decorated_function

def editor_required(f):
    """Decorator to restrict access to editor and admin users."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or not current_user.is_editor():
            return jsonify({'error': 'غير مصرح. يتطلب صلاحيات المحرر على الأقل'}), 403
        return f(*args, **kwargs)
    return decorated_function

# --- Helper Functions ---

def allowed_file(filename):
    """Checks if a filename has an allowed extension.

    Args:
        filename (str): The name of the file to check.

    Returns:
        bool: True if the file extension is allowed, False otherwise.
    """
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def generate_unique_filename(filename):
    """Generates a unique filename using UUID4 to prevent collisions.

    Args:
        filename (str): The original filename.

    Returns:
        str: The new, unique filename.
    """
    ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    unique_name = f"{uuid.uuid4().hex}.{ext}"
    return unique_name

# --- Frontend Page Routes ---

@app.route('/')
def index():
    """Renders the homepage.

    Fetches the 6 latest articles to display on the main page.
    """
    latest_articles = Article.query.order_by(Article.created_at.desc()).limit(6).all()
    return render_template('index.html', articles=latest_articles, now=datetime.now())

@app.route('/admin')
@login_required
def admin_dashboard():
    """Renders the main admin dashboard page."""
    return render_template('admin.html')

@app.route('/admin/books')
@login_required
@editor_required
def books_management():
    """Renders the book management page for admins/editors."""
    return render_template('books-management.html')

@app.route('/admin/articles')
@login_required
def articles_management():
    """Renders the article management page for admins/editors."""
    print("تم الوصول إلى صفحة إدارة المقالات بنجاح!")
    return render_template('articles-management.html')

@app.route('/articles-management-test')
def articles_management_test():
    """A test route for the articles management page without authentication."""
    print("تم الوصول إلى صفحة اختبار إدارة المقالات بدون التحقق من الصلاحيات!")
    return render_template('articles-management.html')

@app.route('/admin/users')
@login_required
@admin_required
def user_management():
    """Renders the user management page for admins."""
    return render_template('user-management.html')

@app.route('/admin/gallery')
@login_required
@editor_required
def admin_gallery_management():
    """Renders the gallery management page for admins/editors."""
    return render_template('gallery-management-admin.html')

@app.route('/admin/messages')
@login_required
@editor_required
def admin_messages_management():
    """Renders the contact messages management page for admins/editors."""
    return render_template('messages-management.html')

@app.route('/gallery')
def gallery():
    """Renders the image gallery page.

    Supports a 'responsive' query parameter to render an alternative layout.
    """
    responsive = request.args.get('responsive', '0')
    if responsive == '1':
        return render_template('responsive-gallery.html', now=datetime.now())
    return render_template('gallery.html', now=datetime.now())

@app.route('/responsive-gallery')
def responsive_gallery():
    """Renders the responsive gallery page directly."""
    return render_template('responsive-gallery.html', now=datetime.now())

@app.route('/books')
def books_page():
    """Renders the main books listing page."""
    return render_template('books_page.html', now=datetime.now())

@app.route('/articles-all')
def articles_all_page():
    """Redirects the old '/articles-all' URL to the new '/articles' page."""
    return redirect(url_for('articles_page'))

@app.route('/articles')
def articles_page():
    """Renders the main articles listing page.

    Fetches all distinct article categories to populate the filter buttons.
    """
    categories = db.session.query(Article.category).distinct().all()
    categories = [cat[0] for cat in categories if cat[0]]
    if not categories:
        categories = ['فكر إسلامي', 'تربية', 'مجتمع', 'سياسة', 'تاريخ']
    return render_template('articles_simple.html', categories=categories, now=datetime.now())

@app.route('/user-journey')
def user_journey():
    """Renders the user's personal journey/activity page."""
    is_authenticated = current_user.is_authenticated
    return render_template('user_journey.html', now=datetime.now(), is_authenticated=is_authenticated)

# --- Component & Form Routes ---

@app.route('/login-link')
def login_link():
    """Renders a simple login link component."""
    return render_template('login-link.html')

@app.route('/login-button')
def login_button():
    """Renders a simple login button component."""
    return render_template('login_button.html')

@app.route('/login-form')
def login_form():
    """Renders the login form page."""
    return render_template('login_form.html')

@app.route('/signup-form')
def signup_form():
    """Renders the signup form page."""
    return render_template('signup_form.html')

@app.route('/password-reset-form')
def password_reset_form():
    """Renders the password reset form page."""
    return render_template('password_reset_form.html')

@app.route('/change-password-form')
@login_required
def change_password_form():
    """Renders the change password form for authenticated users."""
    return render_template('change_password_form.html')

# --- Authentication API Endpoints ---

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Handles user login.

    GET requests redirect to the login form page.
    POST requests handle the API login logic, authenticating the user
    and creating a session.
    """
    if request.method == 'GET':
        return redirect(url_for('login_form'))

    if request.method == 'POST':
        data = request.json
        if not all(key in data for key in ['username', 'password']):
            return jsonify({'error': 'يرجى تقديم اسم المستخدم وكلمة المرور'}), 400

        user = User.query.filter_by(username=data['username']).first()
        if user is None or not user.check_password(data['password']):
            return jsonify({'error': 'اسم المستخدم أو كلمة المرور غير صحيحة'}), 401

        if not user.active:
            return jsonify({'error': 'تم تعطيل هذا الحساب، يرجى الاتصال بالمسؤول'}), 403

        user.last_login = datetime.utcnow()
        db.session.commit()
        login_user(user)
        return jsonify({
            'message': 'تم تسجيل الدخول بنجاح',
            'user': {'id': user.id, 'username': user.username, 'role': user.role}
        })

@app.route('/logout')
@login_required
def logout():
    """Logs the current user out and redirects to the homepage."""
    logout_user()
    return redirect('/')

@app.route('/signup', methods=['POST'])
def signup():
    """Handles new user registration.

    Validates input and creates a new user with the 'user' role.
    """
    data = request.json
    if not all(key in data for key in ['username', 'email', 'password']):
        return jsonify({'error': 'يرجى تقديم جميع المعلومات المطلوبة'}), 400
    if len(data['password']) < 8:
        return jsonify({'error': 'يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل'}), 400
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'اسم المستخدم موجود بالفعل'}), 400
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'البريد الإلكتروني موجود بالفعل'}), 400

    new_user = User(
        username=data['username'],
        email=data['email'],
        role='user',
        active=True
    )
    new_user.set_password(data['password'])
    db.session.add(new_user)
    db.session.commit()
    return jsonify({
        'message': 'تم إنشاء الحساب بنجاح',
        'user': {'id': new_user.id, 'username': new_user.username, 'role': new_user.role}
    }), 201

# --- Password Reset API Endpoints ---

@app.route('/password-reset/request', methods=['POST'])
def password_reset_request():
    """Handles a password reset request.

    In a real app, this would generate and email a reset token. Here, it
    simulates the success response for demonstration purposes.
    """
    data = request.json
    if 'email' not in data:
        return jsonify({'error': 'البريد الإلكتروني مطلوب'}), 400
    user = User.query.filter_by(email=data['email']).first()
    # Always return a success message to prevent user enumeration.
    return jsonify({'message': 'إذا كان البريد الإلكتروني موجوداً في نظامنا، فستتم إرسال تعليمات إعادة تعيين كلمة المرور.'}), 200

@app.route('/password-reset/verify', methods=['POST'])
def password_reset_verify():
    """Handles verification of a password reset code.

    Simulates code verification for demonstration.
    """
    data = request.json
    if not all(key in data for key in ['email', 'code']):
        return jsonify({'error': 'البريد الإلكتروني ورمز التحقق مطلوبان'}), 400
    if data['code'] == '123456':
        return jsonify({'message': 'تم التحقق من الرمز بنجاح'}), 200
    else:
        return jsonify({'error': 'رمز التحقق غير صالح أو منتهي الصلاحية'}), 400

@app.route('/password-reset/reset', methods=['POST'])
def password_reset_confirm():
    """Handles the final password reset action."""
    data = request.json
    if not all(key in data for key in ['email', 'password']):
        return jsonify({'error': 'البريد الإلكتروني وكلمة المرور الجديدة مطلوبان'}), 400
    if len(data['password']) < 8:
        return jsonify({'error': 'يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل'}), 400

    user = User.query.filter_by(email=data['email']).first()
    if not user:
        return jsonify({'error': 'المستخدم غير موجود'}), 404

    user.set_password(data['password'])
    db.session.commit()
    return jsonify({'message': 'تم تغيير كلمة المرور بنجاح'}), 200

@app.route('/api/change-password', methods=['POST'])
@login_required
def change_password():
    """Allows a logged-in user to change their own password."""
    data = request.json
    if not all(key in data for key in ['current_password', 'new_password']):
        return jsonify({'error': 'كلمة المرور الحالية والجديدة مطلوبة'}), 400
    if len(data['new_password']) < 8:
        return jsonify({'error': 'يجب أن تحتوي كلمة المرور الجديدة على 8 أحرف على الأقل'}), 400
    if not current_user.check_password(data['current_password']):
        return jsonify({'error': 'كلمة المرور الحالية غير صحيحة'}), 401
    if data['current_password'] == data['new_password']:
        return jsonify({'error': 'كلمة المرور الجديدة يجب أن تكون مختلفة عن كلمة المرور الحالية'}), 400

    current_user.set_password(data['new_password'])
    db.session.commit()
    return jsonify({'message': 'تم تغيير كلمة المرور بنجاح'}), 200

@app.route('/api/auth-status')
def auth_status():
    """Returns the authentication status of the current user."""
    if current_user.is_authenticated:
        data = {
            'authenticated': True,
            'username': current_user.username,
            'role': current_user.role,
            'id': current_user.id,
            'show_journey_in_dropdown': False,
            'last_login': current_user.last_login.strftime('%Y-%m-%d %H:%M:%S') if current_user.last_login else None
        }
    else:
        data = {'authenticated': False}
    response = make_response(jsonify(data))
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

# --- Books API Endpoints ---

@app.route('/api/books', methods=['GET'])
def get_books():
    """Retrieves a list of all books."""
    books = Book.query.all()
    response = jsonify({'books': [book.to_dict() for book in books]})
    response.headers['Cache-Control'] = 'public, max-age=300'
    return response

@app.route('/api/books/<int:book_id>', methods=['GET'])
def get_book(book_id):
    """Retrieves a single book by its ID."""
    book = Book.query.get_or_404(book_id)
    return jsonify({'book': book.to_dict()})

@app.route('/api/books', methods=['POST'])
@login_required
@editor_required
def add_book():
    """Adds a new book to the database."""
    data = request.json
    required_fields = ['title', 'language', 'category', 'cover', 'description']
    if not all(key in data for key in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    download_url = data.get('download', '#')
    if not download_url or download_url.strip() == '':
        download_url = '#'

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
    """Updates an existing book."""
    book = Book.query.get_or_404(book_id)
    data = request.json
    book.title = data.get('title', book.title)
    book.language = data.get('language', book.language)
    book.category = data.get('category', book.category)
    book.cover = data.get('cover', book.cover)
    book.description = data.get('description', book.description)

    if 'download' in data:
        download_url = data['download']
        book.download = '#' if not download_url or download_url.strip() == '' else download_url

    db.session.commit()
    return jsonify({'message': 'Book updated successfully', 'book': book.to_dict()})

@app.route('/api/books/<int:book_id>', methods=['DELETE'])
@login_required
@editor_required
def delete_book(book_id):
    """Deletes a book from the database."""
    book = Book.query.get_or_404(book_id)
    db.session.delete(book)
    db.session.commit()
    return jsonify({'message': 'Book deleted successfully'})

# --- Articles API Endpoints ---

@app.route('/api/articles', methods=['GET'])
def get_articles():
    """Retrieves a list of articles, with optional filtering and sorting."""
    sort_by = request.args.get('sort_by', 'latest')
    limit = request.args.get('limit', type=int)
    category = request.args.get('category')

    query = Article.query
    if category:
        query = query.filter_by(category=category)

    if sort_by == 'popular':
        query = query.order_by(Article.created_at.desc())  # Popularity logic can be added here
    else:
        query = query.order_by(Article.created_at.desc())

    if limit:
        query = query.limit(limit)

    articles = query.all()
    response = jsonify({'articles': [article.to_dict() for article in articles]})
    response.headers['Cache-Control'] = 'public, max-age=300'
    return response

@app.route('/api/articles/<int:article_id>', methods=['GET'])
def get_article(article_id):
    """Retrieves a single article by its ID."""
    article = Article.query.get_or_404(article_id)
    return jsonify({'article': article.to_dict()})

@app.route('/api/articles', methods=['POST'])
@login_required
@editor_required
def add_article():
    """Adds a new article to the database."""
    data = request.json
    if not all(key in data for key in ['title', 'summary', 'content']):
        return jsonify({'error': 'Missing required fields'}), 400

    new_article = Article(
        title=data['title'],
        summary=data['summary'],
        content=data['content'],
        category=data.get('category', 'عام'),
        image=data.get('image')
    )
    db.session.add(new_article)
    db.session.commit()
    return jsonify({'message': 'Article added successfully', 'article': new_article.to_dict()}), 201

@app.route('/api/articles/<int:article_id>', methods=['PUT'])
@login_required
@editor_required
def update_article(article_id):
    """Updates an existing article."""
    article = Article.query.get_or_404(article_id)
    data = request.json
    article.title = data.get('title', article.title)
    article.summary = data.get('summary', article.summary)
    article.content = data.get('content', article.content)
    article.category = data.get('category', article.category)
    article.image = data.get('image', article.image)
    db.session.commit()
    return jsonify({'message': 'Article updated successfully', 'article': article.to_dict()})

@app.route('/api/articles/<int:article_id>', methods=['DELETE'])
@login_required
@editor_required
def delete_article(article_id):
    """Deletes an article from the database."""
    article = Article.query.get_or_404(article_id)
    db.session.delete(article)
    db.session.commit()
    return jsonify({'message': 'Article deleted successfully'})

# --- Gallery API Endpoints ---

@app.route('/api/gallery', methods=['GET'])
def get_gallery():
    """Retrieves a list of all gallery images."""
    images = GalleryImage.query.all()
    response = jsonify({'images': [image.to_dict() for image in images]})
    response.headers['Cache-Control'] = 'public, max-age=600'
    return response

@app.route('/api/gallery/<int:image_id>', methods=['GET'])
def get_gallery_image(image_id):
    """Retrieves a single gallery image by its ID."""
    image = GalleryImage.query.get_or_404(image_id)
    return jsonify({'image': image.to_dict()})

@app.route('/api/gallery', methods=['POST'])
@login_required
@editor_required
def add_gallery_image():
    """Adds a new image to the gallery."""
    data = request.json
    if not all(key in data for key in ['url', 'caption']):
        return jsonify({'error': 'Missing required fields'}), 400

    new_image = GalleryImage(url=data['url'], caption=data['caption'])
    db.session.add(new_image)
    db.session.commit()
    return jsonify({'message': 'Image added successfully', 'image': new_image.to_dict()}), 201

@app.route('/api/gallery/<int:image_id>', methods=['PUT'])
@login_required
@editor_required
def update_gallery_image(image_id):
    """Updates an existing gallery image."""
    image = GalleryImage.query.get_or_404(image_id)
    data = request.json
    image.url = data.get('url', image.url)
    image.caption = data.get('caption', image.caption)
    db.session.commit()
    return jsonify({'message': 'Image updated successfully', 'image': image.to_dict()})

@app.route('/api/gallery/<int:image_id>', methods=['DELETE'])
@login_required
@editor_required
def delete_gallery_image(image_id):
    """Deletes a gallery image."""
    image = GalleryImage.query.get_or_404(image_id)
    db.session.delete(image)
    db.session.commit()
    return jsonify({'message': 'Image deleted successfully'})

# --- Contact Form API Endpoints ---

@app.route('/api/contact', methods=['POST'])
def submit_contact():
    """Saves a message from the contact form to the database."""
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
    """Retrieves all contact form messages."""
    messages = ContactMessage.query.order_by(ContactMessage.created_at.desc()).all()
    return jsonify({'messages': [message.to_dict() for message in messages]})

@app.route('/api/contact-messages/<int:message_id>', methods=['GET'])
@login_required
@editor_required
def get_contact_message(message_id):
    """Retrieves a single contact message by its ID."""
    message = ContactMessage.query.get_or_404(message_id)
    return jsonify({'message': message.to_dict()})

@app.route('/api/contact-messages/<int:message_id>', methods=['DELETE'])
@login_required
@editor_required
def delete_contact_message(message_id):
    """Deletes a contact message."""
    message = ContactMessage.query.get_or_404(message_id)
    db.session.delete(message)
    db.session.commit()
    return jsonify({'message': 'Message deleted successfully'})

# --- User Management API Endpoints ---

@app.route('/api/users', methods=['GET'])
@login_required
@admin_required
def get_users():
    """Retrieves a list of all users."""
    users = User.query.all()
    return jsonify({'users': [user.to_dict() for user in users]})

@app.route('/api/users/<int:user_id>', methods=['GET'])
@login_required
@admin_required
def get_user(user_id):
    """Retrieves a single user by their ID."""
    user = User.query.get_or_404(user_id)
    return jsonify({'user': user.to_dict()})

@app.route('/api/users', methods=['POST'])
@login_required
@admin_required
def add_user():
    """Adds a new user (admin-only)."""
    data = request.json
    if not all(key in data for key in ['username', 'email', 'password', 'role']):
        return jsonify({'error': 'Missing required fields'}), 400
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'اسم المستخدم موجود بالفعل'}), 400
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'البريد الإلكتروني موجود بالفعل'}), 400

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
    """Updates an existing user's details (admin-only)."""
    user = User.query.get_or_404(user_id)
    data = request.json
    if 'username' in data and data['username'] != user.username and User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'اسم المستخدم موجود بالفعل'}), 400
    if 'email' in data and data['email'] != user.email and User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'البريد الإلكتروني موجود بالفعل'}), 400

    user.username = data.get('username', user.username)
    user.email = data.get('email', user.email)
    user.role = data.get('role', user.role)
    user.active = data.get('active', user.active)
    if 'password' in data and data['password']:
        user.set_password(data['password'])

    db.session.commit()
    return jsonify({'message': 'تم تحديث المستخدم بنجاح', 'user': user.to_dict()})

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
@login_required
@admin_required
def delete_user(user_id):
    """Deletes a user (admin-only)."""
    user = User.query.get_or_404(user_id)
    if user.id == current_user.id:
        return jsonify({'error': 'لا يمكنك حذف الحساب الذي تستخدمه حالياً'}), 400
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'تم حذف المستخدم بنجاح'})

@app.route('/api/users/<int:user_id>/status', methods=['PUT'])
@login_required
@admin_required
def toggle_user_status(user_id):
    """Toggles a user's active status (admin-only)."""
    user = User.query.get_or_404(user_id)
    data = request.json
    if user.id == current_user.id and 'active' in data and not data['active']:
        return jsonify({'error': 'لا يمكنك تعطيل الحساب الذي تستخدمه حالياً'}), 400
    if 'active' in data:
        user.active = data['active']
    db.session.commit()
    return jsonify({'message': 'تم تحديث حالة المستخدم بنجاح', 'user': user.to_dict()})

# --- File Upload API Endpoints ---

@app.route('/api/upload/book-cover', methods=['POST'])
@login_required
@editor_required
def upload_book_cover():
    """Handles uploading a book cover image."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    if file and allowed_file(file.filename):
        filename = generate_unique_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], 'books', filename)
        file.save(file_path)
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
    """Handles uploading a book PDF file."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    if file and file.filename.lower().endswith('.pdf'):
        filename = generate_unique_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], 'books', filename)
        file.save(file_path)
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
    """Handles uploading a gallery image."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    if file and allowed_file(file.filename) and file.filename.lower().endswith(('png', 'jpg', 'jpeg', 'gif')):
        filename = generate_unique_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], 'gallery', filename)
        file.save(file_path)
        return jsonify({
            'message': 'Image uploaded successfully',
            'file_url': f"/static/uploads/gallery/{filename}"
        }), 201
    else:
        return jsonify({'error': 'File must be an image (PNG, JPG, JPEG, GIF)'}), 400

@app.route('/api/upload/article-image', methods=['POST'])
@login_required
@editor_required
def upload_article_image():
    """Handles uploading an image for an article."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    if file and allowed_file(file.filename) and file.filename.lower().endswith(('png', 'jpg', 'jpeg', 'gif')):
        filename = generate_unique_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], 'articles', filename)
        file.save(file_path)
        return jsonify({
            'message': 'Image uploaded successfully',
            'file_url': f"/static/uploads/articles/{filename}"
        }), 201
    else:
        return jsonify({'error': 'File must be an image (PNG, JPG, JPEG, GIF)'}), 400

# --- User Journey & Recommendations API Endpoints ---

@app.route('/api/user/activities', methods=['GET'])
def get_user_activities():
    """Retrieves the activity history for the current logged-in user."""
    if not current_user.is_authenticated:
        return jsonify({'error': 'يرجى تسجيل الدخول للوصول إلى هذه البيانات', 'authenticated': False}), 401

    activities = UserActivity.query.filter_by(user_id=current_user.id).order_by(UserActivity.created_at.desc()).limit(50).all()
    return jsonify({'activities': [activity.to_dict() for activity in activities], 'authenticated': True})

@app.route('/api/admin/recent-activities')
@login_required
@editor_required
def get_recent_activities():
    """Retrieves the most recent activities across all users for the admin dashboard."""
    activities = UserActivity.query.order_by(UserActivity.created_at.desc()).limit(15).all()
    activity_list = []
    for activity in activities:
        user = User.query.get(activity.user_id)
        if user:
            activity_dict = activity.to_dict()
            activity_dict['username'] = user.username
            activity_list.append(activity_dict)
    return jsonify({'activities': activity_list})

@app.route('/api/user/record-activity', methods=['POST'])
def record_user_activity():
    """Records an activity for the current logged-in user."""
    if not current_user.is_authenticated:
        return jsonify({'error': 'يرجى تسجيل الدخول لتسجيل النشاط', 'authenticated': False}), 401

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
        'activity': activity.to_dict(),
        'authenticated': True
    })

@app.route('/api/user/statistics', methods=['GET'])
def get_user_statistics():
    """Retrieves usage statistics for the current logged-in user."""
    if not current_user.is_authenticated:
        return jsonify({'error': 'يرجى تسجيل الدخول للوصول إلى هذه البيانات', 'authenticated': False}), 401

    books_viewed = UserActivity.query.filter_by(user_id=current_user.id, activity_type='view_book').distinct(UserActivity.content_id).count()
    articles_viewed = UserActivity.query.filter_by(user_id=current_user.id, activity_type='view_article').distinct(UserActivity.content_id).count()
    downloads = UserActivity.query.filter_by(user_id=current_user.id, activity_type='download_book').count()
    active_days = db.session.query(db.func.date_trunc('day', UserActivity.created_at)).filter(UserActivity.user_id == current_user.id).distinct().count()

    return jsonify({
        'books_viewed': books_viewed,
        'articles_viewed': articles_viewed,
        'downloads': downloads,
        'active_days': active_days,
        'authenticated': True
    })

@app.route('/api/user/recommendations', methods=['GET'])
def get_user_recommendations():
    """Generates and retrieves content recommendations for the current user."""
    if not current_user.is_authenticated:
        return jsonify({'error': 'يرجى تسجيل الدخول للوصول إلى هذه البيانات', 'authenticated': False}), 401

    preferences = current_user.get_preferences()
    history_based = get_recommendations_from_history(current_user.id)
    pref_based = get_recommendations_from_preferences(current_user, history_based)
    trending = get_trending_content(history_based + pref_based)

    # Combine and flatten recommendations
    all_recs = history_based + pref_based + trending
    # Remove duplicates
    seen = set()
    unique_recs = []
    for rec in all_recs:
        rec_id = (rec['type'], rec['id'])
        if rec_id not in seen:
            unique_recs.append(rec)
            seen.add(rec_id)

    return jsonify({
        'recommendations': unique_recs[:8],
        'authenticated': True
    })

def get_recommendations_from_history(user_id, limit=5):
    """Generates recommendations based on a user's recent activity."""
    recent_activities = UserActivity.query.filter_by(
        user_id=user_id, content_type='book'
    ).order_by(UserActivity.created_at.desc()).limit(10).all()

    if not recent_activities:
        return []

    viewed_book_ids = {act.content_id for act in recent_activities if act.content_id}
    # Logic to find similar books can be implemented here
    # For now, returns an empty list
    return []

def get_recommendations_from_preferences(user, existing_recs, limit=3):
    """Generates recommendations based on user's stated preferences."""
    # This is a placeholder for preference-based recommendation logic
    return []

def get_trending_content(existing_recs, book_limit=3, article_limit=2):
    """Gets trending books and articles that are not already recommended."""
    # This is a placeholder for trending content logic
    return []

def get_trending_books(limit=3):
    """
    Get trending books based on view and download counts in the last 30 days.
    """
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    book_activities = db.session.query(
        UserActivity.content_id,
        func.count(UserActivity.id).label('activity_count')
    ).filter(
        UserActivity.content_type == 'book',
        UserActivity.created_at >= thirty_days_ago
    ).group_by(UserActivity.content_id).order_by(desc('activity_count')).limit(limit).all()

    trending_books = [Book.query.get(book_id) for book_id, _ in book_activities if Book.query.get(book_id)]
    # Supplement with newest if not enough trending books
    if len(trending_books) < limit:
        existing_ids = [b.id for b in trending_books]
        additional_books = Book.query.filter(Book.id.notin_(existing_ids)).order_by(Book.created_at.desc()).limit(limit - len(trending_books)).all()
        trending_books.extend(additional_books)
    return trending_books

def get_trending_articles(limit=2):
    """
    Get trending articles based on view counts in the last 30 days.
    """
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    article_activities = db.session.query(
        UserActivity.content_id,
        func.count(UserActivity.id).label('view_count')
    ).filter(
        UserActivity.content_type == 'article',
        UserActivity.created_at >= thirty_days_ago
    ).group_by(UserActivity.content_id).order_by(desc('view_count')).limit(limit).all()

    trending_articles = [Article.query.get(article_id) for article_id, _ in article_activities if Article.query.get(article_id)]
    # Supplement with newest if not enough trending articles
    if len(trending_articles) < limit:
        existing_ids = [a.id for a in trending_articles]
        additional_articles = Article.query.filter(Article.id.notin_(existing_ids)).order_by(Article.created_at.desc()).limit(limit - len(trending_articles)).all()
        trending_articles.extend(additional_articles)
    return trending_articles

@app.route('/api/user/preferences', methods=['GET'])
@login_required
def get_user_preferences():
    """Retrieves the preferences for the current logged-in user."""
    preferences = current_user.get_preferences()
    return jsonify({'preferences': preferences, 'authenticated': True})

@app.route('/api/user/preferences', methods=['POST'])
@login_required
def update_user_preferences():
    """Updates the preferences for the current logged-in user."""
    data = request.json
    if 'preferences' not in data:
        return jsonify({'error': 'التفضيلات مطلوبة'}), 400
    current_user.set_preferences(data['preferences'])
    db.session.commit()
    return jsonify({
        'message': 'تم تحديث التفضيلات بنجاح',
        'preferences': current_user.get_preferences(),
        'authenticated': True
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)