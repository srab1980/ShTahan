"""
Database models for Sheikh Mustafa Al-Tahhan website
"""
from datetime import datetime
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from app import db
import json

class Book(db.Model):
    """Model for books and publications"""
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    language = db.Column(db.String(50), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    cover = db.Column(db.String(500), nullable=False)
    download = db.Column(db.String(500), nullable=False)
    description = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        """Convert model to dictionary"""
        return {
            'id': self.id,
            'title': self.title,
            'language': self.language,
            'category': self.category,
            'cover': self.cover,
            'download': self.download,
            'description': self.description
        }

class Article(db.Model):
    """Model for articles"""
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    summary = db.Column(db.Text, nullable=False)
    content = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=True)
    image = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {
            'id': self.id,
            'title': self.title,
            'summary': self.summary,
            'content': self.content,
            'category': self.category if self.category else 'عام',
            'image': self.image,
            'created_at': self.created_at.strftime('%Y-%m-%d')
        }

class GalleryImage(db.Model):
    """Model for gallery images"""
    id = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.String(500), nullable=False)
    caption = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {
            'id': self.id,
            'url': self.url,
            'caption': self.caption
        }

class ContactMessage(db.Model):
    """Model for contact form messages"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'message': self.message,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }

class UserActivity(db.Model):
    """Model for tracking user activity and interactions"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    activity_type = db.Column(db.String(50), nullable=False)  # 'view_book', 'download_book', 'view_article', etc.
    content_id = db.Column(db.Integer, nullable=True)  # ID of the related content (book, article, etc.)
    content_type = db.Column(db.String(50), nullable=True)  # 'book', 'article', 'gallery', etc.
    content_title = db.Column(db.String(255), nullable=True)  # Title or name of the content
    activity_data = db.Column(db.Text, nullable=True)  # Optional JSON metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref=db.backref('activities', lazy=True))
    
    def to_dict(self):
        """Convert model to dictionary"""
        result = {
            'id': self.id,
            'user_id': self.user_id,
            'activity_type': self.activity_type,
            'content_id': self.content_id,
            'content_type': self.content_type,
            'content_title': self.content_title,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }
        
        if self.activity_data:
            try:
                result['activity_data'] = json.loads(self.activity_data)
            except json.JSONDecodeError:
                result['activity_data'] = None
                
        return result

class User(UserMixin, db.Model):
    """Model for users with role-based access control"""
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='user')  # 'admin', 'editor', or 'user'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    active = db.Column(db.Boolean, default=True)
    preferences = db.Column(db.Text, nullable=True)  # JSON string storing user preferences
    
    def set_password(self, password):
        """Set password hash"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check password against hash"""
        return check_password_hash(self.password_hash, password)
    
    def is_admin(self):
        """Check if user is an admin"""
        return self.role == 'admin'
    
    def is_editor(self):
        """Check if user is an editor"""
        return self.role == 'editor' or self.role == 'admin'
    
    def get_preferences(self):
        """Get user preferences as dictionary"""
        if not self.preferences:
            return {}
        try:
            return json.loads(self.preferences)
        except json.JSONDecodeError:
            return {}
    
    def set_preferences(self, preferences_dict):
        """Set user preferences from dictionary"""
        self.preferences = json.dumps(preferences_dict)
    
    def record_activity(self, activity_type, content_id=None, content_type=None, content_title=None, metadata=None):
        """Record user activity"""
        activity = UserActivity(
            user_id=self.id,
            activity_type=activity_type,
            content_id=content_id,
            content_type=content_type,
            content_title=content_title,
            activity_data=json.dumps(metadata) if metadata else None
        )
        db.session.add(activity)
        return activity
    
    def to_dict(self):
        """Convert model to dictionary (excluding password)"""
        result = {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'last_login': self.last_login.strftime('%Y-%m-%d %H:%M:%S') if self.last_login else None,
            'active': self.active
        }
        
        # Include preferences if available
        if self.preferences:
            try:
                result['preferences'] = json.loads(self.preferences)
            except json.JSONDecodeError:
                result['preferences'] = {}
                
        return result