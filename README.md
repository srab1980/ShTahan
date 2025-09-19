# Sheikh Mustafa Al-Tahhan Official Website
# موقع الشيخ مصطفى الطحان الرسمي

A comprehensive, bilingual (Arabic/English) website for Sheikh Mustafa Al-Tahhan, featuring his biography, books, articles, and a media gallery. The project includes a full Content Management System (CMS) for administrators and editors.

## Features / المميزات

- **Bilingual Interface**: Full Arabic RTL support alongside English.
- **Content Management System (CMS)**: A secure admin dashboard to manage all site content.
- **User Roles**: Multi-level user authentication (Admin, Editor, User).
- **Dynamic Content**:
    - **Book Library**: Browse and download books, with PDF support.
    - **Articles Section**: A complete blog for articles.
    - **Image Gallery**: A responsive image and video gallery.
- **User Personalization**:
    - **User Journey**: A personalized dashboard for registered users to track their activity.
    - **Recommendations**: AI-powered content recommendations.
- **Offline Access**: Implemented with a Service Worker for offline browsing capabilities (PWA).
- **Responsive Design**: Fully responsive layout for all devices.

## Technologies Used / التقنيات المستخدمة

- **Backend**: Flask (Python)
- **Database**: PostgreSQL (using NeonDB)
- **ORM**: SQLAlchemy with Flask-SQLAlchemy
- **Authentication**: Flask-Login
- **Frontend**: HTML5, CSS3, JavaScript (no external frameworks)
- **File Handling**: Werkzeug for secure file uploads

---

## Setup and Installation / الإعداد والتثبيت

To get a local copy up and running, follow these simple steps.

### Prerequisites / المتطلبات المسبقة

- Python 3.8+
- `pip` for package management
- A PostgreSQL database (you can get a free one from [Neon](https://neon.tech/))

### 1. Clone the Repository / استنساخ المشروع

```bash
git clone https://github.com/[your-username]/sheikh-mustafa-website.git
cd sheikh-mustafa-website
```

### 2. Set Up a Virtual Environment / إعداد بيئة افتراضية

It's highly recommended to use a virtual environment to manage dependencies.

```bash
# For macOS/Linux
python3 -m venv venv
source venv/bin/activate

# For Windows
python -m venv venv
.\venv\Scripts\activate
```

### 3. Install Dependencies / تثبيت المتطلبات

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables / إعداد متغيرات البيئة

Create a `.env` file in the root of the project and add the following variables. You can rename the `.env.example` file if it exists.

```dotenv
# Your PostgreSQL database connection string
DATABASE_URL="postgresql://user:password@host:port/dbname?sslmode=require"

# A strong, random secret key for session management
SESSION_SECRET="your_super_secret_key"
```
* **`DATABASE_URL`**: The connection string for your PostgreSQL database.
* **`SESSION_SECRET`**: A secret key used by Flask to sign session cookies. You can generate one with `python -c 'import secrets; print(secrets.token_hex())'`.

### 5. Initialize the Database and Seed Data / تهيئة قاعدة البيانات والبيانات الأولية

Run the following scripts to create the database tables and populate them with initial data.

**a. Create Database Tables:**
The application creates the tables automatically. The first time you run it, the tables will be generated.

**b. Create Admin and Default Users:**
This script creates three default users: `admin`, `editor`, and `user` (all with the password `admin123`, `editor123`, and `user123` respectively).

```bash
python create_admin.py
```

**c. Seed the Database with Content:**
This script populates the database with sample books, articles, and gallery images.

```bash
python seed_database.py
```

### 6. Run the Application / تشغيل التطبيق

You can now run the Flask development server.

```bash
flask run
# Or
python app.py
```

The application will be available at `http://127.0.0.1:5000`.

---

## Project Structure / بنية المشروع

```
.
├── app.py              # Main Flask application file with all routes and logic.
├── models.py           # SQLAlchemy database models.
├── requirements.txt    # Python package dependencies.
├── static/             # All static assets.
│   ├── css/            # CSS stylesheets.
│   ├── js/             # JavaScript files for frontend logic.
│   │   ├── admin.js
│   │   └── ...
│   ├── img/            # Static images for the site layout.
│   └── uploads/        # Directory for user-uploaded content.
├── templates/          # Jinja2 HTML templates.
│   ├── admin/          # Templates for the admin dashboard.
│   └── ...
├── .env.example        # Example environment file.
└── README.md           # This file.
```

---

## Usage / الاستخدام

- **Homepage**: Displays a brief bio and the latest articles and books.
- **Library**: Browse and download books.
- **Articles**: Read articles on various topics.
- **Gallery**: View images and videos.
- **Admin Dashboard**: Log in as `admin` or `editor` to access the CMS at the `/admin` route to manage all content.

## Contributing / المساهمة

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License / الترخيص

This project is intended for educational and personal use. Please respect the content rights of the original author.

## Developer / المطور

This website was developed by the **Replit Agent**.