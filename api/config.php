<?php
/**
 * Shared configuration and small, dependency-free helpers for the REG.RU host.
 * This file must never print output or contain production credentials.
 */

declare(strict_types=1);

date_default_timezone_set('Europe/Moscow');

function loadEnv(string $filePath): void
{
    if (!is_readable($filePath)) {
        return;
    }

    $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        return;
    }

    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || strpos($line, '#') === 0 || strpos($line, '=') === false) {
            continue;
        }

        [$key, $value] = explode('=', $line, 2);
        $key = ltrim(trim($key), "\xEF\xBB\xBF");
        $value = trim($value);
        $value = trim($value, "\"'");

        if ($key === '' || getenv($key) !== false) {
            continue;
        }

        putenv($key . '=' . $value);
        $_ENV[$key] = $value;
    }
}

loadEnv(dirname(__DIR__) . '/.env');
loadEnv(__DIR__ . '/.env');

function envValue(string $key, ?string $default = null): ?string
{
    $value = getenv($key);
    if ($value === false || $value === '') {
        $value = $_ENV[$key] ?? $default;
    }

    return $value === null ? null : trim((string) $value);
}

function jsonResponse(bool $success, string $message, int $status = 200, array $extra = []): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=UTF-8');
    header('Cache-Control: no-store, no-cache, must-revalidate');
    header('X-Content-Type-Options: nosniff');
    echo json_encode(array_merge(['success' => $success, 'message' => $message], $extra), JSON_UNESCAPED_UNICODE);
    exit;
}

function cleanText(string $value, int $maxBytes): string
{
    $value = trim((string) preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $value));
    if (strlen($value) > $maxBytes) {
        $value = function_exists('mb_substr') ? mb_substr($value, 0, $maxBytes, 'UTF-8') : substr($value, 0, $maxBytes);
    }

    return trim($value);
}

function clientIp(): string
{
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    return filter_var($ip, FILTER_VALIDATE_IP) ? $ip : 'unknown';
}

function requestComesFromThisSite(): bool
{
    $fetchSite = strtolower(trim((string) ($_SERVER['HTTP_SEC_FETCH_SITE'] ?? '')));
    if ($fetchSite === 'cross-site') {
        return false;
    }

    $origin = trim((string) ($_SERVER['HTTP_ORIGIN'] ?? ''));
    if ($origin === '') {
        return true;
    }

    $originHost = parse_url($origin, PHP_URL_HOST);
    $requestHost = preg_replace('/:\d+$/', '', strtolower((string) ($_SERVER['HTTP_HOST'] ?? '')));

    return is_string($originHost) && $requestHost !== '' && strtolower($originHost) === $requestHost;
}

/**
 * File-based fixed-window limiter. It uses the system temp directory so no
 * writable project directory or database is required on shared hosting.
 */
function rateLimitExceeded(string $bucket, int $limit, int $windowSeconds): bool
{
    $file = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR .
        'mustang-' . hash('sha256', $bucket) . '.json';
    $handle = @fopen($file, 'c+');
    if ($handle === false) {
        return false;
    }

    $now = time();
    $blocked = false;
    if (flock($handle, LOCK_EX)) {
        $contents = stream_get_contents($handle);
        $timestamps = json_decode($contents ?: '[]', true);
        if (!is_array($timestamps)) {
            $timestamps = [];
        }
        $timestamps = array_values(array_filter($timestamps, static function ($timestamp) use ($now, $windowSeconds): bool {
            return is_int($timestamp) && $timestamp > ($now - $windowSeconds);
        }));
        $blocked = count($timestamps) >= $limit;
        if (!$blocked) {
            $timestamps[] = $now;
        }

        ftruncate($handle, 0);
        rewind($handle);
        fwrite($handle, json_encode($timestamps));
        fflush($handle);
        flock($handle, LOCK_UN);
    }
    fclose($handle);

    return $blocked;
}

function normalizedPhone(string $phone): ?string
{
    $phone = cleanText($phone, 40);
    if ($phone === '' || !preg_match('/^[+0-9()\s.-]+$/u', $phone)) {
        return null;
    }

    $digits = preg_replace('/\D+/', '', $phone);
    if ($digits === null) {
        return null;
    }
    if (strlen($digits) === 10 && $digits[0] === '9') {
        $digits = '7' . $digits;
    } elseif (strlen($digits) === 11 && $digits[0] === '8') {
        $digits = '7' . substr($digits, 1);
    }

    return strlen($digits) >= 10 && strlen($digits) <= 15 ? '+' . $digits : null;
}
