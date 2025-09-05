<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

require_once('../config/database.php');

try {
  $db = new Database();
  $conn = $db->connect();

  $sql = "SELECT 
            idRestaurante AS id,
            nombre AS name,
            direccion,
            'Pizza' AS category,
            '30-40 min' AS time,
            4.5 AS rating
          FROM Restaurantes";
          
  $stmt = $conn->prepare($sql);
  $stmt->execute();

  $restaurantes = $stmt->fetchAll(PDO::FETCH_ASSOC);
  echo json_encode($restaurantes);
} catch (PDOException $e) {
  echo json_encode(["success" => false, "message" => "Error al obtener restaurantes", "error" => $e->getMessage()]);
}
