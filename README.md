# موقع الشيخ مصطفى الطحان الرسمي
## Sheikh Mustafa Al-Tahhan Official Website

موقع إلكتروني شامل للشيخ مصطفى الطحان يتضمن السيرة الذاتية، الكتب، المقالات، والمعرض.

A comprehensive website for Sheikh Mustafa Al-Tahhan featuring biography, books, articles, and gallery with Arabic RTL support.

## المميزات / Features

- **واجهة عربية بتخطيط RTL** - Arabic interface with RTL layout
- **نظام إدارة المحتوى** - Content Management System
- **مكتبة الكتب** - Books library with PDF support
- **المقالات** - Articles section
- **معرض الصور** - Image gallery
- **نظام المستخدمين** - User authentication and role management
- **لوحة تحكم الإدارة** - Admin dashboard
- **تصميم متجاوب** - Responsive design

## التقنيات المستخدمة / Technologies Used

- **Backend**: Flask (Python)
- **Database**: PostgreSQL
- **Frontend**: HTML5, CSS3, JavaScript
- **Authentication**: Flask-Login
- **ORM**: SQLAlchemy
- **File Handling**: Werkzeug

## التثبيت / Installation

1. **استنساخ المشروع / Clone the repository**:
   ```bash
   git clone https://github.com/[username]/sheikh-mustafa-website.git
   cd sheikh-mustafa-website
   ```

2. **تثبيت المتطلبات / Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **إعداد متغيرات البيئة / Set environment variables**:
   ```bash
   export DATABASE_URL="your_postgresql_url"
   export SESSION_SECRET="your_secret_key"
   ```

4. **تشغيل التطبيق / Run the application**:
   ```bash
   python main.py
   ```

## البنية / Structure

- `app.py` - التطبيق الرئيسي / Main Flask application
- `models.py` - نماذج قاعدة البيانات / Database models
- `templates/` - قوالب HTML / HTML templates
- `static/` - الملفات الثابتة / Static files (CSS, JS, images)
- `main.py` - نقطة الدخول / Entry point

## الاستخدام / Usage

1. **الصفحة الرئيسية** - تعرض نبذة عن الشيخ والمحتوى الرئيسي
2. **المكتبة** - تصفح وتحميل كتب الشيخ
3. **المقالات** - قراءة المقالات الفكرية والتربوية
4. **المعرض** - مشاهدة الصور والفعاليات
5. **لوحة التحكم** - إدارة المحتوى (للمشرفين والمحررين)

## الترخيص / License

هذا المشروع مخصص للاستخدام التعليمي والشخصي.
This project is for educational and personal use.

## المطور / Developer

تم تطوير هذا الموقع باستخدام Replit Agent.
Developed using Replit Agent.