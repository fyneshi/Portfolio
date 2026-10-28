<?php
// ------------------------------------------------------------
// Site configuration — edit the DB values when deploying online
// ------------------------------------------------------------

// Hide PHP errors from visitors (log them instead)
ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

// Database credentials: the live server's values live in db_config.php
// (not committed to Git). Falls back to XAMPP defaults for local testing.
if (is_file(__DIR__ . '/db_config.php')) {
    require __DIR__ . '/db_config.php';
}
defined('DB_HOST') || define('DB_HOST', 'localhost');
defined('DB_NAME') || define('DB_NAME', 'portfolio_db');
defined('DB_USER') || define('DB_USER', 'root');
defined('DB_PASS') || define('DB_PASS', '');

// Owner details shown on the site
define('OWNER_NAME', 'Yuuki Ogawa');

// Admin account — password is stored only as a password_hash() value
define('ADMIN_USERNAME', 'admin');
define('ADMIN_PASSWORD_HASH', '$2y$10$f8tYfWxCWJHefe2Kmkl8heBd9kyYsHJjyaDxkJcANg7qnGklsKmea');

if (session_status() === PHP_SESSION_NONE) {
    // Own session name so logins don't mix with other sites on the same domain
    session_name('portfolio_session');
    session_start();
}

/**
 * Returns a shared PDO connection, or null if the database is unreachable.
 */
function db(): ?PDO
{
    static $pdo = null;
    if ($pdo === null) {
        try {
            $pdo = new PDO(
                'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
                DB_USER,
                DB_PASS,
                [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                ]
            );
        } catch (PDOException $e) {
            error_log('DB connection failed: ' . $e->getMessage());
            return null;
        }
    }
    return $pdo;
}

/** Escape output for HTML. */
function e(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

/** CSRF token helpers. */
function csrf_token(): string
{
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}

function csrf_valid(): bool
{
    return isset($_POST['csrf'], $_SESSION['csrf']) && hash_equals($_SESSION['csrf'], $_POST['csrf']);
}
