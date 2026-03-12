import mysql.connector
import pandas as pd

def load_dataset():

    connection = mysql.connector.connect(
        host="localhost",
        user="tfguser",
        password="tfguser",
        database="tfg"
    )

    query = """
   SELECT
    ec.minutos,
    ec.goles,
    ec.asistencias,
    ec.amarillas,
    ec.rojas,
    re.nota_general,
    re.intensidad,
    re.actitud,
    1 as attendance_ratio
    FROM estadisticas_convocatoria ec
    LEFT JOIN rendimiento_entrenamiento re
    ON ec.jugador_dni = re.jugador_dni
    """

    df = pd.read_sql(query, connection)

    connection.close()

    return df