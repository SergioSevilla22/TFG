import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import joblib
import os
from dataset_builder import load_dataset

print("🚀 ENTRENANDO MODELO DE CLUSTERING (PERFILES DE JUGADOR)...")

df = load_dataset()

# 1. Preparar métricas P90 (Igual que en Random Forest para coherencia)
df = df.fillna(0)
minutos_seguros = df["minutos"].replace(0, 1)
df["goles_p90"] = (df["goles"] / minutos_seguros) * 90
df["asistencias_p90"] = (df["asistencias"] / minutos_seguros) * 90
df["amarillas_p90"] = (df["amarillas"] / minutos_seguros) * 90

# 2. Seleccionar Features para el perfilado
features = ["minutos", "goles_p90", "asistencias_p90", "nota_general", "intensidad", "amarillas_p90"]
X = df[features]

# 3. ESCALADO (Vital para K-Means)
# Transformamos los datos para que tengan media 0 y varianza 1
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 4. K-MEANS (Agrupamos en 4 perfiles principales)
kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
df['cluster'] = kmeans.fit_predict(X_scaled)

# 5. GUARDAR MODELO Y ESCALADOR
BASE_DIR = os.path.dirname(__file__)
joblib.dump(kmeans, os.path.join(BASE_DIR, "kmeans_model.pkl"))
joblib.dump(scaler, os.path.join(BASE_DIR, "scaler.pkl"))
# Guardamos los datos procesados para poder comparar distancias luego
df.to_csv(os.path.join(BASE_DIR, "players_clusters.csv"), index=False)

print(f"✅ Clustering completado. Jugadores agrupados en {kmeans.n_clusters} perfiles.")