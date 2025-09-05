<?php
class Database {
  private $host = "localhost";
  private $db_name = "delivery_app";
  private $username = "root";
  private $password = "";
  private $conn;

  public function connect() {
    try {
      $this->conn = new PDO(
        "mysql:host={$this->host};dbname={$this->db_name};charset=utf8mb4",
        $this->username,
        $this->password,
        [
          PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
          PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
      );
      return $this->conn;
    } catch (PDOException $e) {
      // Mostrar error en formato JSON (útil para debug de app)
      echo json_encode([
        "success" => false,
        "message" => "Error al conectar con la base de datos.",
        "error" => $e->getMessage()
      ]);
      exit;
    }
  }
}
