<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=utf-8");

require_once('../config/database.php');

$userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;
if ($userId <= 0) {
    echo json_encode(["success" => false, "message" => "user_id inválido"]);
    exit;
}

try {
    $db = new Database();
    $conn = $db->connect();

    // Obtener pedidos del usuario (sin idRestaurante fijo)
    $stmt = $conn->prepare("
        SELECT 
            o.idOrden AS orden_id,
            o.total,
            o.fechaCreacion
        FROM ordenes o
        WHERE o.idCliente = ?
        ORDER BY o.fechaCreacion DESC
    ");
    $stmt->execute([$userId]);
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($orders as &$order) {
        // Obtener items de cada orden con restaurante y producto
        $stmtItems = $conn->prepare("
            SELECT 
                p.idProducto AS product_id,
                p.nombre AS product_name,
                i.cantidad,
                i.precio,
                r.idRestaurante AS restaurant_id,
                r.nombre AS restaurant_name
            FROM orden_items i
            JOIN productos p ON i.idProductos = p.idProducto
            JOIN restaurantes r ON i.idRestaurante = r.idRestaurante
            WHERE i.idOrden = ?
        ");
        $stmtItems->execute([$order['orden_id']]);
        $order['items'] = $stmtItems->fetchAll(PDO::FETCH_ASSOC);

        // Si quieres mostrar un resumen de restaurantes involucrados
        $order['restaurants'] = array_values(
            array_unique(
                array_map(fn($it) => $it['restaurant_name'], $order['items'])
            )
        );
    }

    echo json_encode(["success" => true, "data" => $orders]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error obteniendo historial",
        "error" => $e->getMessage()
    ]);
}
