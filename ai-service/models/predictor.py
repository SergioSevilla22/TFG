import joblib
import numpy as np

model = joblib.load("ml/model.pkl")

def predict_performance(features):

    X = np.array([features])

    prediction = model.predict(X)[0]

    return round(float(prediction), 2)