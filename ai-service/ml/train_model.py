from sklearn.ensemble import RandomForestRegressor
import joblib
import os
from dataset_builder import load_dataset
import pandas as pd

print("INICIANDO ENTRENAMIENTO...")

# cargar datos desde MySQL
df = load_dataset()

cols_a_limpiar = ["minutos", "goles", "asistencias", "nota_general", 
                  "intensidad", "actitud", "amarillas", "rojas"]

for col in cols_a_limpiar:
    df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

minutos_seguros = df["minutos"].replace(0, 1)

df["goles_p90"] = (df["goles"] / minutos_seguros) * 90
df["asistencias_p90"] = (df["asistencias"] / minutos_seguros) * 90
df["amarillas_p90"] = (df["amarillas"] / minutos_seguros) * 90
df["rojas_p90"] = (df["rojas"] / minutos_seguros) * 90

print("DATAFRAME RECIBIDO:")
print(df.head())


# features
X = df[[
    "minutos",
    "goles",
    "asistencias",
    "nota_general",
    "intensidad",
    "actitud",
    "attendance_ratio",
    "amarillas",
    "rojas"
]]

# target (score calculado)
y = (
    df["goles_p90"] * 15 + 
    df["asistencias_p90"] * 10 + 
    df["minutos"] * 0.1 + 
    df["nota_general"] * 5 + 
    df["intensidad"] * 2  +
    df["actitud"] * 2 -
    (df["amarillas_p90"] * 6)
) - (df["rojas_p90"] * 12)

print("FEATURES X:")
print(X)

print("TARGET y:")
print(y)

# modelo
model = RandomForestRegressor(
    n_estimators=300,
    random_state=42,
    max_depth=10
)

model.fit(X, y)

# guardar modelo usando ruta absoluta
BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")

joblib.dump(model, MODEL_PATH)

print("MODELO ENTRENADO Y GUARDADO EN:", MODEL_PATH)