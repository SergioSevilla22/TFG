import { Request, Response } from "express";
import { AppDataSource } from "../data-source.js";
import { Jugador } from "../entities/Jugador.js";
import { Usuario } from "../entities/Usuario.js";

const jugadoresRepo = () => AppDataSource.getRepository(Jugador);
const usuariosRepo = () => AppDataSource.getRepository(Usuario);

export async function listarJugadores(_req: Request, res: Response) {
  const jugadores = await jugadoresRepo().find({ relations: { usuario: true } });
  res.json(jugadores);
}

export async function crearJugador(req: Request, res: Response) {
  const { DNI } = req.body;

  if (!DNI) return res.status(400).json({ message: "DNI requerido" });

  const usuario = await usuariosRepo().findOne({ where: { DNI } });
  if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });

  const existe = await jugadoresRepo().findOne({ where: { usuario: { DNI } } });
  if (existe) return res.status(409).json({ message: "Ya es jugador" });

  const jugador = jugadoresRepo().create({ usuario });
  await jugadoresRepo().save(jugador);
  res.status(201).json(jugador);
}

export async function actualizarEstadisticas(req: Request, res: Response) {
  const { dni } = req.params;
  const datos = req.body;

  const jugador = await jugadoresRepo().findOne({
    where: { usuario: { DNI: dni } },
    relations: { usuario: true },
  });

  if (!jugador) return res.status(404).json({ message: "Jugador no encontrado" });

  Object.assign(jugador, datos);
  await jugadoresRepo().save(jugador);
  res.json(jugador);
}
