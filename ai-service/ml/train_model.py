from sklearn.ensemble import RandomForestRegressor
import joblib
import os
from dataset_builder import load_dataset

print("INICIANDO ENTRENAMIENTO...")

# cargar datos desde MySQL
df = load_dataset()

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
    df["goles"] * 20 +
    df["asistencias"] * 15 +
    df["minutos"] * 0.3
)

print("FEATURES X:")
print(X)

print("TARGET y:")
print(y)

# modelo
model = RandomForestRegressor(
    n_estimators=200,
    random_state=42
)

model.fit(X, y)

# guardar modelo usando ruta absoluta
BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")

joblib.dump(model, MODEL_PATH)

print("MODELO ENTRENADO Y GUARDADO EN:", MODEL_PATH)