import pandas as pd
import os
from utils.feature_engineering import build_features
from models.clustering_predictor import predict_player_cluster

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../ml"))

# Diccionario de nombres para que en Angular no salga solo "Cluster 0"
PERFILES = {
    0: "Columna Vertebral (Alto rendimiento y regularidad)",
    1: "Perfil Crítico (Baja participación o actitud)",
    2: "Especialista de Alta Intensidad (Perfil defensivo)",
    3: "Revulsivo de Impacto (Máxima eficiencia goleadora)"
}

def analyze_player_similarity(stats, training, player_dni):
    # 1. Generar features con TU función ya existente
    features = build_features(stats, training)
    if not features: return None

    # 2. Predecir el cluster
    cluster_id = predict_player_cluster(features)

    # 3. Buscar "parecidos" en el archivo CSV generado al entrenar
    try:
        df_clusters = pd.read_csv(os.path.join(BASE_DIR, "players_clusters.csv"))
        # Buscamos otros jugadores del mismo grupo (limitamos a 3)
        similares = df_clusters[
            (df_clusters['cluster'] == cluster_id) & 
            (df_clusters['jugador_dni'] != player_dni)
        ]['jugador_dni'].head(3).tolist()
    except:
        similares = []

    return {
        "cluster_id": cluster_id,
        "nombre_perfil": PERFILES.get(cluster_id, "Perfil estándar"),
        "jugadores_similares": similares
    }