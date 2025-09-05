<?php
// CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=utf-8");

// Manejo de preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Reporte de errores (solo en desarrollo)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// DB
require_once('../config/database.php');

// Leer datos JSON
$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

if (!$data || !isset($data['email']) || !isset($data['password'])) {
    echo json_encode(["success" => false, "message" => "Faltan campos"]);
    exit;
}

try {
    $db = new Database();
    $conn = $db->connect();

    // Buscar usuario por email
    $sql = "SELECT idUsuarios, idRol, nombre, email, password 
            FROM Usuarios 
            WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->execute([$data['email']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(["success" => false, "message" => "Usuario no encontrado"]);
        exit;
    }

    $inputPassword = $data['password'];
    $dbPassword = $user['password'];

    // Comparación directa (texto plano)
    if ($inputPassword === $dbPassword) {
        unset($user['password']); // No exponer la contraseña
        echo json_encode([
            "success" => true,
            "user" => [
                "id"     => (int)$user['idUsuarios'],
                "rol"    => (int)$user['idRol'],
                "nombre" => $user['nombre'],
                "email"  => $user['email']
            ]
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Credenciales inválidas"]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error en el servidor",
        "error"   => $e->getMessage()
    ]);
}
