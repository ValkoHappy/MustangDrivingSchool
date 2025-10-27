// Netlify Serverless Function
// Токен будет СКРЫТ на сервере Netlify!

exports.handler = async (event) => {
  // Разрешаем только POST запросы
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, message: 'Method Not Allowed' })
    };
  }

  try {
    // Токен и Chat ID хранятся в Environment Variables Netlify (секретно!)
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    // Парсим данные из формы
    const params = new URLSearchParams(event.body);
    const name = params.get('name');
    const phone = params.get('phone');

    // Валидация
    if (!name || !phone) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: 'Не все поля заполнены'
        })
      };
    }

    // Формируем сообщение
    const message = `🆕 <b>Новая заявка с сайта!</b>\n\n` +
                   `👤 <b>Имя:</b> ${name}\n` +
                   `📱 <b>Телефон:</b> ${phone}\n` +
                   `📅 <b>Дата:</b> ${new Date().toLocaleString('ru-RU')}\n` +
                   `\n🚗 Автошкола «Мустанг»`;

    // Отправляем в Telegram
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });

    const result = await response.json();

    if (result.ok) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.'
        })
      };
    } else {
      console.error('Telegram API error:', result);
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          message: 'Произошла ошибка при отправке.'
        })
      };
    }

  } catch (error) {
    console.error('Server error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: 'Ошибка сервера.'
      })
    };
  }
};
