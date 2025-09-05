<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=utf-8");

require_once('../config/database.php');

$userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;
if ($userId <= 0) {
    echo json_encode(["success"=>false,"message"=>"Falta user_id"]);
    exit;
}

try {
    $db = new Database();
    $conn = $db->connect();

    $stmt = $conn->prepare("SELECT idUsuarios AS id, idRol AS rol, nombre, email FROM Usuarios WHERE idUsuarios=?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        echo json_encode(["success"=>true,"user"=>$user]);
    } else {
        echo json_encode(["success"=>false,"message"=>"Usuario no encontrado"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success"=>false,"message"=>"Error obteniendo perfil","error"=>$e->getMessage()]);
}
