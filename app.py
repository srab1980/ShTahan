import os
import logging
from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase

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

# Initialize the app with the SQLAlchemy extension
db.init_app(app)

# Import models after initializing db
from models import Book, Article, GalleryImage, ContactMessage

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/gallery')
def gallery():
    return render_template('gallery.html')

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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
