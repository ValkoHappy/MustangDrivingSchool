<?php
// Простой тест для проверки работы PHP API
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

echo json_encode([
    'success' => true,
    'message' => 'PHP работает!',
    'path' => __DIR__,
    'file_exists' => file_exists(__DIR__ . '/get-start-date.php'),
    'config_exists' => file_exists(__DIR__ . '/config.php'),
    'env_exists' => file_exists(dirname(__DIR__) . '/.env')
]);
?>

