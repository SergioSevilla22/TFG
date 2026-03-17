from models.attendance_predictor import predict_attendance_trend
from utils.attendance_features import build_attendance_feature


def analyze_attendance(stats):

    if not stats:
        return {
            "attendance_ratio": 0,
            "dropout_probability": 0,
            "trend": "sin datos"
        }

    # Feature engineering
    attendance_ratio = build_attendance_feature(stats)

    # Predicción del modelo
    probability = predict_attendance_trend(attendance_ratio)

    # Interpretación del resultado
    if probability < 0.3:
        trend = "estable"

    elif probability < 0.6:
        trend = "riesgo moderado"

    else:
        trend = "alto riesgo"

    return {
        "attendance_ratio": attendance_ratio,
        "dropout_probability": probability,
        "trend": trend
    }