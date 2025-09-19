"""
Seed the database with initial data for the Sheikh Mustafa Al-Tahhan website.

This script populates the database with initial data for books, gallery images,
and articles. It checks if data already exists to avoid duplication and can be
run from the command line.
"""
import json
import os
from app import app, db
from models import Book, Article, GalleryImage

def seed_books():
    """Seeds the database with books from a static JSON file.

    This function reads book data from 'static/data/books.json', checks if
    books already exist in the database, and if not, populates the Book table.
    """
    print("Seeding books...")
    try:
        if Book.query.count() > 0:
            print(f"Books already exist in database ({Book.query.count()} found). Skipping...")
            return

        with open('static/data/books.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            books = data.get('books', [])

        for book_data in books:
            new_book = Book(**book_data)
            db.session.add(new_book)

        db.session.commit()
        print(f"Successfully added {len(books)} books to database")
    except Exception as e:
        db.session.rollback()
        print(f"Error seeding books: {e}")

def seed_gallery():
    """Seeds the database with sample gallery images.

    This function adds a predefined list of sample images to the gallery if
    the GalleryImage table is empty.
    """
    print("Seeding gallery...")
    try:
        if GalleryImage.query.count() > 0:
            print(f"Gallery images already exist in database ({GalleryImage.query.count()} found). Skipping...")
            return

        images = [
            {"url": "static/img/gallery/gallery-1.jpg", "caption": "الشيخ مصطفى الطحان خلال مؤتمر دولي"},
            {"url": "static/img/gallery/gallery-2.jpg", "caption": "حفل توقيع كتاب من تأليف الشيخ"},
            {"url": "static/img/gallery/gallery-3.jpg", "caption": "الشيخ مصطفى الطحان في محاضرة ثقافية"},
            {"url": "static/img/gallery/gallery-4.jpg", "caption": "مشاركة الشيخ في ندوة فكرية"},
            {"url": "static/img/gallery/gallery-5.jpg", "caption": "لقاء مع طلاب العلم"},
            {"url": "static/img/gallery/gallery-6.jpg", "caption": "جلسة نقاش مع علماء معاصرين"}
        ]

        for image_data in images:
            new_image = GalleryImage(**image_data)
            db.session.add(new_image)

        db.session.commit()
        print(f"Successfully added {len(images)} gallery images to database")
    except Exception as e:
        db.session.rollback()
        print(f"Error seeding gallery: {e}")

def seed_articles():
    """Seeds the database with sample articles.

    This function adds a predefined list of sample articles to the database if
    the Article table is empty.
    """
    print("Seeding articles...")
    try:
        if Article.query.count() > 0:
            print(f"Articles already exist in database ({Article.query.count()} found). Skipping...")
            return

        articles = [
            {
                "title": "منهج التربية الإسلامية",
                "summary": "مقالة عن أهمية التربية الإسلامية في بناء شخصية الفرد والمجتمع",
                "content": "<p>تعد التربية الإسلامية من أهم الركائز...</p>"
            },
            {
                "title": "التحديات المعاصرة في تربية النشء",
                "summary": "دراسة في التحديات التي تواجه الآباء والمربين في العصر الحديث",
                "content": "<p>يواجه المربون في العصر الحالي العديد من التحديات...</p>"
            },
            {
                "title": "مفهوم الوسطية في الإسلام",
                "summary": "شرح لمفهوم الوسطية في الإسلام وأهميتها في حياة المسلم المعاصر",
                "content": "<p>الوسطية من المفاهيم الأساسية في الإسلام...</p>"
            }
        ]

        for article_data in articles:
            new_article = Article(**article_data)
            db.session.add(new_article)

        db.session.commit()
        print(f"Successfully added {len(articles)} articles to database")
    except Exception as e:
        db.session.rollback()
        print(f"Error seeding articles: {e}")

def main():
    """Main function to run all seeding operations.

    This function ensures the database tables are created and then calls the
    seeding functions for books, gallery, and articles within the Flask
    application context.
    """
    with app.app_context():
        db.create_all()
        seed_books()
        seed_gallery()
        seed_articles()
        print("Database seeding completed!")

if __name__ == "__main__":
    main()