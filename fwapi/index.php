<?php
// Cabeceras CORS + JSON globales
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

// Leer parámetro ?path=
$path = $_GET['path'] ?? '';

switch ($path) {
  case 'restaurantes':
    require_once('endpoints/restaurantes.php');
    break;
  case 'productos':
    require_once('endpoints/productos.php');
    break;
  case 'login':
    require_once('endpoints/login.php');
    break;
  case 'register':
    require_once('endpoints/register.php');
    break;
  default:
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Ruta no válida']);
    break;
}
