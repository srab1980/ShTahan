"""
Seed database with initial data for Sheikh Mustafa Al-Tahhan website
"""
import json
import os
from app import app, db
from models import Book, Article, GalleryImage

def seed_books():
    """Seed books from static JSON data"""
    print("Seeding books...")
    try:
        # Check if books already exist
        existing_books = Book.query.count()
        if existing_books > 0:
            print(f"Books already exist in database ({existing_books} found). Skipping...")
            return

        # Load books from static JSON file
        with open('static/data/books.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            books = data.get('books', [])
            
        # Add books to database
        for book in books:
            new_book = Book(
                title=book['title'],
                language=book['language'],
                category=book['category'],
                cover=book['cover'],
                download=book['download'],
                description=book['description']
            )
            db.session.add(new_book)
        
        db.session.commit()
        print(f"Successfully added {len(books)} books to database")
    except Exception as e:
        db.session.rollback()
        print(f"Error seeding books: {e}")

def seed_gallery():
    """Seed gallery with sample images"""
    print("Seeding gallery...")
    try:
        # Check if gallery images already exist
        existing_images = GalleryImage.query.count()
        if existing_images > 0:
            print(f"Gallery images already exist in database ({existing_images} found). Skipping...")
            return
            
        # Sample gallery images
        images = [
            {
                "url": "static/img/gallery/gallery-1.jpg",
                "caption": "الشيخ مصطفى الطحان خلال مؤتمر دولي"
            },
            {
                "url": "static/img/gallery/gallery-2.jpg",
                "caption": "حفل توقيع كتاب من تأليف الشيخ"
            },
            {
                "url": "static/img/gallery/gallery-3.jpg",
                "caption": "الشيخ مصطفى الطحان في محاضرة ثقافية"
            },
            {
                "url": "static/img/gallery/gallery-4.jpg",
                "caption": "مشاركة الشيخ في ندوة فكرية"
            },
            {
                "url": "static/img/gallery/gallery-5.jpg",
                "caption": "لقاء مع طلاب العلم"
            },
            {
                "url": "static/img/gallery/gallery-6.jpg",
                "caption": "جلسة نقاش مع علماء معاصرين"
            }
        ]
        
        # Add images to database
        for image in images:
            new_image = GalleryImage(
                url=image['url'],
                caption=image['caption']
            )
            db.session.add(new_image)
        
        db.session.commit()
        print(f"Successfully added {len(images)} gallery images to database")
    except Exception as e:
        db.session.rollback()
        print(f"Error seeding gallery: {e}")

def seed_articles():
    """Seed articles with sample data"""
    print("Seeding articles...")
    try:
        # Check if articles already exist
        existing_articles = Article.query.count()
        if existing_articles > 0:
            print(f"Articles already exist in database ({existing_articles} found). Skipping...")
            return
            
        # Sample articles
        articles = [
            {
                "title": "منهج التربية الإسلامية",
                "summary": "مقالة عن أهمية التربية الإسلامية في بناء شخصية الفرد والمجتمع",
                "content": """
                <p>تعد التربية الإسلامية من أهم الركائز في بناء شخصية الفرد المسلم وتكوين المجتمع الإسلامي القوي. إن منهج التربية في الإسلام منهج متكامل يشمل جميع جوانب الحياة، ويهتم بالروح والعقل والجسد معاً.</p>
                
                <p>يقوم منهج التربية الإسلامية على أساس الوحي والسنة النبوية، ويهدف إلى بناء الإنسان الصالح الذي يعمر الأرض وفق منهج الله عز وجل. وتشمل التربية الإسلامية عدة جوانب، منها التربية الإيمانية، والتربية الأخلاقية، والتربية العقلية، والتربية البدنية.</p>
                
                <p>ومن أهم خصائص المنهج التربوي الإسلامي أنه منهج رباني المصدر، شامل لجميع جوانب الحياة، متوازن، مرن يراعي الفروق الفردية، ويهتم بالجانب العملي التطبيقي في حياة المسلم.</p>
                """
            },
            {
                "title": "التحديات المعاصرة في تربية النشء",
                "summary": "دراسة في التحديات التي تواجه الآباء والمربين في العصر الحديث",
                "content": """
                <p>يواجه المربون في العصر الحالي العديد من التحديات التي تؤثر على عملية التربية، ومن أبرز هذه التحديات: العولمة وتأثيراتها الثقافية، ووسائل التواصل الاجتماعي وما تحمله من قيم وأفكار قد تتعارض مع قيمنا وأخلاقنا، والغزو الفكري والثقافي، وضعف دور المؤسسات التربوية.</p>
                
                <p>ولمواجهة هذه التحديات لا بد من تكاتف جهود الأسرة والمدرسة والمسجد ووسائل الإعلام من أجل تربية جيل معتز بهويته الإسلامية، ومحصن ضد التيارات الفكرية المنحرفة، ومتسلح بالعلم والمعرفة.</p>
                
                <p>إن تربية النشء على القيم الإسلامية تحتاج إلى وعي من المربين بالتحديات المعاصرة، واستخدام وسائل وأساليب تربوية معاصرة تتناسب مع متطلبات العصر وتواكب التطورات التقنية، مع الحفاظ على الأصول والثوابت الإسلامية.</p>
                """
            },
            {
                "title": "مفهوم الوسطية في الإسلام",
                "summary": "شرح لمفهوم الوسطية في الإسلام وأهميتها في حياة المسلم المعاصر",
                "content": """
                <p>الوسطية من المفاهيم الأساسية في الإسلام، وهي سمة من سمات هذا الدين العظيم. قال تعالى: "وكذلك جعلناكم أمة وسطاً لتكونوا شهداء على الناس ويكون الرسول عليكم شهيداً".</p>
                
                <p>والوسطية تعني الاعتدال والتوازن في العقيدة والعبادة والأخلاق والمعاملات، وهي منهج وسلوك يرفض الغلو والتطرف، ويبتعد عن التفريط والتقصير.</p>
                
                <p>وتكتسب الوسطية أهمية بالغة في حياة المسلم المعاصر، فهي تساعده على التعامل مع متغيرات العصر ومستجداته بمنهج سليم يجمع بين الأصالة والمعاصرة، ويحقق له التوازن في جميع جوانب حياته.</p>
                
                <p>وتتجلى الوسطية في مظاهر عديدة، منها: الوسطية في العقيدة، والوسطية في العبادة، والوسطية في الأخلاق والمعاملات، والوسطية في النظرة إلى الدنيا والآخرة.</p>
                """
            }
        ]
        
        # Add articles to database
        for article in articles:
            new_article = Article(
                title=article['title'],
                summary=article['summary'],
                content=article['content']
            )
            db.session.add(new_article)
        
        db.session.commit()
        print(f"Successfully added {len(articles)} articles to database")
    except Exception as e:
        db.session.rollback()
        print(f"Error seeding articles: {e}")

def main():
    """Main function to seed the database"""
    with app.app_context():
        # Create tables if they don't exist
        db.create_all()
        
        # Seed data
        seed_books()
        seed_gallery()
        seed_articles()
        
        print("Database seeding completed!")

if __name__ == "__main__":
    main()