"""
A script to add sample articles to the database.

This script populates the database with a predefined set of articles
if no articles currently exist. It is intended to be run from the
command line within the Flask application context.
"""
import os
import sys
from datetime import datetime, timedelta
from app import app, db
from models import Article

def seed_articles():
    """Adds sample article data to the database.

    Checks if any articles already exist. If not, it adds a list of
    predefined articles with titles, summaries, content, categories,
    and images to the database.
    """
    
    # فحص إذا كانت توجد مقالات في قاعدة البيانات
    if Article.query.count() > 0:
        print(f"Articles already exist ({Article.query.count()} found). Skipping.")
        return

    # إنشاء قائمة بالمقالات
    articles = [
        {
            "title": "التربية الإيمانية وأثرها في تنشئة الشباب",
            "summary": "تناقش هذه المقالة أهمية التربية الإيمانية ودورها في بناء شخصية الشباب المسلم وتحصينه من التيارات الفكرية المعاصرة.",
            "content": """
            <h2>التربية الإيمانية وأثرها في تنشئة الشباب</h2>
            <p>من أهم ما يميز التربية الإيمانية هو أنها تعتمد على منهج متكامل...</p>
            """,
            "category": "تربية",
            "image": "/static/img/articles/article1.jpg",
            "created_at": datetime.utcnow() - timedelta(days=5)
        },
        {
            "title": "منهج الشيخ مصطفى الطحان في الدعوة والتربية",
            "summary": "نظرة تحليلية لمنهج الشيخ مصطفى الطحان في الدعوة والتربية وأثره في تكوين جيل من الدعاة والمربين.",
            "content": """
            <h2>منهج الشيخ مصطفى الطحان في الدعوة والتربية</h2>
            <p>امتاز منهج الشيخ مصطفى الطحان رحمه الله في الدعوة والتربية بالوسطية والاعتدال...</p>
            """,
            "category": "فكر إسلامي",
            "image": "/static/img/articles/article2.jpg",
            "created_at": datetime.utcnow() - timedelta(days=3)
        },
        {
            "title": "دور المراكز الإسلامية في الغرب",
            "summary": "تتناول هذه المقالة أهمية المراكز الإسلامية في الغرب ودورها في الحفاظ على الهوية الإسلامية وتقديم صورة صحيحة عن الإسلام.",
            "content": """
            <h2>دور المراكز الإسلامية في الغرب</h2>
            <p>أصبحت المراكز الإسلامية في الغرب تمثل منارات هداية...</p>
            """,
            "category": "مجتمع",
            "image": "/static/img/articles/article3.jpg",
            "created_at": datetime.utcnow() - timedelta(days=2)
        },
        {
            "title": "تحديات التعليم الإسلامي في العصر الحديث",
            "summary": "دراسة للتحديات التي تواجه التعليم الإسلامي في العصر الحديث وسبل تطويره ليواكب متطلبات العصر.",
            "content": """
            <h2>تحديات التعليم الإسلامي في العصر الحديث</h2>
            <p>يواجه التعليم الإسلامي في العصر الحديث تحديات كبيرة...</p>
            """,
            "category": "تربية",
            "image": "/static/img/articles/article4.jpg",
            "created_at": datetime.utcnow() - timedelta(days=1)
        },
        {
            "title": "الوسطية في الخطاب الإسلامي المعاصر",
            "summary": "بحث في مفهوم الوسطية وأهميتها في الخطاب الإسلامي المعاصر ودورها في مواجهة التطرف والغلو.",
            "content": """
            <h2>الوسطية في الخطاب الإسلامي المعاصر</h2>
            <p>تعتبر الوسطية من أهم خصائص الدين الإسلامي...</p>
            """,
            "category": "فكر إسلامي",
            "image": "/static/img/articles/article5.jpg",
            "created_at": datetime.utcnow() - timedelta(hours=12)
        },
        {
            "title": "أثر الإعلام الجديد على الهوية الإسلامية",
            "summary": "دراسة لتأثير وسائل الإعلام الجديدة والتواصل الاجتماعي على الهوية الإسلامية وكيفية الاستفادة منها.",
            "content": """
            <h2>أثر الإعلام الجديد على الهوية الإسلامية</h2>
            <p>أحدثت وسائل الإعلام الجديدة ومنصات التواصل الاجتماعي تغييرات جذرية...</p>
            """,
            "category": "مجتمع",
            "image": "/static/img/articles/article6.jpg",
            "created_at": datetime.utcnow() - timedelta(hours=6)
        }
    ]

    # إضافة المقالات إلى قاعدة البيانات
    for article_data in articles:
        if not Article.query.filter_by(title=article_data['title']).first():
            article = Article(**article_data)
            db.session.add(article)
    
    # حفظ التغييرات في قاعدة البيانات
    db.session.commit()
    print(f"Successfully added {len(articles)} articles.")

if __name__ == "__main__":
    # يجب تشغيل هذا السكريبت ضمن سياق التطبيق
    with app.app_context():
        seed_articles()