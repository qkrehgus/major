<?php
// api.php - 영화싹모아 API 서버

// CORS 설정
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

// 데이터베이스 연결
$dbHost = 'localhost';
$dbUser = 'root';
$dbPassword = '';
$dbName = 'movie_db';

$conn = new mysqli($dbHost, $dbUser, $dbPassword, $dbName);

if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => '데이터베이스 연결 실패']));
}

$conn->set_charset('utf8mb4');

// 요청 타입 확인
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$endpoint = basename($path);

// 라우팅
switch ($endpoint) {
    case 'api.php':
        handleMovieRequests($method, $conn);
        break;
    default:
        echo json_encode(['success' => false, 'message' => '잘못된 요청']);
        break;
}

// 사용자 가입
function registerUser($data, $conn) {
    $name = mysqli_real_escape_string($conn, $data['name']);
    $studentId = mysqli_real_escape_string($conn, $data['studentId']);
    $email = mysqli_real_escape_string($conn, $data['email']);
    $phone = mysqli_real_escape_string($conn, $data['phone']);
    $password = password_hash($data['password'], PASSWORD_BCRYPT);
    
    $sql = "INSERT INTO users (name, student_id, email, phone, password) 
            VALUES ('$name', '$studentId', '$email', '$phone', '$password')";
    
    if ($conn->query($sql)) {
        echo json_encode(['success' => true, 'message' => '가입 성공']);
    } else {
        echo json_encode(['success' => false, 'message' => '가입 실패']);
    }
}

// 사용자 로그인
function loginUser($data, $conn) {
    $email = mysqli_real_escape_string($conn, $data['email']);
    
    $sql = "SELECT * FROM users WHERE email='$email'";
    $result = $conn->query($sql);
    
    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        if (password_verify($data['password'], $user['password'])) {
            unset($user['password']);
            echo json_encode(['success' => true, 'user' => $user]);
        } else {
            echo json_encode(['success' => false, 'message' => '비밀번호 오류']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => '사용자를 찾을 수 없습니다']);
    }
}

// 영화 추가
function addMovie($data, $conn) {
    $name = mysqli_real_escape_string($conn, $data['name']);
    $year = mysqli_real_escape_string($conn, $data['year']);
    $category = mysqli_real_escape_string($conn, $data['category']);
    $director = mysqli_real_escape_string($conn, $data['director']);
    $description = mysqli_real_escape_string($conn, $data['description']);
    $trailer = mysqli_real_escape_string($conn, $data['trailer']);
    $poster = mysqli_real_escape_string($conn, $data['poster']);
    $photos = mysqli_real_escape_string($conn, $data['photos']);
    $userId = intval($data['userId']);
    
    $sql = "INSERT INTO movies (name, year, category, director, description, trailer, poster, photos, user_id, created_at) 
            VALUES ('$name', '$year', '$category', '$director', '$description', '$trailer', '$poster', '$photos', '$userId', NOW())";
    
    if ($conn->query($sql)) {
        $movieId = $conn->insert_id;
        echo json_encode(['success' => true, 'movieId' => $movieId, 'message' => '영화 추가 성공']);
    } else {
        echo json_encode(['success' => false, 'message' => '영화 추가 실패']);
    }
}

// 영화 수정
function updateMovie($data, $conn) {
    $id = intval($data['id']);
    $name = mysqli_real_escape_string($conn, $data['name']);
    $year = mysqli_real_escape_string($conn, $data['year']);
    $category = mysqli_real_escape_string($conn, $data['category']);
    $director = mysqli_real_escape_string($conn, $data['director']);
    $description = mysqli_real_escape_string($conn, $data['description']);
    $trailer = mysqli_real_escape_string($conn, $data['trailer']);
    $poster = mysqli_real_escape_string($conn, $data['poster']);
    $photos = mysqli_real_escape_string($conn, $data['photos']);
    
    $sql = "UPDATE movies SET name='$name', year='$year', category='$category', director='$director', 
            description='$description', trailer='$trailer', poster='$poster', photos='$photos', updated_at=NOW() 
            WHERE id='$id'";
    
    if ($conn->query($sql)) {
        echo json_encode(['success' => true, 'message' => '영화 수정 성공']);
    } else {
        echo json_encode(['success' => false, 'message' => '영화 수정 실패']);
    }
}

// 영화 삭제
function deleteMovie($id, $conn) {
    $id = intval($id);
    
    $sql = "DELETE FROM movies WHERE id='$id'";
    
    if ($conn->query($sql)) {
        $conn->query("DELETE FROM ratings WHERE movie_id='$id'");
        echo json_encode(['success' => true, 'message' => '영화 삭제 성공']);
    } else {
        echo json_encode(['success' => false, 'message' => '영화 삭제 실패']);
    }
}

// 영화 조회
function getMovies($category, $conn) {
    $sql = "SELECT m.*, 
            COALESCE(AVG(r.rating), 0) as avg_rating,
            COUNT(r.id) as rating_count
            FROM movies m 
            LEFT JOIN ratings r ON m.id = r.movie_id ";
    
    if ($category && $category !== 'all') {
        $category = mysqli_real_escape_string($conn, $category);
        $sql .= "WHERE m.category='$category' ";
    }
    
    $sql .= "GROUP BY m.id ORDER BY m.created_at DESC";
    
    $result = $conn->query($sql);
    $movies = [];
    
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $movies[] = $row;
        }
    }
    
    echo json_encode(['success' => true, 'movies' => $movies]);
}

// 영화 평가 추가
function addRating($data, $conn) {
    $movieId = intval($data['movieId']);
    $userId = intval($data['userId']);
    $rating = intval($data['rating']);
    $comment = mysqli_real_escape_string($conn, $data['comment']);
    
    // 기존 평가 확인
    $checkSql = "SELECT id FROM ratings WHERE movie_id='$movieId' AND user_id='$userId'";
    $result = $conn->query($checkSql);
    
    if ($result->num_rows > 0) {
        // 업데이트
        $sql = "UPDATE ratings SET rating='$rating', comment='$comment', created_at=NOW() 
                WHERE movie_id='$movieId' AND user_id='$userId'";
    } else {
        // 삽입
        $sql = "INSERT INTO ratings (movie_id, user_id, rating, comment, created_at) 
                VALUES ('$movieId', '$userId', '$rating', '$comment', NOW())";
    }
    
    if ($conn->query($sql)) {
        echo json_encode(['success' => true, 'message' => '평가 저장 성공']);
    } else {
        echo json_encode(['success' => false, 'message' => '평가 저장 실패']);
    }
}

// 영화 평가 조회
function getRatings($movieId, $conn) {
    $movieId = intval($movieId);
    $sql = "SELECT r.*, u.name as user_name FROM ratings r 
            JOIN users u ON r.user_id = u.id 
            WHERE r.movie_id='$movieId' 
            ORDER BY r.created_at DESC";
    
    $result = $conn->query($sql);
    $ratings = [];
    
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $ratings[] = $row;
        }
    }
    
    echo json_encode(['success' => true, 'ratings' => $ratings]);
}

// 검색
function searchMovies($query, $conn) {
    $query = mysqli_real_escape_string($conn, $query);
    $sql = "SELECT m.*, 
            COALESCE(AVG(r.rating), 0) as avg_rating,
            COUNT(r.id) as rating_count
            FROM movies m 
            LEFT JOIN ratings r ON m.id = r.movie_id 
            WHERE m.name LIKE '%$query%' OR m.director LIKE '%$query%'
            GROUP BY m.id 
            ORDER BY m.created_at DESC";
    
    $result = $conn->query($sql);
    $movies = [];
    
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $movies[] = $row;
        }
    }
    
    echo json_encode(['success' => true, 'movies' => $movies]);
}

// 요청 핸들링
function handleMovieRequests($method, $conn) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (isset($_GET['action'])) {
        $action = $_GET['action'];
        
        switch ($action) {
            case 'register':
                registerUser($input, $conn);
                break;
            case 'login':
                loginUser($input, $conn);
                break;
            case 'add_movie':
                addMovie($input, $conn);
                break;
            case 'update_movie':
                updateMovie($input, $conn);
                break;
            case 'delete_movie':
                deleteMovie($_GET['id'], $conn);
                break;
            case 'get_movies':
                $category = isset($_GET['category']) ? $_GET['category'] : 'all';
                getMovies($category, $conn);
                break;
            case 'add_rating':
                addRating($input, $conn);
                break;
            case 'get_ratings':
                getRatings($_GET['movieId'], $conn);
                break;
            case 'search':
                searchMovies($_GET['query'], $conn);
                break;
            default:
                echo json_encode(['success' => false, 'message' => '알 수 없는 작업']);
                break;
        }
    } else {
        echo json_encode(['success' => false, 'message' => '작업을 지정해주세요']);
    }
}

$conn->close();
?>