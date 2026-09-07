<?php
/** Return the configured training start date without contacting a messaging provider. */

declare(strict_types=1);

require_once __DIR__ . '/config.php';

if (!in_array(($_SERVER['REQUEST_METHOD'] ?? ''), ['GET', 'HEAD'], true)) {
    jsonResponse(false, 'Method Not Allowed', 405);
}

$configuredDate = envValue('START_DATE', 'ОТКРЫТ');
$displayDate = $configuredDate;

// Accept ISO dates in .env and keep the public response human-readable.
$date = DateTime::createFromFormat('!Y-m-d', $configuredDate ?: '');
if ($date instanceof DateTime && $date->format('Y-m-d') === $configuredDate) {
    $months = [
        1 => 'января', 2 => 'февраля', 3 => 'марта', 4 => 'апреля',
        5 => 'мая', 6 => 'июня', 7 => 'июля', 8 => 'августа',
        9 => 'сентября', 10 => 'октября', 11 => 'ноября', 12 => 'декабря',
    ];
    $displayDate = (int) $date->format('j') . ' ' . $months[(int) $date->format('n')];
}

header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('X-Content-Type-Options: nosniff');
echo json_encode(['success' => true, 'date' => $displayDate], JSON_UNESCAPED_UNICODE);
