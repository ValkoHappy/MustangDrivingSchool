<?php
/** Send a website lead to the configured VK community conversation. */

declare(strict_types=1);

require_once __DIR__ . '/config.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    jsonResponse(false, 'Method Not Allowed', 405);
}

$contentLength = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
if ($contentLength > 2048) {
    jsonResponse(false, 'Запрос слишком большой.', 413);
}

$contentType = strtolower(trim(explode(';', (string) ($_SERVER['CONTENT_TYPE'] ?? ''), 2)[0]));
if ($contentType !== 'application/x-www-form-urlencoded') {
    jsonResponse(false, 'Неподдерживаемый формат запроса.', 415);
}

if (!requestComesFromThisSite()) {
    jsonResponse(false, 'Запрос отклонён.', 403);
}

$honeypot = cleanText((string) ($_POST['website'] ?? ''), 120);
if ($honeypot !== '') {
    jsonResponse(false, 'Заявка не может быть отправлена.', 400);
}

if (($_POST['consent'] ?? '') !== 'on') {
    jsonResponse(false, 'Необходимо дать согласие на обработку данных.', 400);
}

$name = cleanText((string) ($_POST['name'] ?? ''), 100);
$phone = normalizedPhone((string) ($_POST['phone'] ?? ''));

if ($name === '' || strlen($name) < 2 || !preg_match('/^[\p{L}\p{M}][\p{L}\p{M}\s.' . "'" . '\-]{1,99}$/u', $name)) {
    jsonResponse(false, 'Проверьте имя.', 400);
}

if ($phone === null) {
    jsonResponse(false, 'Проверьте номер телефона.', 400);
}

if (rateLimitExceeded('ip:' . clientIp(), 5, 600)) {
    header('Retry-After: 600');
    jsonResponse(false, 'Слишком много попыток. Попробуйте позже.', 429);
}

$token = envValue('VK_ACCESS_TOKEN');
$peerId = envValue('VK_PEER_ID');
$apiVersion = envValue('VK_API_VERSION', '5.199');

if ($token === null || $peerId === null || !preg_match('/^\d+$/', $peerId) || !preg_match('/^\d+\.\d+$/', (string) $apiVersion)) {
    error_log('VK lead delivery is not configured.');
    jsonResponse(false, 'Сервис временно недоступен. Позвоните нам напрямую.', 503);
}

$message = "Новая заявка с сайта\n\n" .
    "Имя: {$name}\n" .
    "Телефон: {$phone}\n" .
    "Дата: " . date('d.m.Y H:i') . " (МСК)\n\n" .
    "Автошкола «Мустанг»";

try {
    $randomId = random_int(1, 2147483646);
} catch (Throwable $exception) {
    $randomId = (crc32(uniqid('', true)) & 0x7fffffff) ?: 1;
}

$payload = http_build_query([
    'access_token' => $token,
    'v' => $apiVersion,
    'peer_id' => $peerId,
    'random_id' => $randomId,
    'message' => $message,
], '', '&', PHP_QUERY_RFC3986);

if (!function_exists('curl_init')) {
    error_log('VK lead delivery requires the PHP cURL extension.');
    jsonResponse(false, 'Сервис временно недоступен. Позвоните нам напрямую.', 503);
}

$ch = curl_init('https://api.vk.com/method/messages.send');
if ($ch === false) {
    error_log('VK lead delivery could not initialize cURL.');
    jsonResponse(false, 'Не удалось отправить заявку. Позвоните нам напрямую.', 502);
}

curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $payload,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded'],
    CURLOPT_CONNECTTIMEOUT => 5,
    CURLOPT_TIMEOUT => 10,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_SSL_VERIFYHOST => 2,
]);

$response = curl_exec($ch);
$curlError = curl_error($ch);
$httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($response === false || $curlError !== '') {
    error_log('VK lead delivery transport error.');
    jsonResponse(false, 'Не удалось отправить заявку. Позвоните нам напрямую.', 502);
}

$result = json_decode($response, true);
if ($httpCode !== 200 || !is_array($result) || isset($result['error']) || !isset($result['response'])) {
    $errorCode = is_array($result) && isset($result['error']['error_code']) ? (int) $result['error']['error_code'] : 0;
    error_log('VK lead delivery API error code ' . $errorCode . ', HTTP ' . $httpCode . '.');
    jsonResponse(false, 'Не удалось отправить заявку. Позвоните нам напрямую.', 502);
}

jsonResponse(true, 'Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.');
