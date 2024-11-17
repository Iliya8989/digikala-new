import os
import re
import random
import string
import json

# تابع تولید رشته‌های رندوم برای نام کلاس‌ها
def generate_random_string(length=8):
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

# دیکشنری برای ذخیره‌سازی کلاس‌های قدیمی و کلاس‌های جدید
class_mappings = {}

# لیست کلاس‌هایی که نباید تغییر کنند
EXCLUDED_CLASSES = ["swiper", "b16", "b161", "contib", "reds", "tib", "contia", "bb78", "imgs1", "offerbox", "feat", "fe", "toman", "text-neutral wih1", "bb78", "offbox"]

# الگوی regex برای یافتن کلاس‌های HTML
class_pattern = re.compile(r'class="([^"]*)"')

# تابع جایگزینی کلاس‌ها در محتوای HTML
def replace_classes_in_html(content):
    def replace_class(match):
        classes = match.group(1).split()  # کلاس‌ها را از هم جدا می‌کند
        new_classes = []
        for cls in classes:
            if any(exc in cls for exc in EXCLUDED_CLASSES):  # بررسی استثناها
                new_classes.append(cls)
            else:
                if cls not in class_mappings:
                    new_class = generate_random_string()
                    class_mappings[cls] = new_class
                new_classes.append(class_mappings[cls])
        return f'class="{" ".join(new_classes)}"'

    return class_pattern.sub(replace_class, content)

# تابع جایگزینی کلاس‌ها در محتوای فایل‌های CSS و JavaScript بر اساس نگاشت
def replace_classes_in_file(content):
    for old_class, new_class in class_mappings.items():
        # جایگزینی دقیق کلاس‌ها با regex در فایل CSS یا جاوااسکریپت
        content = re.sub(r'(?<![-\w])' + re.escape(old_class) + r'(?![-\w])', new_class, content)
    return content

# مسیر فایل‌های HTML، CSS و JavaScript
html_file_path = "index.html"
css_files = ["css/all.css", "css/autoSwiper.css", "css/Button.css", "css/divs.css",
             "css/footer.css", "css/header.css", "css/popups.css", "css/story.css",
             "css/styles.css", "css/swiper_bullet.css", "css/Swipers.css"]
js_files = ["js/cart.js", "js/popups.js", "js/script.js"]

# بروزرسانی کلاس‌ها در فایل HTML
try:
    with open(html_file_path, "r", encoding="utf-8", errors="ignore") as file:
        content = file.read()
    # جایگزینی کلاس‌ها در محتوای HTML
    updated_content = replace_classes_in_html(content)
    # ذخیره محتوای جدید در فایل HTML
    with open(html_file_path, "w", encoding="utf-8") as file:
        file.write(updated_content)
    print(f"کلاس‌های فایل HTML '{html_file_path}' به‌روز شدند.")
except Exception as e:
    print(f"خطا در پردازش فایل HTML {html_file_path}: {e}")

# ذخیره‌سازی کلاس‌های قدیمی و جدید در یک فایل JSON
mappings_file = "class_mappings.json"
try:
    with open(mappings_file, "w", encoding="utf-8") as f:
        json.dump(class_mappings, f, ensure_ascii=False, indent=4)
    print(f"نگاشت کلاس‌ها در فایل '{mappings_file}' ذخیره شد.")
except Exception as e:
    print(f"خطا در ذخیره‌سازی نگاشت کلاس‌ها: {e}")

# بروزرسانی فایل‌های CSS
for css_file in css_files:
    try:
        with open(css_file, "r", encoding="utf-8", errors="ignore") as file:
            content = file.read()
        # جایگزینی کلاس‌ها بر اساس نگاشت
        updated_content = replace_classes_in_file(content)
        # ذخیره محتوای جدید در فایل CSS
        with open(css_file, "w", encoding="utf-8") as file:
            file.write(updated_content)
        print(f"کلاس‌های فایل CSS '{css_file}' به‌روز شدند.")
    except Exception as e:
        print(f"خطا در پردازش فایل CSS {css_file}: {e}")

# بروزرسانی فایل‌های JavaScript
for js_file in js_files:
    try:
        with open(js_file, "r", encoding="utf-8", errors="ignore") as file:
            content = file.read()
        # جایگزینی کلاس‌ها بر اساس نگاشت
        updated_content = replace_classes_in_file(content)
        # ذخیره محتوای جدید در فایل JavaScript
        with open(js_file, "w", encoding="utf-8") as file:
            file.write(updated_content)
        print(f"کلاس‌های فایل JavaScript '{js_file}' به‌روز شدند.")
    except Exception as e:
        print(f"خطا در پردازش فایل JavaScript {js_file}: {e}")

print("بروزرسانی کلاس‌ها در فایل‌های HTML، CSS و JavaScript تکمیل شد.")
