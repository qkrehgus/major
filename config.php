<?php
// config.php - 영화싹모아 설정 파일

// 데이터베이스 설정
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASSWORD', '');
define('DB_NAME', 'movie_db');

// 사이트 설정
define('SITE_NAME', '영화싹모아');
define('SITE_URL', 'http://localhost/movie-site/');
define('ADMIN_EMAIL', 'admin@movissakmoa.com');

// 세션 설정
session_start();
session_set_cookie_params([
    'lifetime' => 86400,
    'path' => '/',
    'secure' => false,
    'httponly' => true,
    'samesite' => 'Lax'
]);

// 에러 리포팅
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/logs/error.log');

// 업로드 설정
define('UPLOAD_DIR', __DIR__ . '/uploads/');
define('ALLOWED_IMAGE_TYPES', ['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
define('MAX_FILE_SIZE', 5242880); // 5MB

// 보안 설정
define('HASH_ALGORITHM', 'sha256');
define('TOKEN_LIFETIME', 3600); // 1시간

// 헤더 설정
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=utf-8");
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: SAMEORIGIN");

// 데이터베이스 연결 함수
function getDBConnection() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
    
    if ($conn->connect_error) {
        http_response_code(500);
        die(json_encode([
            'success' => false,
            'message' => '데이터베이스 연결 실패'
        ]));
    }
    
    $conn->set_charset('utf8mb4');
    return $conn;
}

// 로그 함수
function log_action($action, $user_id = null, $details = null) {
    $log_file = __DIR__ . '/logs/actions.log';
    $timestamp = date('Y-m-d H:i:s');
    $ip = $_SERVER['REMOTE_ADDR'];
    $log_message = "[$timestamp] IP: $ip | User: $user_id | Action: $action | Details: $details\n";
    file_put_contents($log_file, $log_message, FILE_APPEND);
}

// 성공 응답
function send_success($message = '', $data = []) {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

// 오류 응답
function send_error($message = '', $code = 400) {
    http_response_code($code);
    echo json_encode([
        'success' => false,
        'message' => $message
    ]);
    exit;
}

?>