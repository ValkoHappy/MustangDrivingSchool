<?php
// Простой парсер .env файла для REG.RU хостинга
// ВАЖНО: Этот файл не должен выводить ничего!

function loadEnv($filePath) {
    if (!file_exists($filePath)) {
        return;
    }
    
    $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        // Пропускаем комментарии
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        
        // Парсим KEY=VALUE
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            
            // Убираем кавычки если есть
            $value = trim($value, '"\'');
            
            // Устанавливаем переменную окружения если еще не установлена
            if (!getenv($key)) {
                putenv("$key=$value");
                $_ENV[$key] = $value;
                $_SERVER[$key] = $value;
            }
        }
    }
}

// Загружаем .env из корня проекта
$envPath = dirname(__DIR__) . '/.env';
if (file_exists($envPath)) {
    loadEnv($envPath);
}

// Также пробуем загрузить из текущей директории (на случай если .env рядом)
if (file_exists(__DIR__ . '/.env')) {
    loadEnv(__DIR__ . '/.env');
}
?>

