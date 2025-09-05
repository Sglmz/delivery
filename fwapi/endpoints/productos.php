<?php
// CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

// Conexión
require_once('../config/database.php');

// Validar parámetro
if (!isset($_GET['restaurante_id'])) {
  echo json_encode(["success" => false, "message" => "Falta restaurante_id"]);
  exit;
}

$restaurante_id = $_GET['restaurante_id'];

try {
  $db = new Database();
  $conn = $db->connect();

  $sql = "SELECT 
            idProducto AS id,
            nombre AS name,
            imagen AS image,
            precio,
            4.5 AS rating
          FROM Productos 
          WHERE idRestaurante = ?";

  $stmt = $conn->prepare($sql);
  $stmt->execute([$restaurante_id]);

  $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);

  // Convertir precio a número flotante para evitar errores en frontend
  foreach ($productos as &$producto) {
    $producto['price'] = floatval($producto['precio']);
    unset($producto['precio']); // eliminar campo original para no duplicar
  }

  echo json_encode([
    "success" => true,
    "productos" => $productos
  ]);
} catch (PDOException $e) {
  echo json_encode([
    "success" => false,
    "message" => "Error al obtener los productos",
    "error" => $e->getMessage()
  ]);
}
