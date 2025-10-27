// Netlify Function для получения даты старта обучения
// Дата читается из описания Telegram группы

exports.handler = async (event) => {
  // Разрешаем GET запросы
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, message: 'Method Not Allowed' })
    };
  }

  try {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    // Дата по умолчанию
    let startDate = '1 ноября';

    // Получаем информацию о группе
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/getChat?chat_id=${CHAT_ID}`;

    const response = await fetch(url);
    const data = await response.json();

    // Ищем START_DATE: в описании группы
    if (data.ok && data.result && data.result.description) {
      const description = data.result.description;

      // Ищем строку "START_DATE: 15 декабря"
      const match = description.match(/START_DATE:\s*(.+?)(\n|$)/i);

      if (match && match[1]) {
        startDate = match[1].trim();
        console.log('Дата найдена в описании группы:', startDate);
      }
    }

    // Fallback: проверяем Environment Variable
    if (startDate === '1 ноября' && process.env.START_DATE) {
      startDate = process.env.START_DATE;
      console.log('Используется дата из Environment Variable:', startDate);
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600' // Кешируем на 1 час
      },
      body: JSON.stringify({
        success: true,
        date: startDate
      })
    };

  } catch (error) {
    console.error('Error fetching start date:', error);

    // Fallback - дата из HTML
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        date: '1 ноября'
      })
    };
  }
};
