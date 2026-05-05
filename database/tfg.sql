-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: tfg
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `edad_min` int DEFAULT NULL,
  `edad_max` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
INSERT INTO `categorias` VALUES (1,'Alevin B ',5,8),(2,'Juvenil',12,13),(3,'Prueba',15,17);
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clubes`
--

DROP TABLE IF EXISTS `clubes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clubes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `escudo` varchar(255) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `direccion` varchar(150) DEFAULT NULL,
  `poblacion` varchar(100) DEFAULT NULL,
  `provincia` varchar(100) DEFAULT NULL,
  `codigo_postal` varchar(10) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clubes`
--

LOCK TABLES `clubes` WRITE;
/*!40000 ALTER TABLE `clubes` DISABLE KEYS */;
INSERT INTO `clubes` VALUES (3,'C.D TOLEDO','/uploads/1765300174033-cd toledo.png','674300269','cdtoledo@gmail.com','Salto del caballo','Toledo','Toledo','45007','2025-12-09 17:09:34'),(4,'Pilados','/uploads/1772647921262-movil si2.png','111111111','a','calle 342','Madird','Madrid','25007','2026-01-14 11:26:43');
/*!40000 ALTER TABLE `clubes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `convocatoria_jugadores`
--

DROP TABLE IF EXISTS `convocatoria_jugadores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `convocatoria_jugadores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `convocatoria_id` int NOT NULL,
  `jugador_dni` varchar(9) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `estado` enum('pendiente','confirmado','rechazado') CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT 'pendiente',
  `notificado_at` datetime DEFAULT NULL,
  `recordatorio_at` datetime DEFAULT NULL,
  `responded_at` datetime DEFAULT NULL,
  `motivo` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_conv_jugador` (`convocatoria_id`,`jugador_dni`),
  KEY `idx_cj_conv` (`convocatoria_id`),
  KEY `idx_cj_jugador` (`jugador_dni`),
  KEY `idx_cj_estado` (`estado`),
  CONSTRAINT `fk_cj_convocatoria` FOREIGN KEY (`convocatoria_id`) REFERENCES `convocatorias` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cj_jugador` FOREIGN KEY (`jugador_dni`) REFERENCES `usuarios` (`DNI`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `convocatoria_jugadores`
--

LOCK TABLES `convocatoria_jugadores` WRITE;
/*!40000 ALTER TABLE `convocatoria_jugadores` DISABLE KEYS */;
INSERT INTO `convocatoria_jugadores` VALUES (4,4,'22334455A','confirmado','2026-01-24 11:35:20',NULL,'2026-01-24 11:36:31',NULL),(5,5,'66666666A','rechazado','2026-02-03 16:11:24',NULL,'2026-02-03 16:12:42',NULL),(6,5,'22334455A','pendiente','2026-02-03 16:11:23',NULL,NULL,NULL),(7,6,'66666666A','pendiente','2026-02-11 12:31:17','2026-02-12 13:45:09',NULL,NULL),(8,7,'22334455A','confirmado','2026-02-11 12:31:42',NULL,'2026-02-11 12:43:33',NULL),(9,8,'66666666A','pendiente','2026-02-11 13:50:39',NULL,NULL,NULL),(10,9,'66666666A','pendiente','2026-03-05 19:36:41',NULL,NULL,NULL),(11,9,'22334455A','pendiente','2026-03-05 19:36:39',NULL,NULL,NULL),(12,10,'66666666A','pendiente','2026-03-05 19:49:32',NULL,NULL,NULL),(13,10,'22334455A','pendiente','2026-03-05 19:49:31',NULL,NULL,NULL),(14,11,'66666666A','pendiente','2026-03-16 17:28:01',NULL,NULL,NULL),(15,12,'66666666A','pendiente','2026-03-16 17:28:46',NULL,NULL,NULL);
/*!40000 ALTER TABLE `convocatoria_jugadores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `convocatorias`
--

DROP TABLE IF EXISTS `convocatorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `convocatorias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `equipo_id` int NOT NULL,
  `creador_dni` varchar(9) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `rival` varchar(100) DEFAULT NULL,
  `lugar` varchar(150) DEFAULT NULL,
  `fecha_partido` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_quedada` time NOT NULL,
  `fecha_limite_confirmacion` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_conv_equipo` (`equipo_id`),
  KEY `idx_conv_creador` (`creador_dni`),
  KEY `idx_convocatorias_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_conv_creador` FOREIGN KEY (`creador_dni`) REFERENCES `usuarios` (`DNI`) ON DELETE RESTRICT,
  CONSTRAINT `fk_conv_equipo` FOREIGN KEY (`equipo_id`) REFERENCES `equipos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `convocatorias`
--

LOCK TABLES `convocatorias` WRITE;
/*!40000 ALTER TABLE `convocatorias` DISABLE KEYS */;
INSERT INTO `convocatorias` VALUES (1,13,'1111111','Eje','lol','2026-01-12','11:21:00','10:20:00','2026-01-10 10:21:00','2026-01-09 09:21:17',NULL),(2,14,'1111111','qweqwe','qwe','2026-01-15','15:16:00','14:16:00','2026-01-14 16:18:00','2026-01-14 13:16:49',NULL),(3,14,'1111111','2','3','2026-01-17','13:27:00','11:19:00','2026-01-16 15:29:00','2026-01-16 11:26:46',NULL),(4,15,'33333333C','Confirmar2','2','2026-01-27','12:36:00','11:35:00','2026-01-25 11:35:00','2026-01-24 10:35:19',NULL),(5,15,'33333333C','1','Estadio','2026-02-04','17:11:00','16:16:00','2026-02-04 09:16:00','2026-02-03 15:11:21',NULL),(6,15,'1111111','1','1','2026-02-14','13:32:00','12:31:00','2026-02-13 12:31:00','2026-02-11 11:31:16',NULL),(7,15,'1111111','2','2','2026-02-13','12:31:00','09:31:00','2026-02-12 12:31:00','2026-02-11 11:31:41',NULL),(8,15,'1111111','3','3','2026-02-12','13:50:00','11:50:00','2026-02-11 16:53:00','2026-02-11 12:50:38',NULL),(9,15,'1111111','Repo','reda','2026-03-05','19:38:00','19:37:00','2026-03-05 19:37:00','2026-03-05 18:36:36',NULL),(10,15,'1111111','1234','1234','2026-03-07','19:49:00','18:49:00','2026-03-06 19:49:00','2026-03-05 18:49:30',NULL),(11,15,'1111111','Lopez','asd','2026-03-18','17:27:00','16:27:00','2026-03-17 17:27:00','2026-03-16 16:27:59','2026-03-16 17:28:23'),(12,15,'1111111','ad','asd','2026-03-16','17:29:00','17:29:00','2026-03-16 17:28:00','2026-03-16 16:28:45',NULL);
/*!40000 ALTER TABLE `convocatorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `equipos`
--

DROP TABLE IF EXISTS `equipos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `equipos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) DEFAULT NULL,
  `club_id` int DEFAULT NULL,
  `categoria_id` int DEFAULT NULL,
  `temporada_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `club_id` (`club_id`),
  KEY `categoria_id` (`categoria_id`),
  KEY `temporada_id` (`temporada_id`),
  CONSTRAINT `equipos_ibfk_1` FOREIGN KEY (`club_id`) REFERENCES `clubes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `equipos_ibfk_2` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON DELETE CASCADE,
  CONSTRAINT `equipos_ibfk_3` FOREIGN KEY (`temporada_id`) REFERENCES `temporadas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `equipos`
--

LOCK TABLES `equipos` WRITE;
/*!40000 ALTER TABLE `equipos` DISABLE KEYS */;
INSERT INTO `equipos` VALUES (13,'Alevin',3,1,1),(14,'Juvenil A',4,2,1),(15,'Alevin A',4,1,2),(16,'Prueba',4,3,2),(17,'asdasd',3,2,2),(18,'1',3,2,2),(19,'12',3,2,2),(20,'123',3,2,2),(21,'1234',3,2,2),(22,'12345',3,2,2);
/*!40000 ALTER TABLE `equipos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estadisticas_convocatoria`
--

DROP TABLE IF EXISTS `estadisticas_convocatoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estadisticas_convocatoria` (
  `id` int NOT NULL AUTO_INCREMENT,
  `convocatoria_id` int NOT NULL,
  `jugador_dni` varchar(20) NOT NULL,
  `minutos` int DEFAULT '0',
  `goles` int DEFAULT '0',
  `asistencias` int DEFAULT '0',
  `amarillas` int DEFAULT '0',
  `rojas` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `estado_asistencia` enum('presente','tarde','ausente','excusado') DEFAULT 'presente',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_stats` (`convocatoria_id`,`jugador_dni`),
  KEY `jugador_dni` (`jugador_dni`),
  CONSTRAINT `estadisticas_convocatoria_ibfk_1` FOREIGN KEY (`convocatoria_id`) REFERENCES `convocatorias` (`id`) ON DELETE CASCADE,
  CONSTRAINT `estadisticas_convocatoria_ibfk_2` FOREIGN KEY (`jugador_dni`) REFERENCES `usuarios` (`DNI`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estadisticas_convocatoria`
--

LOCK TABLES `estadisticas_convocatoria` WRITE;
/*!40000 ALTER TABLE `estadisticas_convocatoria` DISABLE KEYS */;
INSERT INTO `estadisticas_convocatoria` VALUES (1,7,'22334455A',90,0,0,0,0,'2026-02-20 11:29:10','2026-03-16 18:04:40','presente'),(2,8,'66666666A',10,0,2,1,1,'2026-02-20 11:29:22','2026-02-20 11:29:22','presente'),(3,6,'66666666A',51,2,0,0,0,'2026-02-20 11:29:52','2026-02-20 11:29:52','presente'),(4,9,'66666666A',90,2,0,0,0,'2026-03-05 18:46:50','2026-03-05 18:46:50','presente'),(5,9,'22334455A',90,0,0,0,0,'2026-03-05 18:46:50','2026-03-16 18:05:11','presente'),(8,10,'66666666A',0,0,0,0,0,'2026-03-16 16:26:06','2026-03-16 16:26:06','ausente'),(9,10,'22334455A',90,0,0,0,0,'2026-03-16 16:26:06','2026-03-16 18:04:29','presente'),(10,12,'66666666A',90,6,0,0,0,'2026-03-16 16:30:39','2026-04-08 15:17:11','presente'),(18,7,'11111111B',90,2,1,0,0,'2026-03-21 11:22:08','2026-03-21 11:22:08','presente'),(19,12,'11111111B',85,1,0,0,0,'2026-03-21 11:22:08','2026-03-21 11:22:08','presente'),(20,7,'22222222B',90,0,0,1,0,'2026-03-21 11:22:08','2026-03-21 11:22:08','presente'),(21,12,'22222222B',90,0,0,1,0,'2026-03-21 11:22:08','2026-03-21 11:22:08','presente'),(22,7,'33333333B',15,1,0,0,0,'2026-03-21 11:22:08','2026-03-21 11:22:08','presente'),(23,12,'33333333B',10,1,0,0,0,'2026-03-21 11:22:08','2026-03-21 11:22:08','presente'),(24,7,'44444444B',0,0,0,0,0,'2026-03-21 11:22:08','2026-03-21 11:22:08','ausente'),(25,7,'55555555B',90,0,2,0,0,'2026-03-21 11:22:08','2026-03-21 11:22:08','presente'),(26,12,'55555555B',90,0,1,0,0,'2026-03-21 11:22:08','2026-03-21 11:22:08','presente'),(27,7,'66666666B',45,0,0,0,1,'2026-03-21 11:22:08','2026-03-21 11:22:08','presente');
/*!40000 ALTER TABLE `estadisticas_convocatoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `evento_jugadores`
--

DROP TABLE IF EXISTS `evento_jugadores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evento_jugadores` (
  `evento_id` int NOT NULL,
  `jugador_dni` varchar(9) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `estado` enum('pendiente','confirmado','confirmado_tarde','rechazado') DEFAULT 'pendiente',
  `responded_at` datetime DEFAULT NULL,
  `notificado_at` datetime DEFAULT NULL,
  `recordatorio_at` datetime DEFAULT NULL,
  `motivo` text,
  PRIMARY KEY (`evento_id`,`jugador_dni`),
  KEY `jugador_dni` (`jugador_dni`),
  CONSTRAINT `evento_jugadores_ibfk_2` FOREIGN KEY (`jugador_dni`) REFERENCES `usuarios` (`DNI`) ON DELETE CASCADE,
  CONSTRAINT `fk_ej_evento` FOREIGN KEY (`evento_id`) REFERENCES `eventos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evento_jugadores`
--

LOCK TABLES `evento_jugadores` WRITE;
/*!40000 ALTER TABLE `evento_jugadores` DISABLE KEYS */;
INSERT INTO `evento_jugadores` VALUES (20,'66666666A','confirmado','2026-01-24 11:27:04','2026-01-24 11:24:55',NULL,NULL),(26,'22334455A','rechazado','2026-02-12 12:23:10','2026-02-12 12:17:29',NULL,'No puedo'),(26,'66666666A','confirmado','2026-02-12 12:21:45','2026-02-12 12:17:30',NULL,NULL),(28,'22334455A','pendiente',NULL,'2026-03-16 19:02:09',NULL,NULL),(28,'66666666A','pendiente',NULL,'2026-03-16 19:02:11',NULL,NULL);
/*!40000 ALTER TABLE `evento_jugadores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `eventos`
--

DROP TABLE IF EXISTS `eventos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `eventos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `equipo_id` int NOT NULL,
  `creador_dni` varchar(9) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `descripcion` text,
  `fecha_inicio` datetime NOT NULL,
  `fecha_fin` datetime NOT NULL,
  `requiere_confirmacion` tinyint(1) DEFAULT '0',
  `fecha_limite_confirmacion` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `tipo` enum('entrenamiento','partido','reunion','otro') NOT NULL DEFAULT 'otro',
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `equipo_id` (`equipo_id`),
  KEY `creador_dni` (`creador_dni`),
  KEY `idx_eventos_deleted_at` (`deleted_at`),
  CONSTRAINT `eventos_ibfk_1` FOREIGN KEY (`equipo_id`) REFERENCES `equipos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `eventos_ibfk_2` FOREIGN KEY (`creador_dni`) REFERENCES `usuarios` (`DNI`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `eventos`
--

LOCK TABLES `eventos` WRITE;
/*!40000 ALTER TABLE `eventos` DISABLE KEYS */;
INSERT INTO `eventos` VALUES (15,14,'1111111','1','1','2026-01-17 12:23:00','2026-01-17 14:25:00',0,NULL,'2026-01-16 11:23:23','2026-01-16 11:23:23','partido',NULL),(16,14,'1111111','2','2','2026-01-18 12:23:00','2026-01-18 15:26:00',1,'2026-01-17 12:23:00','2026-01-16 11:23:53','2026-01-16 11:23:53','reunion',NULL),(17,13,'1111111','1','1','2026-01-17 12:27:00','2026-01-17 15:30:00',0,NULL,'2026-01-16 11:27:54','2026-01-16 11:27:54','otro',NULL),(18,14,'1111111','3','3','2026-01-17 12:48:00','2026-01-17 15:51:00',1,'2026-01-16 15:51:00','2026-01-16 11:48:45','2026-01-16 11:48:45','otro',NULL),(19,14,'1111111','PropRop','aferti','2026-01-24 12:16:00','2026-01-24 14:18:00',0,NULL,'2026-01-23 11:16:51','2026-01-23 11:16:51','entrenamiento',NULL),(20,15,'33333333C','Confirmar 1','1','2026-01-26 11:24:00','2026-01-26 13:26:00',1,'2026-01-25 11:24:00','2026-01-24 10:24:54','2026-01-24 10:24:54','partido',NULL),(21,15,'1111111','123','123','2026-01-30 12:54:00','2026-01-30 14:56:00',0,NULL,'2026-01-29 11:54:16','2026-01-29 11:54:16','partido',NULL),(22,15,'1111111','1234','1234','2026-01-30 12:54:00','2026-01-30 14:56:00',0,NULL,'2026-01-29 11:54:54','2026-01-29 11:54:54','partido',NULL),(26,15,'1111111','4','443442423dadfvaffgfgfgdfgdfg','2026-02-13 14:19:00','2026-02-13 15:20:00',1,'2026-02-13 09:17:00','2026-02-12 11:17:28','2026-02-12 11:17:28','otro',NULL),(27,13,'555555','123','123','2026-02-13 12:24:00','2026-02-13 14:26:00',0,NULL,'2026-02-12 11:24:51','2026-02-12 11:24:51','otro',NULL),(28,15,'1111111','a','a','2026-03-16 19:01:00','2026-03-16 19:02:00',0,NULL,'2026-03-16 18:02:08','2026-03-16 18:02:08','entrenamiento',NULL);
/*!40000 ALTER TABLE `eventos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jugadores`
--

DROP TABLE IF EXISTS `jugadores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jugadores` (
  `idJugadores` int NOT NULL AUTO_INCREMENT,
  `DNI` varchar(9) NOT NULL,
  `Goles` int NOT NULL DEFAULT '0',
  `Asistencias` int NOT NULL DEFAULT '0',
  `Faltas` int NOT NULL DEFAULT '0',
  `Regates` int NOT NULL DEFAULT '0',
  `Tarjetas` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`idJugadores`),
  UNIQUE KEY `DNI_UNIQUE` (`DNI`),
  KEY `fk_Jugadores_Usuarios_idx` (`DNI`),
  CONSTRAINT `fk_Jugadores_Usuarios` FOREIGN KEY (`DNI`) REFERENCES `usuarios` (`DNI`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jugadores`
--

LOCK TABLES `jugadores` WRITE;
/*!40000 ALTER TABLE `jugadores` DISABLE KEYS */;
/*!40000 ALTER TABLE `jugadores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `observaciones`
--

DROP TABLE IF EXISTS `observaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `observaciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `autor_dni` varchar(9) NOT NULL,
  `jugador_dni` varchar(9) NOT NULL,
  `equipo_id` int DEFAULT NULL,
  `titulo` varchar(100) NOT NULL,
  `contenido` text NOT NULL,
  `categoria` enum('técnica','táctica','física','actitud','general') DEFAULT 'general',
  `visibilidad` enum('privado','jugador','club') DEFAULT 'jugador',
  `fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `autor_dni` (`autor_dni`),
  KEY `jugador_dni` (`jugador_dni`),
  KEY `equipo_id` (`equipo_id`),
  CONSTRAINT `observaciones_ibfk_1` FOREIGN KEY (`autor_dni`) REFERENCES `usuarios` (`DNI`) ON DELETE CASCADE,
  CONSTRAINT `observaciones_ibfk_2` FOREIGN KEY (`jugador_dni`) REFERENCES `usuarios` (`DNI`) ON DELETE CASCADE,
  CONSTRAINT `observaciones_ibfk_3` FOREIGN KEY (`equipo_id`) REFERENCES `equipos` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `observaciones`
--

LOCK TABLES `observaciones` WRITE;
/*!40000 ALTER TABLE `observaciones` DISABLE KEYS */;
INSERT INTO `observaciones` VALUES (1,'77777777B','22334455A',15,'Prueba General','Prueba general visible','general','jugador','2026-02-18 12:40:02'),(2,'77777777B','22334455A',15,'Prueba Tecnica ','Prueba Tecnica solo Entrenador/Club','técnica','club','2026-02-18 12:40:36'),(3,'77777777B','22334455A',15,'Prueba Fisico','Solo Entrenador','física','privado','2026-02-18 12:40:54');
/*!40000 ALTER TABLE `observaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rendimiento_entrenamiento`
--

DROP TABLE IF EXISTS `rendimiento_entrenamiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rendimiento_entrenamiento` (
  `id` int NOT NULL AUTO_INCREMENT,
  `evento_id` int NOT NULL,
  `jugador_dni` varchar(9) NOT NULL,
  `estado_asistencia` enum('presente','tarde','ausente','excusado') DEFAULT 'presente',
  `nota_general` decimal(3,1) DEFAULT '0.0',
  `intensidad` tinyint DEFAULT '0',
  `actitud` tinyint DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_evento_jugador` (`evento_id`,`jugador_dni`),
  KEY `jugador_dni` (`jugador_dni`),
  CONSTRAINT `rendimiento_entrenamiento_ibfk_1` FOREIGN KEY (`evento_id`) REFERENCES `eventos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `rendimiento_entrenamiento_ibfk_2` FOREIGN KEY (`jugador_dni`) REFERENCES `usuarios` (`DNI`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rendimiento_entrenamiento`
--

LOCK TABLES `rendimiento_entrenamiento` WRITE;
/*!40000 ALTER TABLE `rendimiento_entrenamiento` DISABLE KEYS */;
INSERT INTO `rendimiento_entrenamiento` VALUES (1,28,'22334455A','presente',10.0,7,7),(2,28,'66666666A','presente',3.0,3,3),(3,28,'11111111B','presente',9.5,9,9),(4,28,'22222222B','presente',7.0,10,8),(5,28,'33333333B','presente',6.0,5,6),(6,28,'44444444B','tarde',2.0,1,1),(7,28,'55555555B','presente',8.5,8,10),(8,28,'66666666B','presente',4.0,6,2);
/*!40000 ALTER TABLE `rendimiento_entrenamiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `temporadas`
--

DROP TABLE IF EXISTS `temporadas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `temporadas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(30) NOT NULL,
  `anio` int NOT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `temporadas`
--

LOCK TABLES `temporadas` WRITE;
/*!40000 ALTER TABLE `temporadas` DISABLE KEYS */;
INSERT INTO `temporadas` VALUES (1,'2025/2025',0,0),(2,'2025/2026',2026,1);
/*!40000 ALTER TABLE `temporadas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `DNI` varchar(9) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `Rol` varchar(20) DEFAULT NULL,
  `email` varchar(45) NOT NULL,
  `telefono` varchar(45) NOT NULL,
  `anio_nacimiento` int NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `resetToken` varchar(255) DEFAULT NULL,
  `resetTokenExp` bigint DEFAULT NULL,
  `invitationToken` varchar(255) DEFAULT NULL,
  `invitationExp` bigint DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `idTutor` varchar(9) DEFAULT NULL,
  `club_id` int DEFAULT NULL,
  `equipo_id` int DEFAULT NULL,
  PRIMARY KEY (`DNI`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  UNIQUE KEY `telefono_UNIQUE` (`telefono`),
  KEY `fk_tutor` (`idTutor`),
  KEY `club_id` (`club_id`),
  KEY `equipo_id` (`equipo_id`),
  CONSTRAINT `fk_tutor` FOREIGN KEY (`idTutor`) REFERENCES `usuarios` (`DNI`) ON DELETE SET NULL,
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`club_id`) REFERENCES `clubes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `usuarios_ibfk_2` FOREIGN KEY (`equipo_id`) REFERENCES `equipos` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES ('1111111','Marcos','admin_plataforma','marcra03@ucm.es','111111111',0,'$2b$10$Wj1rGzxQBkuJrQXJ9oDjQu.gVLfe83DATKo9Di9tXqTA36maKATWq',NULL,NULL,NULL,NULL,'/uploads/1764608509697-sinner.jpg',NULL,NULL,NULL),('11111111B','Griezmann Fake','jugador','grizi@test.com','600000001',2010,'$2b$10$jOPj417hzRjF4qFq358gBu3WKh73XyV.AtoWdWPkO37Ok187HFIcW',NULL,NULL,NULL,NULL,NULL,NULL,4,15),('222222','Ramos','tutor','a@a.com','1234567888',0,'$2b$10$38ICXkeMmCoaarRnyFmXy.VBzt2D58b91/WCyBYVMxk7pU5CK2bnG',NULL,NULL,NULL,NULL,'/uploads/1766062608574-barba.PNG',NULL,NULL,NULL),('22222222A','Marcos','jugador','idlymarcboll@gmail.com','222222222',2010,'$2b$10$AlN38ynwwXk81Gt/AFLJn.iHnMoUSkrU2sw/lrFSJHkEwvSEf1Jqa',NULL,NULL,NULL,NULL,NULL,NULL,4,NULL),('22222222B','Pepe Hard','jugador','pepe@test.com','600000002',2010,'$2b$10$jOPj417hzRjF4qFq358gBu3WKh73XyV.AtoWdWPkO37Ok187HFIcW',NULL,NULL,NULL,NULL,NULL,NULL,4,15),('22334455A','Pelos','jugador','c@c.com','223344556',2018,'$2b$10$8Rj/e.iiXRj2YXbkbBiILuk5lo5rTr7NPa39bhW9T/Kz9kXG2ll6.',NULL,NULL,NULL,NULL,NULL,'222222',4,15),('33333333B','Suplente Eterno','jugador','suplente@test.com','600000003',2010,'$2b$10$jOPj417hzRjF4qFq358gBu3WKh73XyV.AtoWdWPkO37Ok187HFIcW',NULL,NULL,NULL,NULL,NULL,NULL,4,15),('33333333C','Navarro','admin_club','cuentabajita@gmail.com','333333333',0,'$2b$10$yu7AYzykatwirStgbKnYjuunye9Pd0vRuuCQ5gj4EQalaLt2VZCaa',NULL,NULL,NULL,NULL,NULL,NULL,4,NULL),('44444444A','Plipo','jugador','splitspagat@gmail.com','444444444',2010,NULL,NULL,NULL,'555cba18-7a7a-4df0-bd39-5e4ee5df94c6',1769861129677,NULL,NULL,4,NULL),('44444444B','Vago Martinez','jugador','vago@test.com','600000004',2010,'$2b$10$jOPj417hzRjF4qFq358gBu3WKh73XyV.AtoWdWPkO37Ok187HFIcW',NULL,NULL,NULL,NULL,NULL,NULL,4,15),('555555','Raul','entrenador','b@b.com','123456789',0,'$2b$10$YaedjnQlnaHEW9.nVLMah.ivuOQrnoWRKEjwrMuQUOgt5XRd/a0tu',NULL,NULL,NULL,NULL,NULL,'222222',3,13),('55555555A','Plapo','jugador','prueba@gmail.com','555555555',2010,'$2b$10$Z7qE5yq1K5jrHRHpL6gy3O5goqa9y2Jt6slDTZWjuQSX/HSRAUriO',NULL,NULL,NULL,NULL,'/uploads/1769688463487-16508822676282.jpg',NULL,4,16),('55555555B','Promesa Top','jugador','promesa@test.com','600000005',2010,'$2b$10$jOPj417hzRjF4qFq358gBu3WKh73XyV.AtoWdWPkO37Ok187HFIcW',NULL,NULL,NULL,NULL,NULL,NULL,4,15),('66666666A','Lucas','jugador','lel@lel.com','666666666',2020,'$2b$10$jOPj417hzRjF4qFq358gBu3WKh73XyV.AtoWdWPkO37Ok187HFIcW',NULL,NULL,NULL,NULL,NULL,'222222',4,15),('66666666B','Tarjeta Roja','jugador','roja@test.com','600000006',2010,'$2b$10$jOPj417hzRjF4qFq358gBu3WKh73XyV.AtoWdWPkO37Ok187HFIcW',NULL,NULL,NULL,NULL,NULL,NULL,4,15),('77777777B','Carlos','entrenador','carlos@club.com','777777777',1990,'$2b$10$jOPj417hzRjF4qFq358gBu3WKh73XyV.AtoWdWPkO37Ok187HFIcW',NULL,NULL,NULL,NULL,NULL,NULL,4,15),('88888888C','Miguel','entrenador','miguel@club.com','888888888',1985,'$2b$10$jOPj417hzRjF4qFq358gBu3WKh73XyV.AtoWdWPkO37Ok187HFIcW',NULL,NULL,NULL,NULL,NULL,NULL,4,15);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-16 19:36:42
