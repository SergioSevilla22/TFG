import { db } from "../db.js";
import bcrypt from "bcryptjs";

/**
 * REGISTRAR DEPENDIENTE
 * El tutor crea un jugador dependiente con email y contraseña reales.
 */
export const registrarDependiente = (req, res) => {
  const { DNI, nombre, email, telefono, password, idTutor } = req.body;

  if (!DNI || !nombre || !email || !password || !idTutor) {
    return res.status(400).json({ message: "Todos los campos son obligatorios" });
  }

  // Verificar si ya existe un usuario con ese DNI
  db.query("SELECT * FROM usuarios WHERE DNI = ?", [DNI], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length > 0)
      return res.status(409).json({ message: "Ya existe un usuario con ese DNI" });

    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO usuarios (DNI, nombre, email, telefono, password, Rol, idTutor) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [DNI, nombre, email, telefono, hashedPassword, "jugador", idTutor],
      (err2) => {
        if (err2) return res.status(500).json({ error: err2.message });

        res.json({ message: "Dependiente registrado correctamente" });
      }
    );
  });
};

/**
 * OBTENER DEPENDIENTES DEL TUTOR
 */
export const obtenerDependientes = (req, res) => {
  const { idTutor } = req.query;

  if (!idTutor)
    return res.status(400).json({ message: "idTutor obligatorio" });

  db.query(
    "SELECT DNI, nombre, email, telefono, foto FROM usuarios WHERE idTutor = ?",
    [idTutor],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json(results);
    }
  );
};

/**
 * QUITAR VÍNCULO
 * El jugador deja de ser dependiente y pasa a jugador autónomo.
 */
export const quitarVinculo = (req, res) => {
  const { DNI } = req.body;

  if (!DNI) {
    return res.status(400).json({ message: "DNI obligatorio" });
  }

  db.query(
    "UPDATE usuarios SET idTutor = NULL WHERE DNI = ?",
    [DNI],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({ message: "Jugador ahora es independiente" });
    }
  );
};
