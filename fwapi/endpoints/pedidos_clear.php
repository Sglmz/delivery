<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once('../config/database.php');
$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['user_id'])) {
    echo json_encode(["success"=>false,"message"=>"Falta user_id"]); exit;
}

try {
    $db = new Database();
    $conn = $db->connect();
    $stmt = $conn->prepare("SELECT idOrden FROM ordenes WHERE idCliente=?");
    $stmt->execute([$data['user_id']]);
    $ids = $stmt->fetchAll(PDO::FETCH_COLUMN);

    if ($ids) {
        $in = implode(',', array_fill(0, count($ids), '?'));
        $conn->prepare("DELETE FROM orden_items WHERE idOrden IN ($in)")->execute($ids);
        $conn->prepare("DELETE FROM ordenes WHERE idOrden IN ($in)")->execute($ids);
    }

    echo json_encode(["success"=>true,"message"=>"Historial borrado"]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success"=>false,"message"=>"Error limpiando historial","error"=>$e->getMessage()]);
}
