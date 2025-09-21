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
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename
from flask import Flask, render_template, request, jsonify, url_for, send_from_directory, redirect, flash, session, make_response
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from sqlalchemy import func, desc
from functools import wraps
from database import db

# Configure logging
logging.basicConfig(level=logging.DEBUG)

def create_app(config_name='production'):
    """Create and configure the Flask application."""
    app = Flask(__name__)
    app.config['JSON_AS_ASCII'] = False
    app.secret_key = os.environ.get("SESSION_SECRET", "default_secret_key")

    # Security configuration for session cookies
    app.config['SESSION_COOKIE_SECURE'] = True
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['PERMANENT_SESSION_LIFETIME'] = 86400  # 1 day

    # Configure database
    if config_name == 'testing':
        app.config["SQLALCHEMY_DATABASE_URI"] = 'sqlite:///test.db'
        app.config['TESTING'] = True
        app.config['WTF_CSRF_ENABLED'] = False  # Disable CSRF for tests
    else:
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

    # Initialize extensions
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

    # Configure proper response headers
    @app.after_request
    def add_header(response):
        """Adds headers to prevent caching of responses."""
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '-1'
        return response

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
        """Checks if a filename has an allowed extension."""
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

    def generate_unique_filename(filename):
        """Generates a unique filename using UUID4."""
        ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
        unique_name = f"{uuid.uuid4().hex}.{ext}"
        return unique_name

    # --- Frontend Page Routes ---
    @app.route('/')
    def index():
        latest_articles = Article.query.order_by(Article.created_at.desc()).limit(6).all()
        latest_books = Book.query.order_by(Book.created_at.desc()).limit(4).all()
        return render_template('index.html', articles=latest_articles, books=latest_books, now=datetime.now())

    @app.route('/search')
    def search():
        query = request.args.get('q', '').strip()
        if not query:
            return render_template('search_results.html', results=[], query='', total_results=0)
        ts_query = func.websearch_to_tsquery('arabic', query)
        book_results = db.session.query(
            Book, func.ts_rank(Book.__ts_vector__, ts_query).label('rank')
        ).filter(Book.__ts_vector__.match(ts_query, postgresql_regconfig='arabic')).order_by(desc('rank')).all()
        article_results = db.session.query(
            Article, func.ts_rank(Article.__ts_vector__, ts_query).label('rank')
        ).filter(Article.__ts_vector__.match(ts_query, postgresql_regconfig='arabic')).order_by(desc('rank')).all()
        results = []
        for book, rank in book_results:
            results.append({'type': 'كتاب', 'item': book.to_dict(), 'rank': rank, 'url': url_for('books_page') + f'#book-{book.id}'})
        for article, rank in article_results:
            results.append({'type': 'مقال', 'item': article.to_dict(), 'rank': rank, 'url': url_for('articles_page') + f'#article-{article.id}'})
        results.sort(key=lambda x: x['rank'], reverse=True)
        return render_template('search_results.html', results=results, query=query, total_results=len(results))

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
    @login_required
    def articles_management():
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
        return render_template('gallery.html', now=datetime.now())

    @app.route('/responsive-gallery')
    def responsive_gallery():
        return render_template('responsive-gallery.html', now=datetime.now())

    @app.route('/books')
    def books_page():
        return render_template('books_page.html', now=datetime.now())

    @app.route('/articles')
    def articles_page():
        categories = db.session.query(Article.category).distinct().all()
        categories = [cat[0] for cat in categories if cat[0]]
        if not categories:
            categories = ['فكر إسلامي', 'تربية', 'مجتمع', 'سياسة', 'تاريخ']
        return render_template('articles_simple.html', categories=categories, now=datetime.now())

    @app.route('/user-journey')
    def user_journey():
        is_authenticated = current_user.is_authenticated
        return render_template('user_journey.html', now=datetime.now(), is_authenticated=is_authenticated)

    # --- Component & Form Routes ---
    @app.route('/login-link')
    def login_link():
        return render_template('login-link.html')

    @app.route('/login-button')
    def login_button():
        return render_template('login_button.html')

    @app.route('/login-form')
    def login_form():
        return render_template('login_form.html')

    @app.route('/signup-form')
    def signup_form():
        return render_template('signup_form.html')

    @app.route('/password-reset-form')
    def password_reset_form():
        return render_template('password_reset_form.html')

    @app.route('/change-password-form')
    @login_required
    def change_password_form():
        return render_template('change_password_form.html')

    # --- Auth API ---
    @app.route('/login', methods=['POST'])
    def login():
        data = request.json
        user = User.query.filter_by(username=data['username']).first()
        if user and user.check_password(data['password']):
            if user.active:
                login_user(user)
                user.last_login = datetime.utcnow()
                db.session.commit()
                return jsonify({'message': 'تم تسجيل الدخول بنجاح', 'user': user.to_dict()})
            else:
                return jsonify({'error': 'تم تعطيل هذا الحساب'}), 403
        return jsonify({'error': 'اسم المستخدم أو كلمة المرور غير صحيحة'}), 401

    @app.route('/logout')
    @login_required
    def logout():
        logout_user()
        return redirect('/')

    @app.route('/signup', methods=['POST'])
    def signup():
        data = request.json
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'اسم المستخدم موجود بالفعل'}), 400
        new_user = User(username=data['username'], email=data['email'], role='user')
        new_user.set_password(data['password'])
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'تم إنشاء الحساب بنجاح', 'user': new_user.to_dict()}), 201

    @app.route('/api/auth-status')
    def auth_status():
        if current_user.is_authenticated:
            return jsonify({'authenticated': True, 'user': current_user.to_dict()})
        return jsonify({'authenticated': False})

    # --- Books API ---
    @app.route('/api/books', methods=['GET'])
    def get_books():
        books = Book.query.all()
        return jsonify({'books': [book.to_dict() for book in books]})

    @app.route('/api/books/<int:book_id>', methods=['GET'])
    def get_book(book_id):
        book = Book.query.get_or_404(book_id)
        return jsonify({'book': book.to_dict()})

    @app.route('/api/books', methods=['POST'])
    @login_required
    @editor_required
    def add_book():
        data = request.json
        new_book = Book(
            title=data['title'], language=data['language'], category=data['category'],
            cover=data['cover'], download=data.get('download', '#'), description=data['description']
        )
        db.session.add(new_book)
        db.session.commit()
        return jsonify({'message': 'Book added', 'book': new_book.to_dict()}), 201

    @app.route('/api/books/<int:book_id>', methods=['PUT'])
    @login_required
    @editor_required
    def update_book(book_id):
        book = Book.query.get_or_404(book_id)
        data = request.json
        book.title = data.get('title', book.title)
        book.language = data.get('language', book.language)
        book.category = data.get('category', book.category)
        book.cover = data.get('cover', book.cover)
        book.description = data.get('description', book.description)
        book.download = data.get('download', book.download)
        db.session.commit()
        return jsonify({'message': 'Book updated', 'book': book.to_dict()})

    @app.route('/api/books/<int:book_id>', methods=['DELETE'])
    @login_required
    @editor_required
    def delete_book(book_id):
        book = Book.query.get_or_404(book_id)
        db.session.delete(book)
        db.session.commit()
        return jsonify({'message': 'Book deleted'})

    # --- Articles API ---
    @app.route('/api/articles', methods=['GET'])
    def get_articles():
        articles = Article.query.order_by(Article.created_at.desc()).all()
        return jsonify({'articles': [article.to_dict() for article in articles]})

    @app.route('/api/articles/<int:article_id>', methods=['GET'])
    def get_article(article_id):
        article = Article.query.get_or_404(article_id)
        return jsonify({'article': article.to_dict()})

    @app.route('/api/articles', methods=['POST'])
    @login_required
    @editor_required
    def add_article():
        data = request.json
        new_article = Article(
            title=data['title'], summary=data['summary'], content=data['content'],
            category=data.get('category', 'عام'), image=data.get('image')
        )
        db.session.add(new_article)
        db.session.commit()
        return jsonify({'message': 'Article added', 'article': new_article.to_dict()}), 201

    @app.route('/api/articles/<int:article_id>', methods=['PUT'])
    @login_required
    @editor_required
    def update_article(article_id):
        article = Article.query.get_or_404(article_id)
        data = request.json
        article.title = data.get('title', article.title)
        article.summary = data.get('summary', article.summary)
        article.content = data.get('content', article.content)
        article.category = data.get('category', article.category)
        article.image = data.get('image', article.image)
        db.session.commit()
        return jsonify({'message': 'Article updated', 'article': article.to_dict()})

    @app.route('/api/articles/<int:article_id>', methods=['DELETE'])
    @login_required
    @editor_required
    def delete_article(article_id):
        article = Article.query.get_or_404(article_id)
        db.session.delete(article)
        db.session.commit()
        return jsonify({'message': 'Article deleted'})

    # --- Gallery API ---
    @app.route('/api/gallery', methods=['GET'])
    def get_gallery():
        images = GalleryImage.query.all()
        return jsonify({'images': [image.to_dict() for image in images]})

    @app.route('/api/gallery/<int:image_id>', methods=['GET'])
    def get_gallery_image(image_id):
        image = GalleryImage.query.get_or_404(image_id)
        return jsonify({'image': image.to_dict()})

    @app.route('/api/gallery', methods=['POST'])
    @login_required
    @editor_required
    def add_gallery_image():
        data = request.json
        new_image = GalleryImage(url=data['url'], caption=data['caption'])
        db.session.add(new_image)
        db.session.commit()
        return jsonify({'message': 'Image added', 'image': new_image.to_dict()}), 201

    @app.route('/api/gallery/<int:image_id>', methods=['PUT'])
    @login_required
    @editor_required
    def update_gallery_image(image_id):
        image = GalleryImage.query.get_or_404(image_id)
        data = request.json
        image.url = data.get('url', image.url)
        image.caption = data.get('caption', image.caption)
        db.session.commit()
        return jsonify({'message': 'Image updated', 'image': image.to_dict()})

    @app.route('/api/gallery/<int:image_id>', methods=['DELETE'])
    @login_required
    @editor_required
    def delete_gallery_image(image_id):
        image = GalleryImage.query.get_or_404(image_id)
        db.session.delete(image)
        db.session.commit()
        return jsonify({'message': 'Image deleted'})

    # --- Contact API ---
    @app.route('/api/contact', methods=['POST'])
    def submit_contact():
        data = request.json
        new_message = ContactMessage(name=data['name'], email=data['email'], message=data['message'])
        db.session.add(new_message)
        db.session.commit()
        return jsonify({'message': 'Message sent'}), 201

    @app.route('/api/contact-messages', methods=['GET'])
    @login_required
    @editor_required
    def get_contact_messages():
        messages = ContactMessage.query.order_by(ContactMessage.created_at.desc()).all()
        return jsonify({'messages': [msg.to_dict() for msg in messages]})

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
        return jsonify({'message': 'Message deleted'})

    # --- User Management API ---
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
        new_user = User(username=data['username'], email=data['email'], role=data['role'], active=data.get('active', True))
        new_user.set_password(data['password'])
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'User added', 'user': new_user.to_dict()}), 201

    @app.route('/api/users/<int:user_id>', methods=['PUT'])
    @login_required
    @admin_required
    def update_user(user_id):
        user = User.query.get_or_404(user_id)
        data = request.json
        user.username = data.get('username', user.username)
        user.email = data.get('email', user.email)
        user.role = data.get('role', user.role)
        user.active = data.get('active', user.active)
        if 'password' in data and data['password']:
            user.set_password(data['password'])
        db.session.commit()
        return jsonify({'message': 'User updated', 'user': user.to_dict()})

    @app.route('/api/users/<int:user_id>/status', methods=['PUT'])
    @login_required
    @admin_required
    def toggle_user_status(user_id):
        user = User.query.get_or_404(user_id)
        data = request.json
        if 'active' in data:
            user.active = data['active']
            db.session.commit()
        return jsonify({'message': 'User status updated', 'user': user.to_dict()})

    @app.route('/api/users/<int:user_id>', methods=['DELETE'])
    @login_required
    @admin_required
    def delete_user(user_id):
        user = User.query.get_or_404(user_id)
        if user.id == current_user.id:
            return jsonify({'error': 'Cannot delete self'}), 400
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'User deleted'})

    # --- File Uploads ---
    @app.route('/api/upload/book-cover', methods=['POST'])
    @login_required
    @editor_required
    def upload_book_cover():
        return upload_file('books')

    @app.route('/api/upload/book-pdf', methods=['POST'])
    @login_required
    @editor_required
    def upload_book_pdf():
        return upload_file('books', allowed_exts={'pdf'})

    @app.route('/api/upload/gallery-image', methods=['POST'])
    @login_required
    @editor_required
    def upload_gallery_image():
        return upload_file('gallery', allowed_exts={'png', 'jpg', 'jpeg', 'gif'})

    @app.route('/api/upload/article-image', methods=['POST'])
    @login_required
    @editor_required
    def upload_article_image():
        return upload_file('articles', allowed_exts={'png', 'jpg', 'jpeg', 'gif'})

    def upload_file(subfolder, allowed_exts=None):
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        # Use specific extensions if provided, otherwise use the general ones
        if allowed_exts:
            ext = file.filename.rsplit('.', 1)[1].lower()
            if ext not in allowed_exts:
                return jsonify({'error': f'File type not allowed. Allowed: {", ".join(allowed_exts)}'}), 400
        elif not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed'}), 400

        filename = generate_unique_filename(file.filename)
        upload_path = os.path.join(app.config['UPLOAD_FOLDER'], subfolder)
        os.makedirs(upload_path, exist_ok=True)
        file.save(os.path.join(upload_path, filename))
        return jsonify({'message': 'File uploaded', 'file_url': f'/static/uploads/{subfolder}/{filename}'}), 201

    return app