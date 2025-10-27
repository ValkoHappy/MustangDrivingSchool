// Netlify Function: returns START_DATE from Telegram group description

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, message: 'Method Not Allowed' })
    };
  }

  try {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    let startDate = '1 ноября';

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/getChat?chat_id=${CHAT_ID}`;
    const response = await fetch(url);
    let data = await response.json();

    // If group migrated to a supergroup, retry with the new id
    if (!data.ok && data.parameters && data.parameters.migrate_to_chat_id) {
      const newChatId = data.parameters.migrate_to_chat_id;
      try {
        const retry = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChat?chat_id=${newChatId}`);
        const retryData = await retry.json();
        if (retryData.ok) {
          data = retryData;
          console.warn('TELEGRAM_CHAT_ID migrated. Update env to:', newChatId);
        }
      } catch (e) {
        console.error('Retry getChat after migration failed:', e);
      }
    }

    if (data.ok && data.result && data.result.description) {
      const description = data.result.description;
      const match = description.match(/START_DATE:\s*(.+?)(\n|$)/i);
      if (match && match[1]) {
        startDate = match[1].trim();
      }
    }

    if (startDate === '1 ноября' && process.env.START_DATE) {
      startDate = process.env.START_DATE;
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store'
      },
      body: JSON.stringify({ success: true, date: startDate })
    };

  } catch (error) {
    console.error('Error fetching start date:', error);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store'
      },
      body: JSON.stringify({ success: true, date: '1 ноября' })
    };
  }
};

