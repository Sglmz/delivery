<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once('../config/database.php');
$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['id'])) {
    echo json_encode(["success"=>false,"message"=>"Faltan datos"]); exit;
}

try {
    $db = new Database();
    $conn = $db->connect();

    $fields = [];
    $params = [];

    if (!empty($data['nombre'])) {
        $fields[] = "nombre=?";
        $params[] = $data['nombre'];
    }
    if (!empty($data['email'])) {
        $fields[] = "email=?";
        $params[] = $data['email'];
    }
    if (!empty($data['password'])) {
        $hash = password_hash($data['password'], PASSWORD_BCRYPT);
        $fields[] = "password=?";
        $params[] = $hash;
    }

    if (count($fields) === 0) {
        echo json_encode(["success"=>false,"message"=>"Nada que actualizar"]); exit;
    }

    $params[] = $data['id'];
    $sql = "UPDATE Usuarios SET ".implode(", ", $fields)." WHERE idUsuarios=?";
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);

    echo json_encode(["success"=>true,"message"=>"Perfil actualizado"]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success"=>false,"message"=>"Error actualizando perfil","error"=>$e->getMessage()]);
}
