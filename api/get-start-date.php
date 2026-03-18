<?php
// PHP Script: returns START_DATE from Telegram group description
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
header('Cache-Control: no-store');

// Получаем переменные из .env или напрямую (на REG.RU можно через cPanel)
$BOT_TOKEN = getenv('TELEGRAM_BOT_TOKEN') ?: ($_ENV['TELEGRAM_BOT_TOKEN'] ?? '8470736611:AAFhZAlwgPDgVhRisq9HguHPpFwsdResCSA');
$CHAT_ID = getenv('TELEGRAM_CHAT_ID') ?: ($_ENV['TELEGRAM_CHAT_ID'] ?? '-1003264980301');
$START_DATE = getenv('START_DATE') ?: ($_ENV['START_DATE'] ?? '1 ноября');

$startDate = $START_DATE;

try {
    // Получаем описание группы из Telegram
    $url = "https://api.telegram.org/bot{$BOT_TOKEN}/getChat?chat_id={$CHAT_ID}";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200 && $response) {
        $data = json_decode($response, true);
        
        // Если группа мигрировала в супергруппу
        if (!$data['ok'] && isset($data['parameters']['migrate_to_chat_id'])) {
            $newChatId = $data['parameters']['migrate_to_chat_id'];
            $url = "https://api.telegram.org/bot{$BOT_TOKEN}/getChat?chat_id={$newChatId}";
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            $response = curl_exec($ch);
            curl_close($ch);
            $data = json_decode($response, true);
        }
        
        if ($data['ok'] && isset($data['result']['description'])) {
            $description = $data['result']['description'];
            if (preg_match('/START_DATE:\s*(.+?)(\n|$)/i', $description, $matches)) {
                $startDate = trim($matches[1]);
            }
        }
    }
} catch (Exception $e) {
    error_log('Error fetching start date: ' . $e->getMessage());
}

echo json_encode([
    'success' => true,
    'date' => $startDate
], JSON_UNESCAPED_UNICODE);

// Завершаем буферизацию и отправляем ответ
ob_end_flush();
exit;
