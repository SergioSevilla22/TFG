import pandas as pd
import mysql.connector
from sklearn.linear_model import LogisticRegression
import joblib
import os
from dataset_builder import load_attendance_dataset

print("ENTRENANDO MODELO DE TENDENCIAS DE ASISTENCIA")

df = load_attendance_dataset()


def encode_attendance(state):

    if state == "presente":
        return 1

    if state == "tarde":
        return 0.7

    if state == "excusado":
        return 0.4

    return 0

df["attendance_score"] = df["estado_asistencia"].apply(encode_attendance)

# simulamos abandono si asistencia muy baja
df["dropout"] = df["attendance_score"].apply(lambda x: 1 if x < 0.4 else 0)

X = df[["attendance_score"]]
y = df["dropout"]

model = LogisticRegression()

model.fit(X, y)

BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "attendance_model.pkl")

joblib.dump(model, MODEL_PATH)

print("MODELO DE ASISTENCIA ENTRENADO")