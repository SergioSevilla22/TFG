from utils.feature_engineering import build_features
from models.predictor import predict_performance


def analyze_player(stats, training):

    features = build_features(stats, training)

    if features is None:
        return {
            "performance_score": 0,
            "metrics": None
        }

    score = predict_performance(features)

    avg_minutes = features[0]
    avg_goals = features[1]
    avg_assists = features[2]
    avg_training = features[3]
    avg_intensity = features[4]
    avg_attitude = features[5]
    attendance_ratio = features[6]
    avg_yellows = features[7]
    avg_reds = features[8]

    discipline = max(0, 10 - (avg_yellows * 2 + avg_reds * 4))
    participation = attendance_ratio * 10

    return {
        "performance_score": score,
        "metrics": {
            "goles": round(min(avg_goals * 5, 10), 2),
            "asistencias": round(min(avg_assists * 5, 10), 2),
            "minutos": round(avg_minutes / 9, 2),
            "disciplina": round(discipline, 2),
            "participacion": round(participation, 2),
            "entrenamiento": round(avg_training, 2),
            "intensidad": round(avg_intensity, 2),
            "actitud": round(avg_attitude, 2)
        }
    }