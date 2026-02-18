import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import authRoutes from "./routes/auth.routes.js";
import clubRoutes from "./routes/club.routes.js";
import categoriaRoutes from "./routes/categoria.routes.js";
import temporadaRoutes from "./routes/temporada.routes.js";
import equiposRoutes from "./routes/equipos.routes.js";
import usuariosRoutes from "./routes/usuarios.routes.js";
import convocatoriasRoutes from "./routes/convocatorias.routes.js";
import eventosRoutes from "./routes/eventos.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import calendarioRoutes from "./routes/calendario.routes.js";
import estadisticasRoutes from "./routes/estadisticas.routes.js";
import observacionesRoutes from "./routes/observaciones.routes.js"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use("/uploads", express.static(path.join(process.cwd(), "public/uploads")));
app.use("/api", authRoutes);
app.use("/api", clubRoutes);
app.use("/api", categoriaRoutes);
app.use("/api", temporadaRoutes);
app.use("/api", equiposRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/convocatorias", convocatoriasRoutes);
app.use('/api/eventos', eventosRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/calendario", calendarioRoutes);
app.use("/api/estadisticas", estadisticasRoutes);
app.use("/api/observaciones", observacionesRoutes);


// Servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
