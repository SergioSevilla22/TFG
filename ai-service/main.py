from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

from services.prediction_service import analyze_player
from services.attendance_service import analyze_attendance
from services.clustering_service import analyze_player_similarity

app = FastAPI(title="TFG AI Service")


class MatchStat(BaseModel):
    minutos: int
    goles: int
    asistencias: int
    amarillas: int
    rojas: int
    estado_asistencia: str


class TrainingStat(BaseModel):
    nota_general: float
    intensidad: int
    actitud: int
    estado_asistencia: str


class AttendanceStat(BaseModel):
    estado_asistencia: str


class PlayerRequest(BaseModel):
    stats: List[MatchStat]
    training: List[TrainingStat]


class AttendanceRequest(BaseModel):
    stats: List[AttendanceStat]


@app.get("/")
def root():
    return {"message": "AI service running"}


@app.post("/ai/player")
def player_analysis(payload: PlayerRequest):

    stats = [s.dict() for s in payload.stats]
    training = [t.dict() for t in payload.training]

    result = analyze_player(stats, training)

    return result


@app.post("/ai/attendance")
def attendance_analysis(payload: AttendanceRequest):

    stats = [s.dict() for s in payload.stats]

    result = analyze_attendance(stats)

    return result

@app.post("/ai/clustering/{dni}") # 1. Cambiado de .get a .post
def get_similar_players(dni: str, payload: PlayerRequest): # 2. Añadido el payload
    try:
        # 3. Extraemos los datos que vienen de Node.js
        stats = [s.dict() for s in payload.stats]
        training = [t.dict() for t in payload.training]
        
        # 4. Llamamos a la función del servicio (asegúrate de que el nombre coincida)
        # Usamos la que definimos antes que procesa stats, training y dni
        result = analyze_player_similarity(stats, training, dni)
        
        if not result:
            return {"error": "Jugador no encontrado o datos insuficientes"}
            
        return result
    except Exception as e:
        print(f"Error en el servidor de IA: {e}")
        return {"error": str(e)}