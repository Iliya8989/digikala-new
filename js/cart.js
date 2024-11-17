window.addEventListener('scroll', function() {
    var cartText = document.querySelector('.teuqthva');
    var scrollPosition = window.scrollY;
    var documentHeight = document.body.scrollHeight;
    var windowHeight = window.innerHeight;

    // ذخیره متن فعلی برای بررسی اینکه آیا تغییر لازم است یا نه
    var currentText = cartText.textContent;

    // بررسی اینکه آیا به وسط صفحه رسیده‌ایم یا نه
    if (scrollPosition > (documentHeight - windowHeight) / 2) {
        if (currentText !== 'سوپرمارکت | تنوع بالا و پرتخفیف') {
            cartText.style.opacity = 0;  // محو کردن متن
            setTimeout(function() {
                cartText.textContent = 'سوپرمارکت | تنوع بالا و پرتخفیف';
                cartText.style.opacity = 1;  // ظاهر شدن متن جدید
            }, 500);  // تأخیر برای اتمام انیمیشن محو
        }
    } else {
        if (currentText !== 'سوپرمارکت') {
            cartText.style.opacity = 0;  // محو کردن متن
            setTimeout(function() {
                cartText.textContent = 'سوپرمارکت';
                cartText.style.opacity = 1;  // ظاهر شدن متن جدید
            }, 500);  // تأخیر برای اتمام انیمیشن محو
        }
    }
});
