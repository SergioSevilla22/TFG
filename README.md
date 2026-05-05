# Instalación y Ejecución del Proyecto

## 1. Clonar el repositorio

```bash
git clone https://github.com/SergioSevilla22/TFG.git
```

## 2. Acceder al directorio del proyecto

```bash
cd TFG
```

## 3. Abrir en Visual Studio Code

```bash
code .
```

---

## 4. Crear e importar la base de datos

El proyecto utiliza **MySQL**. Primero, crea la base de datos:

```sql
CREATE DATABASE tfg;
USE tfg;
```

Después, importa en **MySQL Workbench** el script SQL incluido en el repositorio:

```
database/tfg.sql
```

> Este script contiene la estructura de tablas, relaciones y datos iniciales.

> ⚠️ Los usuarios incluidos tienen la contraseña cifrada. Para acceder con cualquiera de ellos, usa la contraseña: `1234`

---

## 5. Instalar y ejecutar el Backend

```bash
cd Backend
npm install
```

Crea un archivo `.env` a partir de `.env.example` y configura los datos de conexión a MySQL.

```bash
npm run dev
```

> El backend se ejecutará en: `http://localhost:3000`

---

## 6. Instalar y ejecutar el Frontend

Abre una nueva terminal:

```bash
cd Frontend
npm install
ng serve
```

> La aplicación se ejecutará en: `http://localhost:4200`

---

## 7. Instalar y ejecutar el Microservicio de IA

Abre una nueva terminal:

```bash
cd ai-service
```

### Crear y activar el entorno virtual

```bash
python -m venv venv
```

**Windows:**
```bash
venv\Scripts\activate
```

**Linux / macOS:**
```bash
source venv/bin/activate
```

### Instalar dependencias y ejecutar

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

> El microservicio se ejecutará en: `http://127.0.0.1:8000`

---

## 8. Entrenar los modelos de Inteligencia Artificial
Si los modelos no están incluidos en el proyecto, se pueden generar ejecutando:
```bash
python ml/train_model.py
python ml/train_attendance_model.py
python ml/train_clustering_model.py
