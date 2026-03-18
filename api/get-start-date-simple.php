<?php
// Упрощенная версия для теста
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Cache-Control: no-store');

// Просто возвращаем дату по умолчанию
echo json_encode([
    'success' => true,
    'date' => '1 ноября'
]);
?>

