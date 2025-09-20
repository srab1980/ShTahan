"""
Database models for the Sheikh Mustafa Al-Tahhan website.

This module defines the SQLAlchemy data models for the application, including
Book, Article, GalleryImage, ContactMessage, UserActivity, and User.
These models are used by Flask-SQLAlchemy to interact with the database.
"""
from datetime import datetime
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from database import db
import json
from sqlalchemy import event, DDL, Index
from sqlalchemy.dialects.postgresql import TSVECTOR
import os


class Book(db.Model):
    """Represents a book or publication in the database."""
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    language = db.Column(db.String(50), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    cover = db.Column(db.String(500), nullable=False)
    download = db.Column(db.String(500), nullable=False)
    description = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    if 'postgresql' in os.environ.get('DATABASE_URL', ''):
        __ts_vector__ = db.Column(TSVECTOR, nullable=True)
        __table_args__ = (
            Index('ix_book_ts_vector', __ts_vector__, postgresql_using='gin'),
        )

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'language': self.language,
            'category': self.category,
            'cover': self.cover,
            'download': self.download,
            'description': self.description
        }

if 'postgresql' in os.environ.get('DATABASE_URL', ''):
    book_trigger_sql = DDL("""
        CREATE OR REPLACE FUNCTION book_ts_vector_trigger() RETURNS trigger AS $$
        begin
            new.__ts_vector__ :=
                to_tsvector('arabic', new.title || ' ' || new.description);
            return new;
        end
        $$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS book_ts_vector_update ON book;
        CREATE TRIGGER book_ts_vector_update BEFORE INSERT OR UPDATE
            ON book FOR EACH ROW EXECUTE PROCEDURE book_ts_vector_trigger();
    """)
    event.listen(Book.__table__, 'after_create', book_trigger_sql)


class Article(db.Model):
    """Represents an article in the database."""
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    summary = db.Column(db.Text, nullable=False)
    content = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=True)
    image = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    if 'postgresql' in os.environ.get('DATABASE_URL', ''):
        __ts_vector__ = db.Column(TSVECTOR, nullable=True)
        __table_args__ = (
            Index('ix_article_ts_vector', __ts_vector__, postgresql_using='gin'),
        )

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'summary': self.summary,
            'content': self.content,
            'category': self.category if self.category else 'عام',
            'image': self.image,
            'created_at': self.created_at.strftime('%Y-%m-%d')
        }

if 'postgresql' in os.environ.get('DATABASE_URL', ''):
    article_trigger_sql = DDL("""
        CREATE OR REPLACE FUNCTION article_ts_vector_trigger() RETURNS trigger AS $$
        begin
            new.__ts_vector__ :=
                to_tsvector('arabic', new.title || ' ' || new.summary || ' ' || new.content);
            return new;
        end
        $$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS article_ts_vector_update ON article;
        CREATE TRIGGER article_ts_vector_update BEFORE INSERT OR UPDATE
            ON article FOR EACH ROW EXECUTE PROCEDURE article_ts_vector_trigger();
    """)
    event.listen(Article.__table__, 'after_create', article_trigger_sql)


class GalleryImage(db.Model):
    """Represents an image in the gallery.

    Attributes:
        id (int): The primary key for the gallery image.
        url (str): The URL of the image file.
        caption (str): A caption or description for the image.
        created_at (datetime): The timestamp when the image was added.
    """
    id = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.String(500), nullable=False)
    caption = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        """Serializes the GalleryImage object to a dictionary.

        Returns:
            dict: A dictionary representation of the gallery image.
        """
        return {
            'id': self.id,
            'url': self.url,
            'caption': self.caption
        }


class ContactMessage(db.Model):
    """Represents a message submitted through the contact form.

    Attributes:
        id (int): The primary key for the message.
        name (str): The name of the person who sent the message.
        email (str): The email address of the sender.
        message (str): The content of the message.
        created_at (datetime): The timestamp when the message was received.
    """
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        """Serializes the ContactMessage object to a dictionary.

        Returns:
            dict: A dictionary representation of the contact message.
        """
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'message': self.message,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }


class UserActivity(db.Model):
    """Represents a recorded user activity or interaction.

    Attributes:
        id (int): The primary key for the activity log.
        user_id (int): The foreign key of the user who performed the activity.
        activity_type (str): The type of activity (e.g., 'view_book').
        content_id (int): The ID of the content related to the activity.
        content_type (str): The type of content (e.g., 'book', 'article').
        content_title (str): The title of the related content.
        activity_data (str): Optional JSON metadata for the activity.
        created_at (datetime): The timestamp when the activity occurred.
        user (User): The relationship to the User model.
    """
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    activity_type = db.Column(db.String(50), nullable=False)
    content_id = db.Column(db.Integer, nullable=True)
    content_type = db.Column(db.String(50), nullable=True)
    content_title = db.Column(db.String(255), nullable=True)
    activity_data = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('activities', lazy=True))

    def to_dict(self):
        """Serializes the UserActivity object to a dictionary.

        Returns:
            dict: A dictionary representation of the user activity.
        """
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
    """Represents a user of the application.

    This model includes authentication, roles, and user preferences.

    Attributes:
        id (int): The primary key for the user.
        username (str): The user's unique username.
        email (str): The user's unique email address.
        password_hash (str): The hashed password for the user.
        role (str): The user's role ('admin', 'editor', 'user').
        created_at (datetime): The timestamp when the user account was created.
        last_login (datetime): The timestamp of the user's last login.
        active (bool): Whether the user's account is active.
        preferences (str): A JSON string for storing user preferences.
    """
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='user')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    active = db.Column(db.Boolean, default=True)
    preferences = db.Column(db.Text, nullable=True)

    def set_password(self, password):
        """Hashes and sets the user's password.

        Args:
            password (str): The plaintext password to hash.
        """
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Checks if a given password matches the user's hashed password.

        Args:
            password (str): The plaintext password to check.

        Returns:
            bool: True if the password is correct, False otherwise.
        """
        return check_password_hash(self.password_hash, password)

    def is_admin(self):
        """Checks if the user has the 'admin' role.

        Returns:
            bool: True if the user is an admin, False otherwise.
        """
        return self.role == 'admin'

    def is_editor(self):
        """Checks if the user has 'editor' or 'admin' role.

        Returns:
            bool: True if the user is an editor or admin, False otherwise.
        """
        return self.role == 'editor' or self.role == 'admin'

    def get_preferences(self):
        """Retrieves user preferences as a dictionary.

        Returns:
            dict: The user's preferences, or an empty dictionary if none are set
                  or if there is a JSON decoding error.
        """
        if not self.preferences:
            return {}
        try:
            return json.loads(self.preferences)
        except json.JSONDecodeError:
            return {}

    def set_preferences(self, preferences_dict):
        """Saves a dictionary of user preferences as a JSON string.

        Args:
            preferences_dict (dict): The dictionary of preferences to save.
        """
        self.preferences = json.dumps(preferences_dict)

    def record_activity(self, activity_type, content_id=None, content_type=None,
                        content_title=None, metadata=None):
        """Creates and records a new UserActivity for this user.

        Args:
            activity_type (str): The type of activity.
            content_id (int, optional): The ID of related content.
            content_type (str, optional): The type of related content.
            content_title (str, optional): The title of related content.
            metadata (dict, optional): Extra data to store as a JSON string.

        Returns:
            UserActivity: The newly created UserActivity object.
        """
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
        """Serializes the User object to a dictionary.

        Excludes the password hash for security.

        Returns:
            dict: A dictionary representation of the user.
        """
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