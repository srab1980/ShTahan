import unittest
import os
import sys
import json

# Add the parent directory to the sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app, db
from models import User

class UserManagementTestCase(unittest.TestCase):
    def setUp(self):
        """Set up a test client and a test database."""
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        app.config['WTF_CSRF_ENABLED'] = False
        app.config['SECRET_KEY'] = 'a-secret-key'
        self.client = app.test_client()
        with app.app_context():
            db.create_all()
            # Create an admin user for testing protected routes
            admin_user = User(username='admin', email='admin@test.com', role='admin', active=True)
            admin_user.set_password('adminpassword')
            # Create a regular user for testing updates and deletions
            test_user = User(username='testuser', email='test@test.com', role='user', active=True)
            test_user.set_password('testpassword')
            db.session.add(admin_user)
            db.session.add(test_user)
            db.session.commit()

    def tearDown(self):
        """Tear down the database."""
        with app.app_context():
            db.session.remove()
            db.drop_all()

    def login_admin(self):
        """Helper method to log in the admin user."""
        return self.client.post('/login', data=json.dumps({
            'username': 'admin',
            'password': 'adminpassword'
        }), content_type='application/json')

    def test_update_user_with_invalid_active_type(self):
        """Test updating a user with an invalid type for the 'active' field."""
        self.login_admin()
        with app.app_context():
            user_to_update = User.query.filter_by(username='testuser').first()

        response = self.client.put(f'/api/users/{user_to_update.id}', data=json.dumps({
            'active': 'not-a-boolean'
        }), content_type='application/json')

        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('error', data)
        self.assertEqual(data['error'], "The 'active' field must be a boolean value (true or false).")

if __name__ == '__main__':
    unittest.main()
