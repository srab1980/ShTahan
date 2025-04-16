"""
إنشاء صور وهمية للمقالات
"""
import os
from PIL import Image, ImageDraw, ImageFont
import random

def create_article_image(filename, text, width=800, height=450):
    """إنشاء صورة وهمية لمقال"""
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
    d.rectangle(
        [
            position[0] - padding, 
            position[1] - padding, 
            position[0] + text_width + padding, 
            position[1] + text_height + padding
        ], 
        fill=(212, 175, 55)  # لون ذهبي
    )
    
    # كتابة النص
    d.text(position, text, fill='white', font=font)
    
    # حفظ الصورة
    img.save(filename)
    print(f"تم إنشاء الصورة: {filename}")

def main():
    """الدالة الرئيسية لإنشاء الصور"""
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