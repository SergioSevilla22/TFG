import joblib
import numpy as np

model = joblib.load("ml/attendance_model.pkl")

def predict_attendance_trend(attendance_ratio):

    X = np.array([[attendance_ratio]])

    probability = model.predict_proba(X)[0][1]

    return float(probability)