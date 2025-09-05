<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

require_once('../config/database.php');

$data = json_decode(file_get_contents("php://input"));

// Validar campos requeridos
if (
  !isset($data->nombre) || empty(trim($data->nombre)) ||
  !isset($data->email) || empty(trim($data->email)) ||
  !isset($data->password) || empty(trim($data->password))
) {
  echo json_encode(["success" => false, "message" => "Faltan campos"]);
  exit;
}

$db = new Database();
$conn = $db->connect();

// Verificar si el correo ya existe
$checkEmail = $conn->prepare("SELECT idUsuarios FROM Usuarios WHERE email = ?");
$checkEmail->execute([$data->email]);

if ($checkEmail->rowCount() > 0) {
  echo json_encode(["success" => false, "message" => "El correo ya está registrado"]);
  exit;
}

// Insertar usuario
try {
  $stmt = $conn->prepare("INSERT INTO Usuarios (idRol, nombre, email, password) VALUES (?, ?, ?, ?)");
  $idRol = 1; // Asignar rol por defecto (puedes cambiar si usas otro valor)
  $stmt->execute([$idRol, $data->nombre, $data->email, $data->password]);

  echo json_encode(["success" => true, "message" => "Usuario registrado correctamente"]);
} catch (PDOException $e) {
  echo json_encode(["success" => false, "message" => "Error en el servidor: " . $e->getMessage()]);
}
