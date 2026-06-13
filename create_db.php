<?php
$host = '127.0.0.1';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec("CREATE DATABASE IF NOT EXISTS laporwarga;");
    echo "Database created successfully\n";
} catch (PDOException $e) {
    die("DB ERROR: " . $e->getMessage() . "\n");
}
