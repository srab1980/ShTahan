# Overview

This is a complete web application for Sheikh Mustafa Al-Tahhan's official website, built as a content management system with public-facing pages and administrative capabilities. The application serves Arabic content (RTL layout) featuring the Sheikh's biography, books, articles, and gallery. It includes user authentication, role-based access control, and a comprehensive admin dashboard for content management.

The website combines modern web technologies to deliver a responsive, accessible experience that honors the Islamic scholar's legacy while providing practical tools for content administrators to manage books, articles, gallery images, and user interactions.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Template Engine**: Jinja2 with Flask for server-side rendering
- **Styling**: Custom CSS with RTL support, responsive design using CSS Grid and Flexbox
- **JavaScript**: Modular vanilla JavaScript architecture with separate modules for different features
- **PWA Support**: Service worker implementation for offline functionality and app-like experience
- **Responsive Design**: Mobile-first approach with breakpoints for different screen sizes

## Backend Architecture
- **Framework**: Flask (Python) with blueprints pattern for route organization
- **ORM**: SQLAlchemy with declarative base for database operations
- **Authentication**: Flask-Login for session management with role-based access control
- **File Handling**: Werkzeug for secure file uploads and static file serving
- **Security**: CSRF protection, secure session cookies, password hashing with Werkzeug

## Database Design
- **Models**: User, Book, Article, GalleryImage with proper relationships
- **User Roles**: Admin, Editor, User with different permission levels
- **Data Validation**: Server-side validation for all user inputs
- **Migration Support**: SQLAlchemy migration capabilities for database schema updates

## Content Management
- **Books Management**: CRUD operations with cover image and PDF upload
- **Articles Management**: Rich text content with thumbnail images and categorization
- **Gallery Management**: Image upload with captions and automatic thumbnail generation
- **User Journey Tracking**: Activity monitoring for personalized user experiences

## API Architecture
- **RESTful Endpoints**: JSON API endpoints for AJAX operations
- **Authentication Status**: Real-time authentication checking for secure operations
- **File Upload API**: Dedicated endpoints for handling image and document uploads
- **Content Filtering**: Search and filter capabilities for books and articles

# External Dependencies

## Database
- **PostgreSQL**: Primary database hosted on Neon (cloud PostgreSQL service)
- **Connection Pooling**: SQLAlchemy engine with connection recycling and pre-ping
- **SSL Mode**: Required SSL connections for secure database communication

## CDN and External Assets
- **Google Fonts**: Arabic fonts (Amiri, Cairo, Tajawal) for proper typography
- **Font Awesome**: Icon library for UI elements and navigation
- **Cloudflare CDN**: Used for Font Awesome delivery with fallback loading

## Third-Party Services
- **Image Hosting**: Support for external image URLs and local file storage
- **File Storage**: Local file system for uploaded content with secure filename handling
- **Email Integration**: Prepared structure for contact form email notifications (SMTP configuration ready)

## Development Tools
- **Python Packages**: Flask ecosystem (Flask-Login, Flask-SQLAlchemy, Werkzeug)
- **Frontend Build**: No build process required - vanilla CSS and JavaScript
- **Environment Configuration**: Environment variable based configuration for different deployment stages