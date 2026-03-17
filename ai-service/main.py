from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

from services.prediction_service import analyze_player
from services.attendance_service import analyze_attendance

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