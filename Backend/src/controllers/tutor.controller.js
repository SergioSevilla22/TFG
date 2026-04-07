import { db } from "../db.js";
import bcrypt from "bcryptjs";

/**
 * REGISTER DEPENDENT
 * The tutor creates a dependent player with a real email and password.
 */
export const registerDependent = (req, res) => {
  const { DNI, nombre, email, telefono, anioNacimiento, password, idTutor } =
    req.body;

  if (!DNI || !nombre || !email || !password || !idTutor || !anioNacimiento) {
    return res
      .status(400)
      .json({ message: "Todos los campos son obligatorios" });
  }

  // Check if a user with that DNI already exists
  db.query(
    "SELECT * FROM usuarios WHERE DNI = ?",
    [DNI],
    async (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length > 0)
        return res
          .status(409)
          .json({ message: "Ya existe un usuario con ese DNI" });

      const hashedPassword = await bcrypt.hash(password, 10);

      db.query(
        "INSERT INTO usuarios (DNI, nombre, email, telefono, anio_nacimiento, password, Rol, idTutor) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          DNI,
          nombre,
          email,
          telefono,
          anioNacimiento,
          hashedPassword,
          "jugador",
          idTutor,
        ],
        (err2) => {
          if (err2) return res.status(500).json({ error: err2.message });

          res.json({ message: "Dependiente registrado correctamente" });
        }
      );
    }
  );
};

/**
 * GET TUTOR'S DEPENDENTS
 */
export const getDependents = (req, res) => {
  const { idTutor } = req.query;

  if (!idTutor) return res.status(400).json({ message: "idTutor obligatorio" });

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
 * REMOVE LINK
 * The player is no longer a dependent and becomes an autonomous player.
 */
export const removeLink = (req, res) => {
  const { DNI } = req.body;

  if (!DNI) {
    return res.status(400).json({ message: "DNI obligatorio" });
  }

  db.query("UPDATE usuarios SET idTutor = NULL WHERE DNI = ?", [DNI], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ message: "Jugador ahora es independiente" });
  });
};
