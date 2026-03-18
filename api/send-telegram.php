<?php
// PHP Script: отправка заявки в Telegram
// Для REG.RU хостинга

// Включаем буферизацию вывода чтобы перехватить любые ошибки
ob_start();

// Включаем обработку ошибок
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Загружаем config.php если существует
if (file_exists(__DIR__ . '/config.php')) {
    require_once __DIR__ . '/config.php';
}

// Очищаем буфер на случай если что-то вывелось
ob_clean();

// Устанавливаем заголовки
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');

// Разрешаем только POST запросы
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

// Получаем переменные из .env или напрямую (на REG.RU можно через cPanel)
$TELEGRAM_BOT_TOKEN = getenv('TELEGRAM_BOT_TOKEN') ?: ($_ENV['TELEGRAM_BOT_TOKEN'] ?? '8470736611:AAFhZAlwgPDgVhRisq9HguHPpFwsdResCSA');
$TELEGRAM_CHAT_ID = getenv('TELEGRAM_CHAT_ID') ?: ($_ENV['TELEGRAM_CHAT_ID'] ?? '-1003264980301');

// Получаем данные из формы
$name = isset($_POST['name']) ? trim($_POST['name']) : '';
$phone = isset($_POST['phone']) ? trim($_POST['phone']) : '';

// Валидация
if (empty($name) || empty($phone)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Не все поля заполнены'
    ]);
    exit;
}

// Формируем сообщение
$message = "🆕 <b>Новая заявка с сайта!</b>\n\n" .
           "👤 <b>Имя:</b> " . htmlspecialchars($name) . "\n" .
           "📱 <b>Телефон:</b> " . htmlspecialchars($phone) . "\n" .
           "📅 <b>Дата:</b> " . date('d.m.Y H:i') . "\n" .
           "\n🚗 Автошкола «Мустанг»";

// Отправляем в Telegram
$telegramUrl = "https://api.telegram.org/bot{$TELEGRAM_BOT_TOKEN}/sendMessage";

$data = [
    'chat_id' => $TELEGRAM_CHAT_ID,
    'text' => $message,
    'parse_mode' => 'HTML'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $telegramUrl);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$result = json_decode($response, true);

// Если группа мигрировала в супергруппу
if (!$result['ok'] && isset($result['parameters']['migrate_to_chat_id'])) {
    $newChatId = $result['parameters']['migrate_to_chat_id'];
    $data['chat_id'] = $newChatId;
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $telegramUrl);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $response = curl_exec($ch);
    curl_close($ch);
    
    $result = json_decode($response, true);
    
    if ($result['ok']) {
        echo json_encode([
            'success' => true,
            'message' => 'Заявка отправлена. Обновите TELEGRAM_CHAT_ID на новый.'
        ]);
        exit;
    }
}

if ($result['ok']) {
    echo json_encode([
        'success' => true,
        'message' => 'Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.'
    ], JSON_UNESCAPED_UNICODE);
} else {
    error_log('Telegram API error: ' . json_encode($result));
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Произошла ошибка при отправке.'
    ], JSON_UNESCAPED_UNICODE);
}

// Завершаем буферизацию и отправляем ответ
ob_end_flush();
exit;
