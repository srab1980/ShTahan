"""
A script to create initial users (admin, editor, and user) for the application.

This script is intended to be run from the command line to populate the
database with a default set of users with different roles. It ensures that
users are not duplicated if they already exist.
"""
from app import app, db
from werkzeug.security import generate_password_hash
from models import User
from datetime import datetime

def create_users():
    """Creates a default set of users if they don't already exist.

    This function creates three users:
    - 'admin' with the 'admin' role.
    - 'editor' with the 'editor' role.
    - 'user' with the 'user' role.

    The function connects to the database within the Flask application context
    and commits the new users. It prints messages to the console indicating
    which users were created.
    """
    with app.app_context():
        # Create admin user
        existing_admin = User.query.filter_by(username='admin').first()
        if not existing_admin:
            admin = User(
                username='admin',
                email='admin@example.com',
                password_hash=generate_password_hash('admin123'),
                role='admin',
                created_at=datetime.utcnow(),
                active=True
            )
            db.session.add(admin)
            print('Admin user created successfully!')

        # Create editor user
        existing_editor = User.query.filter_by(username='editor').first()
        if not existing_editor:
            editor = User(
                username='editor',
                email='editor@example.com',
                password_hash=generate_password_hash('editor123'),
                role='editor',
                created_at=datetime.utcnow(),
                active=True
            )
            db.session.add(editor)
            print('Editor user created successfully!')

        # Create regular user
        existing_user = User.query.filter_by(username='user').first()
        if not existing_user:
            regular_user = User(
                username='user',
                email='user@example.com',
                password_hash=generate_password_hash('user123'),
                role='user',
                created_at=datetime.utcnow(),
                active=True
            )
            db.session.add(regular_user)
            print('Regular user created successfully!')

        db.session.commit()
        print('All users have been processed.')

if __name__ == '__main__':
    create_users()