 Instalación y ejecución del proyecto
 1. Clonar el proyecto
  git clone https://github.com/SergioSevilla22/TFG.git

3. Acceder al directorio del proyecto
  cd TFG

4. Abrir el proyecto en Visual Studio Code
   code .
   
5. Crear e importar la base de datos
   El proyecto utiliza MySQL. Primero se debe crear la base de datos:

    CREATE DATABASE tfg;
    USE tfg;

  Después, importar en MySQL Workbench el script SQL incluido en el repositorio:
    database/tfg.sql

  Este script contiene la estructura de tablas, relaciones y datos iniciales.
  Los usuarios incluidos en la base de datos tienen la contraseña cifrada. Para acceder con cualquiera de ellos, la contraseña es:
    1234

5. Instalar y ejecutar el backend
  Acceder a la carpeta del backend:
    cd Backend
  Instalar dependencias:
    npm install
  Crear un archivo .env a partir del archivo .env.example y configurar los datos de conexión a MySQL.
  Ejecutar el backend:
    npm run dev
  El backend se ejecutará en:
    http://localhost:3000
   
7. Instalar y ejecutar el frontend
  Abrir una nueva terminal y acceder a la carpeta del frontend:
    cd Frontend
  Instalar dependencias:
    npm install
  Ejecutar la aplicación:
    ng serve
  La aplicación se ejecutará en:
    http://localhost:4200

7. Instalar y ejecutar el microservicio de Inteligencia Artificial
  Abrir una nueva terminal y acceder a la carpeta del servicio de IA:
    cd ai-service
  Crear un entorno virtual:
    python -m venv venv
  Activar el entorno virtual.
  En Windows:
    venv\Scripts\activate
  En Linux/macOS:
    source venv/bin/activate
  Instalar dependencias:
    pip install -r requirements.txt
  Ejecutar el servicio:
    uvicorn main:app --reload
  El microservicio se ejecutará en:
    http://127.0.0.1:8000
   
9. Entrenar los modelos de Inteligencia Artificial
  Si los modelos no están incluidos en el proyecto, se pueden generar ejecutando:
    python ml/train_model.py
    python ml/train_attendance_model.py
    python ml/train_clustering_model.py
