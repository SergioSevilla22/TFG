import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

export const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("❌ Error al conectar con MySQL:", err.message);
  } else {
    console.log("✅ Conectado a la base de datos MySQL");
  }
});
