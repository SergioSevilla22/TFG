import numpy as np

def build_features(stats, training):

    if not stats:
        return None

    total_matches = len(stats)
    total_training = len(training)

    avg_minutes = sum(s["minutos"] for s in stats) / total_matches
    avg_goals = sum(s["goles"] for s in stats) / total_matches
    avg_assists = sum(s["asistencias"] for s in stats) / total_matches
    avg_yellows = sum(s["amarillas"] for s in stats) / total_matches
    avg_reds = sum(s["rojas"] for s in stats) / total_matches

    avg_training_note = (
        sum(t["nota_general"] for t in training) / total_training
        if total_training else 0
    )

    avg_intensity = (
        sum(t["intensidad"] for t in training) / total_training
        if total_training else 0
    )

    avg_attitude = (
        sum(t["actitud"] for t in training) / total_training
        if total_training else 0
    )

    attendance_values = []

    for s in stats:
        if s["estado_asistencia"] == "presente":
            attendance_values.append(1)
        elif s["estado_asistencia"] == "tarde":
            attendance_values.append(0.5)
        else:
            attendance_values.append(0)

    attendance_ratio = sum(attendance_values) / len(attendance_values)

    return [
        avg_minutes,
        avg_goals,
        avg_assists,
        avg_training_note,
        avg_intensity,
        avg_attitude,
        attendance_ratio,
        avg_yellows,
        avg_reds
    ]