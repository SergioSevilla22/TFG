import mysql.connector
import pandas as pd

def load_dataset():

    connection = mysql.connector.connect(
        host="localhost",
        user="root",
        password="root",
        database="tfg"
    )

    query = """
   SELECT 
    sub_est.jugador_dni,
    AVG(sub_est.minutos) as minutos,
    AVG(sub_est.goles) as goles,
    AVG(sub_est.asistencias) as asistencias,
    AVG(sub_est.amarillas) as amarillas,
    AVG(sub_est.rojas) as rojas,
    AVG(sub_rend.nota_general) as nota_general,
    AVG(sub_rend.intensidad) as intensidad,
    AVG(sub_rend.actitud) as actitud,
    1 as attendance_ratio
FROM (
    -- Agrupamos primero las estadísticas de partidos
    SELECT jugador_dni, AVG(minutos) as minutos, AVG(goles) as goles, 
           AVG(asistencias) as asistencias, AVG(amarillas) as amarillas, 
           AVG(rojas) as rojas
    FROM estadisticas_convocatoria 
    GROUP BY jugador_dni
) as sub_est
LEFT JOIN (
    -- Agrupamos los entrenamientos
    SELECT jugador_dni, AVG(nota_general) as nota_general, 
           AVG(intensidad) as intensidad, AVG(actitud) as actitud
    FROM rendimiento_entrenamiento
    GROUP BY jugador_dni
) as sub_rend ON sub_est.jugador_dni = sub_rend.jugador_dni
GROUP BY sub_est.jugador_dni
    """

    df = pd.read_sql(query, connection)

    connection.close()

    return df