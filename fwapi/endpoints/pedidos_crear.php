<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once('../config/database.php');
$data = json_decode(file_get_contents("php://input"), true);

// Validación inicial
if (
    !$data ||
    !isset($data['user_id'], $data['total'], $data['items']) ||
    !is_array($data['items']) ||
    count($data['items']) === 0
) {
    echo json_encode(["success" => false, "message" => "Datos incompletos"]);
    exit;
}

try {
    $db = new Database();
    $conn = $db->connect();
    $conn->beginTransaction();

    $userId = (int)$data['user_id'];
    $total = (float)$data['total'];

    // Insertar la orden (sin restaurante)
    $stmt = $conn->prepare("
        INSERT INTO ordenes (idCliente, idStatus, total, fechaCreacion)
        VALUES (?, 1, ?, NOW())
    ");
    $stmt->execute([$userId, $total]);
    $ordenId = $conn->lastInsertId();

    if (!$ordenId) {
        throw new Exception("No se pudo obtener el ID de la orden");
    }

    // Insertar cada producto de la orden con su restaurante
    $stmtItem = $conn->prepare("
        INSERT INTO orden_items (idOrden, idProductos, idRestaurante, cantidad, precio)
        VALUES (?, ?, ?, ?, ?)
    ");

    foreach ($data['items'] as $it) {
        if (!isset($it['id'], $it['qty'], $it['price'], $it['restaurant_id'])) {
            throw new Exception("Item inválido: falta id, qty, price o restaurant_id");
        }

        $productId = (int)$it['id'];
        $qty = (int)$it['qty'];
        $price = (float)$it['price'];
        $itemRestaurantId = (int)$it['restaurant_id'];

        if ($qty <= 0 || $price < 0) {
            throw new Exception("Cantidad o precio inválido");
        }
        if ($itemRestaurantId <= 0) {
            throw new Exception("restaurant_id inválido en un item");
        }

        $stmtItem->execute([$ordenId, $productId, $itemRestaurantId, $qty, $price]);
    }

    $conn->commit();

    echo json_encode([
        "success" => true,
        "message" => "Pedido registrado correctamente",
        "orden_id" => $ordenId
    ]);
} catch (PDOException $e) {
    if ($conn->inTransaction()) $conn->rollBack();
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error al crear el pedido",
        "error" => $e->getMessage()
    ]);
} catch (Exception $e) {
    if ($conn->inTransaction()) $conn->rollBack();
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Error de validación",
        "error" => $e->getMessage()
    ]);
}