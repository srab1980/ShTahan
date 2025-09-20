import unittest
import os
import sys
import json

# Add the parent directory to the sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app, db
from models import User, Book, Article, GalleryImage, ContactMessage

class AppTestCase(unittest.TestCase):
    def setUp(self):
        """Set up a test client and a test database."""
        self.app = create_app('testing')
        self.app_context = self.app.app_context()
        self.app_context.push()
        self.client = self.app.test_client()
        with self.app.app_context():
            db.create_all()
            self.create_users()
            self.create_book()
            self.create_article()
            self.create_gallery_image()
            self.create_contact_message()
            db.session.commit()

    def tearDown(self):
        """Tear down the database."""
        with self.app.app_context():
            db.session.remove()
            db.drop_all()
        self.app_context.pop()
        if os.path.exists('test.db'):
            os.remove('test.db')

    def create_book(self):
        """Create a test book."""
        book = Book(
            title='Test Book',
            language='English',
            category='Testing',
            cover='http://example.com/cover.jpg',
            download='http://example.com/book.pdf',
            description='A book for testing.'
        )
        db.session.add(book)

    def create_article(self):
        """Create a test article."""
        article = Article(
            title='Test Article',
            summary='A summary of the test article.',
            content='The full content of the test article.',
            category='Testing',
            image='http://example.com/article.jpg'
        )
        db.session.add(article)

    def create_gallery_image(self):
        """Create a test gallery image."""
        image = GalleryImage(
            url='http://example.com/gallery.jpg',
            caption='A test gallery image.'
        )
        db.session.add(image)

    def create_contact_message(self):
        """Create a test contact message."""
        message = ContactMessage(
            name='Test User',
            email='test@example.com',
            message='This is a test message.'
        )
        db.session.add(message)

    def create_users(self):
        """Create test users."""
        admin = User(username='admin', email='admin@test.com', role='admin')
        admin.set_password('adminpassword')
        editor = User(username='editor', email='editor@test.com', role='editor')
        editor.set_password('editorpassword')
        user = User(username='user', email='user@test.com', role='user')
        user.set_password('userpassword')
        db.session.add(admin)
        db.session.add(editor)
        db.session.add(user)

    def login(self, username, password):
        """Helper function to log in a user."""
        return self.client.post('/login', data=json.dumps(dict(
            username=username,
            password=password
        )), content_type='application/json')

    def test_home_page(self):
        """Test that the home page loads correctly."""
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)

    def test_gallery_page(self):
        """Test that the gallery page loads correctly."""
        response = self.client.get('/gallery')
        self.assertEqual(response.status_code, 200)

    def test_responsive_gallery_page(self):
        """Test that the responsive gallery page loads correctly."""
        response = self.client.get('/responsive-gallery')
        self.assertEqual(response.status_code, 200)

    def test_books_page(self):
        """Test that the books page loads correctly."""
        response = self.client.get('/books')
        self.assertEqual(response.status_code, 200)

    def test_articles_page(self):
        """Test that the articles page loads correctly."""
        response = self.client.get('/articles')
        self.assertEqual(response.status_code, 200)

    def test_user_journey_page(self):
        """Test that the user journey page loads correctly."""
        response = self.client.get('/user-journey')
        self.assertEqual(response.status_code, 200)

    def test_admin_dashboard_access(self):
        """Test access to the admin dashboard."""
        # Test no login
        response = self.client.get('/admin', follow_redirects=True)
        self.assertIn(b'login-form', response.data)

        # Test login as user
        self.login('user', 'userpassword')
        response = self.client.get('/admin')
        self.assertEqual(response.status_code, 200) # Admin dashboard is accessible to all logged in users

        # Test login as editor
        self.login('editor', 'editorpassword')
        response = self.client.get('/admin')
        self.assertEqual(response.status_code, 200)

        # Test login as admin
        self.login('admin', 'adminpassword')
        response = self.client.get('/admin')
        self.assertEqual(response.status_code, 200)

    def test_books_management_access(self):
        """Test access to the books management page."""
        # Test no login
        response = self.client.get('/admin/books', follow_redirects=True)
        self.assertIn(b'login-form', response.data)

        # Test login as user
        self.login('user', 'userpassword')
        response = self.client.get('/admin/books')
        self.assertEqual(response.status_code, 403)

        # Test login as editor
        self.login('editor', 'editorpassword')
        response = self.client.get('/admin/books')
        self.assertEqual(response.status_code, 200)

        # Test login as admin
        self.login('admin', 'adminpassword')
        response = self.client.get('/admin/books')
        self.assertEqual(response.status_code, 200)

    def test_articles_management_access(self):
        """Test access to the articles management page."""
        # Test no login
        response = self.client.get('/admin/articles', follow_redirects=True)
        self.assertIn(b'login-form', response.data)

        # Test login as user
        self.login('user', 'userpassword')
        response = self.client.get('/admin/articles')
        self.assertEqual(response.status_code, 200) # Articles management is accessible to all logged in users

        # Test login as editor
        self.login('editor', 'editorpassword')
        response = self.client.get('/admin/articles')
        self.assertEqual(response.status_code, 200)

        # Test login as admin
        self.login('admin', 'adminpassword')
        response = self.client.get('/admin/articles')
        self.assertEqual(response.status_code, 200)

    def test_user_management_access(self):
        """Test access to the user management page."""
        # Test no login
        response = self.client.get('/admin/users', follow_redirects=True)
        self.assertIn(b'login-form', response.data)

        # Test login as user
        self.login('user', 'userpassword')
        response = self.client.get('/admin/users')
        self.assertEqual(response.status_code, 403)

        # Test login as editor
        self.login('editor', 'editorpassword')
        response = self.client.get('/admin/users')
        self.assertEqual(response.status_code, 403)

        # Test login as admin
        self.login('admin', 'adminpassword')
        response = self.client.get('/admin/users')
        self.assertEqual(response.status_code, 200)

    def test_admin_gallery_management_access(self):
        """Test access to the gallery management page."""
        # Test no login
        response = self.client.get('/admin/gallery', follow_redirects=True)
        self.assertIn(b'login-form', response.data)

        # Test login as user
        self.login('user', 'userpassword')
        response = self.client.get('/admin/gallery')
        self.assertEqual(response.status_code, 403)

        # Test login as editor
        self.login('editor', 'editorpassword')
        response = self.client.get('/admin/gallery')
        self.assertEqual(response.status_code, 200)

        # Test login as admin
        self.login('admin', 'adminpassword')
        response = self.client.get('/admin/gallery')
        self.assertEqual(response.status_code, 200)

    def test_admin_messages_management_access(self):
        """Test access to the messages management page."""
        # Test no login
        response = self.client.get('/admin/messages', follow_redirects=True)
        self.assertIn(b'login-form', response.data)

        # Test login as user
        self.login('user', 'userpassword')
        response = self.client.get('/admin/messages')
        self.assertEqual(response.status_code, 403)

        # Test login as editor
        self.login('editor', 'editorpassword')
        response = self.client.get('/admin/messages')
        self.assertEqual(response.status_code, 200)

        # Test login as admin
        self.login('admin', 'adminpassword')
        response = self.client.get('/admin/messages')
        self.assertEqual(response.status_code, 200)

    def test_component_and_form_routes(self):
        """Test that component and form routes load correctly."""
        routes = ['/login-link', '/login-button', '/login-form', '/signup-form', '/password-reset-form']
        for route in routes:
            with self.subTest(route=route):
                response = self.client.get(route)
                self.assertEqual(response.status_code, 200)

    def test_change_password_form_access(self):
        """Test access to the change password form."""
        # Test no login
        response = self.client.get('/change-password-form', follow_redirects=True)
        self.assertIn(b'login-form', response.data)

        # Test login as user
        self.login('user', 'userpassword')
        response = self.client.get('/change-password-form')
        self.assertEqual(response.status_code, 200)

    def test_login_api(self):
        """Test the login API endpoint."""
        # Test successful login
        response = self.login('admin', 'adminpassword')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['message'], 'تم تسجيل الدخول بنجاح')

        # Test wrong password
        response = self.login('admin', 'wrongpassword')
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.get_json()['error'], 'اسم المستخدم أو كلمة المرور غير صحيحة')

        # Test wrong username
        response = self.login('wronguser', 'adminpassword')
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.get_json()['error'], 'اسم المستخدم أو كلمة المرور غير صحيحة')

    def test_logout(self):
        """Test the logout functionality."""
        self.login('user', 'userpassword')
        response = self.client.get('/logout', follow_redirects=True)
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'login-form', response.data)

    def test_signup_api(self):
        """Test the signup API endpoint."""
        # Test successful signup
        response = self.client.post('/signup', data=json.dumps(dict(
            username='newuser',
            email='newuser@test.com',
            password='newpassword'
        )), content_type='application/json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.get_json()['message'], 'تم إنشاء الحساب بنجاح')

        # Test existing username
        response = self.client.post('/signup', data=json.dumps(dict(
            username='admin',
            email='another@test.com',
            password='newpassword'
        )), content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json()['error'], 'اسم المستخدم موجود بالفعل')

        # Test existing email
        response = self.client.post('/signup', data=json.dumps(dict(
            username='anotheruser',
            email='admin@test.com',
            password='newpassword'
        )), content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json()['error'], 'البريد الإلكتروني موجود بالفعل')

        # Test short password
        response = self.client.post('/signup', data=json.dumps(dict(
            username='shortpassuser',
            email='shortpass@test.com',
            password='short'
        )), content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json()['error'], 'يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل')

    def test_get_books_api(self):
        """Test the GET /api/books endpoint."""
        response = self.client.get('/api/books')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(len(data['books']), 1)
        self.assertEqual(data['books'][0]['title'], 'Test Book')

    def test_get_book_api(self):
        """Test the GET /api/books/<book_id> endpoint."""
        response = self.client.get('/api/books/1')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['book']['title'], 'Test Book')

    def test_add_book_api(self):
        """Test the POST /api/books endpoint."""
        self.login('editor', 'editorpassword')
        response = self.client.post('/api/books', data=json.dumps(dict(
            title='New Book',
            language='Spanish',
            category='Fiction',
            cover='http://example.com/new_cover.jpg',
            download='http://example.com/new_book.pdf',
            description='A new book.'
        )), content_type='application/json')
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertEqual(data['message'], 'Book added successfully')
        self.assertEqual(data['book']['title'], 'New Book')

    def test_update_book_api(self):
        """Test the PUT /api/books/<book_id> endpoint."""
        self.login('editor', 'editorpassword')
        response = self.client.put('/api/books/1', data=json.dumps(dict(
            title='Updated Book Title'
        )), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['message'], 'Book updated successfully')
        self.assertEqual(data['book']['title'], 'Updated Book Title')

    def test_delete_book_api(self):
        """Test the DELETE /api/books/<book_id> endpoint."""
        self.login('editor', 'editorpassword')
        response = self.client.delete('/api/books/1')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['message'], 'Book deleted successfully')

    def test_get_articles_api(self):
        """Test the GET /api/articles endpoint."""
        response = self.client.get('/api/articles')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(len(data['articles']), 1)
        self.assertEqual(data['articles'][0]['title'], 'Test Article')

    def test_get_article_api(self):
        """Test the GET /api/articles/<article_id> endpoint."""
        response = self.client.get('/api/articles/1')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['article']['title'], 'Test Article')

    def test_add_article_api(self):
        """Test the POST /api/articles endpoint."""
        self.login('editor', 'editorpassword')
        response = self.client.post('/api/articles', data=json.dumps(dict(
            title='New Article',
            summary='A new summary.',
            content='The new content.',
            category='New Category',
            image='http://example.com/new_article.jpg'
        )), content_type='application/json')
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertEqual(data['message'], 'Article added successfully')
        self.assertEqual(data['article']['title'], 'New Article')

    def test_update_article_api(self):
        """Test the PUT /api/articles/<article_id> endpoint."""
        self.login('editor', 'editorpassword')
        response = self.client.put('/api/articles/1', data=json.dumps(dict(
            title='Updated Article Title'
        )), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['message'], 'Article updated successfully')
        self.assertEqual(data['article']['title'], 'Updated Article Title')

    def test_delete_article_api(self):
        """Test the DELETE /api/articles/<article_id> endpoint."""
        self.login('editor', 'editorpassword')
        response = self.client.delete('/api/articles/1')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['message'], 'Article deleted successfully')

    def test_get_gallery_api(self):
        """Test the GET /api/gallery endpoint."""
        response = self.client.get('/api/gallery')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(len(data['images']), 1)
        self.assertEqual(data['images'][0]['caption'], 'A test gallery image.')

    def test_get_gallery_image_api(self):
        """Test the GET /api/gallery/<image_id> endpoint."""
        response = self.client.get('/api/gallery/1')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['image']['caption'], 'A test gallery image.')

    def test_add_gallery_image_api(self):
        """Test the POST /api/gallery endpoint."""
        self.login('editor', 'editorpassword')
        response = self.client.post('/api/gallery', data=json.dumps(dict(
            url='http://example.com/new_gallery.jpg',
            caption='A new gallery image.'
        )), content_type='application/json')
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertEqual(data['message'], 'Image added successfully')
        self.assertEqual(data['image']['caption'], 'A new gallery image.')

    def test_update_gallery_image_api(self):
        """Test the PUT /api/gallery/<image_id> endpoint."""
        self.login('editor', 'editorpassword')
        response = self.client.put('/api/gallery/1', data=json.dumps(dict(
            caption='Updated Gallery Caption'
        )), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['message'], 'Image updated successfully')
        self.assertEqual(data['image']['caption'], 'Updated Gallery Caption')

    def test_delete_gallery_image_api(self):
        """Test the DELETE /api/gallery/<image_id> endpoint."""
        self.login('editor', 'editorpassword')
        response = self.client.delete('/api/gallery/1')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['message'], 'Image deleted successfully')

    def test_submit_contact_api(self):
        """Test the POST /api/contact endpoint."""
        response = self.client.post('/api/contact', data=json.dumps(dict(
            name='New Contact',
            email='new@contact.com',
            message='A new message.'
        )), content_type='application/json')
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertEqual(data['message'], 'Message sent successfully')

    def test_get_contact_messages_api(self):
        """Test the GET /api/contact-messages endpoint."""
        self.login('editor', 'editorpassword')
        response = self.client.get('/api/contact-messages')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(len(data['messages']), 1)
        self.assertEqual(data['messages'][0]['name'], 'Test User')

    def test_get_contact_message_api(self):
        """Test the GET /api/contact-messages/<message_id> endpoint."""
        self.login('editor', 'editorpassword')
        response = self.client.get('/api/contact-messages/1')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['message']['name'], 'Test User')

    def test_delete_contact_message_api(self):
        """Test the DELETE /api/contact-messages/<message_id> endpoint."""
        self.login('editor', 'editorpassword')
        response = self.client.delete('/api/contact-messages/1')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['message'], 'Message deleted successfully')

    def test_get_users_api(self):
        """Test the GET /api/users endpoint."""
        self.login('admin', 'adminpassword')
        response = self.client.get('/api/users')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(len(data['users']), 3)

    def test_get_user_api(self):
        """Test the GET /api/users/<user_id> endpoint."""
        self.login('admin', 'adminpassword')
        response = self.client.get('/api/users/1')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['user']['username'], 'admin')

    def test_add_user_api(self):
        """Test the POST /api/users endpoint."""
        self.login('admin', 'adminpassword')
        response = self.client.post('/api/users', data=json.dumps(dict(
            username='newadmin',
            email='newadmin@test.com',
            password='newadminpassword',
            role='admin'
        )), content_type='application/json')
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertEqual(data['message'], 'تمت إضافة المستخدم بنجاح')
        self.assertEqual(data['user']['username'], 'newadmin')

    def test_update_user_api(self):
        """Test the PUT /api/users/<user_id> endpoint."""
        self.login('admin', 'adminpassword')
        response = self.client.put('/api/users/2', data=json.dumps(dict(
            username='updatededitor'
        )), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['message'], 'تم تحديث المستخدم بنجاح')
        self.assertEqual(data['user']['username'], 'updatededitor')

    def test_delete_user_api(self):
        """Test the DELETE /api/users/<user_id> endpoint."""
        self.login('admin', 'adminpassword')
        response = self.client.delete('/api/users/3')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['message'], 'تم حذف المستخدم بنجاح')

    def test_toggle_user_status_api(self):
        """Test the PUT /api/users/<user_id>/status endpoint."""
        self.login('admin', 'adminpassword')
        response = self.client.put('/api/users/2/status', data=json.dumps(dict(
            active=False
        )), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['message'], 'تم تحديث حالة المستخدم بنجاح')
        self.assertEqual(data['user']['active'], False)

if __name__ == '__main__':
    unittest.main()
