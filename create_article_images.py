"""
A script to generate placeholder images for articles.

This script uses the Pillow library to create simple images with text,
which can be used as placeholders for article thumbnails. The script is
primarily in Arabic but is documented in English for consistency.
"""
import os
from PIL import Image, ImageDraw, ImageFont
import random

def create_article_image(filename, text, width=800, height=450):
    """Creates a placeholder image for an article.

    Generates an image with a random background color and centered text.
    The text has a golden rectangle behind it for better visibility.

    Args:
        filename (str): The path where the image will be saved.
        text (str): The text to write on the image.
        width (int, optional): The width of the image. Defaults to 800.
        height (int, optional): The height of the image. Defaults to 450.
    """
    # إنشاء صورة جديدة بالأبعاد المحددة
    img = Image.new('RGB', (width, height), color=(random.randint(26, 58), random.randint(60, 108), random.randint(140, 200)))
    
    # إنشاء كائن للرسم على الصورة
    d = ImageDraw.Draw(img)
    
    # تحميل الخط (إذا لم يكن موجوداً، سيتم استخدام الخط الافتراضي)
    try:
        font = ImageFont.truetype("arial.ttf", 40)
    except IOError:
        font = ImageFont.load_default()
    
    # حساب موقع النص
    text_width, text_height = d.textbbox((0, 0), text, font=font)[2:4]
    position = ((width - text_width) // 2, (height - text_height) // 2)
    
    # رسم مستطيل خلفي للنص
    padding = 20
    rectangle_position = (
        position[0] - padding, 
        position[1] - padding, 
        position[0] + text_width + padding, 
        position[1] + text_height + padding
    )
    d.rectangle(rectangle_position, fill=(212, 175, 55))  # لون ذهبي
    
    # كتابة النص
    d.text(position, text, fill='white', font=font)
    
    # حفظ الصورة
    img.save(filename)
    print(f"تم إنشاء الصورة: {filename}")

def main():
    """Main function to create a set of placeholder article images."""
    # التأكد من وجود مجلد الصور
    img_dir = 'static/img/articles'
    os.makedirs(img_dir, exist_ok=True)
    
    # إنشاء عدة صور للمقالات
    articles = [
        "التربية الإيمانية",
        "منهج الشيخ الطحان",
        "المراكز الإسلامية",
        "التعليم الإسلامي",
        "الوسطية",
        "الإعلام الجديد"
    ]
    
    for i, text in enumerate(articles, 1):
        create_article_image(
            os.path.join(img_dir, f'article{i}.jpg'),
            text
        )

if __name__ == "__main__":
    main()