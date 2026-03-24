import joblib
import numpy as np
import os

# Rutas a los modelos
BASE_DIR = os.path.dirname(__file__)
kmeans = joblib.load(os.path.join(BASE_DIR, "../ml/kmeans_model.pkl"))
scaler = joblib.load(os.path.join(BASE_DIR, "../ml/scaler.pkl"))

def predict_player_cluster(all_features):
    """
    Filtra las 9 features de tu build_features para usar solo las 6 del clustering.
    all_features viene de build_features: [min, g90, a90, nota, int, act, att, y90, r90]
    """
    # Seleccionamos: minutos(0), goles_p90(1), asistencias_p90(2), nota(3), intensidad(4), amarillas_p90(7)
    indices_interes = [0, 1, 2, 3, 4, 7]
    selected_features = [all_features[i] for i in indices_interes]
    
    # Convertir a array, escalar y predecir
    X = np.array([selected_features])
    X_scaled = scaler.transform(X)
    
    cluster_id = kmeans.predict(X_scaled)[0]
    return int(cluster_id)