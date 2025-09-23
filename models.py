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


def _normalize_media_url(path, subfolder, default_url):
    """Normalize stored media paths to usable URLs.

    The content database mixes uploaded assets, bundled static files, and in
    some cases JSON-encoded or list-based references to those assets. This
    helper gently canonicalizes any of those formats into a URL that the
    frontend can render. When a corresponding local file cannot be found, the
    provided ``default_url`` is returned so the UI never displays a broken
    image placeholder.

    Args:
        path (Any): The original path stored in the database.
        subfolder (str): The uploads subdirectory for the resource type.
        default_url (str): A fallback URL when no valid path is provided.

    Returns:
        str: A normalized URL suitable for use by the frontend.
    """

    def _extract_media_value(raw):
        """Extract a usable string path from heterogeneous inputs."""

        if raw is None:
            return ''

        # Handle iterables (lists, tuples, sets) by taking the first
        # non-empty value.
        if isinstance(raw, (list, tuple, set)):
            for item in raw:
                extracted = _extract_media_value(item)
                if extracted:
                    return extracted
            return ''

        # Handle dictionaries that may wrap the actual URL.
        if isinstance(raw, dict):
            for key in ('url', 'path', 'src', 'image', 'cover'):
                if key in raw:
                    extracted = _extract_media_value(raw[key])
                    if extracted:
                        return extracted
            return ''

        # Convert bytes to string.
        if isinstance(raw, bytes):
            raw = raw.decode('utf-8', 'ignore')

        text = str(raw).strip()
        if not text:
            return ''

        # Remove wrapping quotes if the path is stored as a quoted string.
        if (text.startswith(('"', "'")) and text.endswith(text[0])
                and len(text) > 1):
            text = text[1:-1].strip()

        if not text:
            return ''

        # Attempt to decode JSON-wrapped values (e.g. '"/path"' or
        # '["/path"]').
        if text[0] in ('{', '['):
            try:
                parsed = json.loads(text)
            except (json.JSONDecodeError, TypeError):
                pass
            else:
                return _extract_media_value(parsed)

        return text

    normalized = _extract_media_value(path)
    if not normalized:
        return default_url

    normalized = normalized.replace('\\', '/').strip()
    if not normalized:
        return default_url

    # Allow externally hosted resources and data URIs as-is.
    if normalized.startswith(('http://', 'https://', 'data:')):
        return normalized

    # Remove any relative directory traversals that may remain.
    while True:
        for prefix in ('../', '..\\', './', '.\\'):
            if normalized.startswith(prefix):
                normalized = normalized[len(prefix):]
                break
        else:
            break
    if not normalized:
        return default_url

    candidate_pairs = []

    def add_candidate(url_path):
        normalized_url = url_path.replace('\\', '/')
        clean_url = '/' + normalized_url.lstrip('/')
        candidate_pairs.append((clean_url, clean_url.lstrip('/')))

    # Direct references into the static directory should be preserved if the
    # asset exists locally.
    if normalized.startswith('/static/'):
        add_candidate(normalized)
    elif normalized.startswith('static/'):
        add_candidate(normalized)
    elif normalized.startswith(('/uploads/', 'uploads/')):
        add_candidate(f"static/{normalized.lstrip('/')}")
    elif normalized.startswith(('/img/', 'img/')):
        add_candidate(f"static/{normalized.lstrip('/')}")

    filename = os.path.basename(normalized)
    if filename:
        fallback_dirs = [
            os.path.join('static', 'uploads', subfolder, filename),
            os.path.join('static', 'img', subfolder, filename),
            os.path.join('static', 'uploads', filename),
            os.path.join('static', 'img', filename),
            os.path.join('static', filename),
        ]
        for rel_path in fallback_dirs:
            add_candidate(rel_path)

    # Return the first candidate that exists on disk.
    for url_path, rel_path in candidate_pairs:
        filesystem_path = rel_path.replace('/', os.sep)
        if os.path.exists(filesystem_path):
            return url_path

    # Attempt a fuzzy match by comparing filename stems without separators.
    if filename:
        stem, ext = os.path.splitext(filename)
        sanitized = ''.join(ch.lower() for ch in stem if ch.isalnum())
        if sanitized:
            search_directories = [
                os.path.join('static', 'uploads', subfolder),
                os.path.join('static', 'img', subfolder),
                os.path.join('static', 'uploads'),
                os.path.join('static', 'img'),
            ]
            for directory in search_directories:
                if not os.path.isdir(directory):
                    continue
                try:
                    entries = os.listdir(directory)
                except OSError:
                    continue
                for entry in entries:
                    entry_path = os.path.join(directory, entry)
                    if not os.path.isfile(entry_path):
                        continue
                    entry_stem, entry_ext = os.path.splitext(entry)
                    if ext and entry_ext.lower() != ext.lower():
                        continue
                    entry_sanitized = ''.join(
                        ch.lower() for ch in entry_stem if ch.isalnum()
                    )
                    if entry_sanitized == sanitized:
                        return '/' + entry_path.replace(os.sep, '/').lstrip('/')

    return default_url


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
        """
        Serializes the Book object to a dictionary, ensuring the cover image
        URL is always valid and points to the correct uploads directory.
        """
        cover_url = _normalize_media_url(
            self.cover,
            'books',
            '/static/img/default/default-cover.jpg'
        )

        return {
            'id': self.id,
            'title': self.title,
            'language': self.language,
            'category': self.category,
            'cover': cover_url,
            'download': self.download,
            'description': self.description,
            'created_at': self.created_at.isoformat()
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
        """
        Serializes the Article object to a dictionary, ensuring the image
        URL is always valid and points to the correct uploads directory.
        """
        image_url = _normalize_media_url(
            self.image,
            'articles',
            '/static/img/default/article-default.jpg'
        )

        return {
            'id': self.id,
            'title': self.title,
            'summary': self.summary,
            'content': self.content,
            'category': self.category if self.category else 'عام',
            'image': image_url,
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
        """
        Serializes the GalleryImage object to a dictionary, ensuring the image
        URL is always valid and points to the correct uploads directory.
        """
        image_url = _normalize_media_url(
            self.url,
            'gallery',
            '/static/img/default/default-cover.jpg'
        )

        return {
            'id': self.id,
            'url': image_url,
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