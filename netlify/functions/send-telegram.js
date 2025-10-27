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

    let result = await response.json();
    // If group was migrated to a supergroup, retry with the new ID
    if (!result.ok && result.parameters && result.parameters.migrate_to_chat_id) {
      const newChatId = result.parameters.migrate_to_chat_id;
      try {
        const retry = await fetch(telegramUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: newChatId,
            text: message,
            parse_mode: 'HTML'
          })
        });
        const retryResult = await retry.json();
        if (retryResult.ok) {
          console.warn('TELEGRAM_CHAT_ID migrated. Update env to:', newChatId);
          return {
            statusCode: 200,
            body: JSON.stringify({
              success: true,
              message: 'Заявка отправлена. Обновите TELEGRAM_CHAT_ID на новый.'
            })
          };
        } else {
          console.error('Telegram retry failed:', retryResult);
          result = retryResult;
        }
      } catch (e) {
        console.error('Telegram retry error:', e);
      }
    }
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
