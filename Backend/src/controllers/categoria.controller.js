import { db } from "../db.js";

export const obtenerCategorias = (req, res) => {
  db.query("SELECT * FROM categorias ORDER BY nombre ASC", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

export const crearCategoria = (req, res) => {
  const { nombre, edad_min, edad_max } = req.body;

  if (!nombre) {
    return res.status(400).json({ message: "El nombre de la categoría es obligatorio" });
  }

  db.query(
    "INSERT INTO categorias (nombre, edad_min, edad_max) VALUES (?, ?, ?)",
    [nombre, edad_min || null, edad_max || null],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      res.status(201).json({ message: "Categoría creada correctamente", id: result.insertId });
    }
  );
};

export const actualizarCategoria = (req, res) => {
  const { id } = req.params;
  const { nombre, edad_min, edad_max } = req.body;

  if (!nombre) {
    return res.status(400).json({ message: "El nombre de la categoría es obligatorio" });
  }

  db.query(
    "UPDATE categorias SET nombre = ?, edad_min = ?, edad_max = ? WHERE id = ?",
    [nombre, edad_min || null, edad_max || null, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Categoría no encontrada" });
      }

      res.json({ message: "Categoría actualizada correctamente" });
    }
  );
};

export const eliminarCategoria = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM categorias WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    res.json({ message: "Categoría eliminada correctamente" });
  });
};
