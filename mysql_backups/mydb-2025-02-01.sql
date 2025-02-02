-- MySQL dump 10.13  Distrib 8.0.36, for Linux (aarch64)
--
-- Host: localhost    Database: mydb
-- ------------------------------------------------------
-- Server version	8.0.36

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `dane_osobowe`
--

DROP TABLE IF EXISTS `dane_osobowe`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dane_osobowe` (
  `idDane_osobowe` int NOT NULL AUTO_INCREMENT,
  `Imie` varchar(45) NOT NULL,
  `Nazwisko` varchar(45) NOT NULL,
  `Data_urodzenia` date DEFAULT NULL,
  `Pesel` varchar(12) DEFAULT NULL,
  `Ulica_NrDomu` varchar(45) DEFAULT NULL,
  `Kod_pocztowy` varchar(45) DEFAULT NULL,
  `Miejscowosc` varchar(45) DEFAULT NULL,
  `Kraj` varchar(45) DEFAULT NULL,
  `TelefonPolska` varchar(45) DEFAULT NULL,
  `TelefonSzwecja` varchar(45) DEFAULT NULL,
  `Email` varchar(45) DEFAULT NULL,
  `Krewni` varchar(45) DEFAULT NULL,
  `Kontakt_w_razie_wypadku` varchar(45) DEFAULT NULL,
  `NIP` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`idDane_osobowe`),
  UNIQUE KEY `Pesel_UNIQUE` (`Pesel`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb3 COMMENT='\\''\\''\\';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dane_osobowe`
--

LOCK TABLES `dane_osobowe` WRITE;
/*!40000 ALTER TABLE `dane_osobowe` DISABLE KEYS */;
INSERT INTO `dane_osobowe` VALUES (1,'Jan','Kowalski','1980-01-15','80011512345','Marszałkowska 1','00-001','Warszawa','Polska','123456789','0987654321','jan.kowalski@example.com','Maria Kowalska','Anna Nowak','1234567890'),(2,'Anna','Nowak','1990-05-20','90052067890','Długa 10','00-002','Kraków','Polska','234567890','8765432109','anna.nowak@example.com',NULL,'Jan Kowalski','0987654321'),(3,'Tomasz','Wachala','1990-07-23','90072512345','Kwiatowa 12','00-123','Warszawa','Polska','123456789','987654321','tomasz.wachala@example.com',NULL,'429',NULL),(4,'Paweł','Chełmecki','1969-12-29','8010265836','Alebackevagen 9','43-854','Hindas','Szwecja','602441152','0760149220','pawel@pchusbyggen.se','Anna Chełmecka','602441151',NULL),(5,'Łukasz','Gołąb','1969-12-30',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(6,'Łukasz','Gołąb',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(7,'Józef','Chełmecki','1969-12-31',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(8,'Waldemar','Dymowski','2025-01-30',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(9,'Krzysztof','Prusak','1969-12-31',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(10,'Artur','Kowalczyk','1969-12-30',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(11,'Jarosław','Pajor','1969-12-31',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(12,'Mirosław','Kocoń','1969-12-31',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(13,'Marek','Kołodziej','1969-12-31',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(14,'Wojciech','Lupa','1969-12-31',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(15,'Patryk','Janór','1969-12-31',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(16,'Marek','Król','1969-12-31',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(17,'Michał','Kozuch','1969-12-31',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(18,'Krzysztof','Wieczorek','1969-12-31',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(19,'Tomasz','Błoniarz','1969-12-31',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(20,'Piotr','Gołąb','2001-06-11','01261210517','Żbikowice 12','33-314','Łososina Dolna','Polska','574713856',NULL,'piogolab2@gmail.com','Maria Gołąb','609249084',NULL),(21,'Adrian','Pajor','1969-12-31',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(22,'Dariusz','Malik','1969-12-31',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(23,'Paweł','Zabrzeński','1969-12-31',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(24,'Kazimierz','Nowak','1969-12-31',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(25,'Paweł','Wójtowicz','1969-12-31',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(26,'Piotr','Hajduga','1969-12-31',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(27,'Dariusz','Pawlikowski','1969-12-31',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(28,'test','test','2024-12-31','t','t','30-000','Kraków','Polska','test',NULL,'test',NULL,'test',NULL),(29,'test1','test1',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(30,'test1','test1',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(31,'test','test',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(32,'test','test',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(33,'test','test',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(34,'test12','test12',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(35,'Mirosław','Kocoń',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(36,'tt','tt',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(37,'Andrzej','Zabrzeński','1969-12-31',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(38,'Krzysztof','Zabrzeński',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(39,'Tomasz','Maciaś','1969-12-30',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(40,'Wojciech','Szymosz',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(41,'Szymon','Lipina',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(42,'Test','Test','2017-01-02','123123123','tttttt','01-010','qqqqqq',NULL,'101010101',NULL,'1010101010111',NULL,'0101010101',NULL),(43,'Margareta ','Tylicki','1959-04-06','590408-2343','CA Reuterswärdsgata 8','41-648','Göteborg','Szwecja','+46706605132','+46706605132','maggan@pchusbyggen.se','Marek Tylicki','+46709267463',NULL);
/*!40000 ALTER TABLE `dane_osobowe` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dzien`
--

DROP TABLE IF EXISTS `dzien`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dzien` (
  `idDzien` int NOT NULL AUTO_INCREMENT,
  `Dzien_tygodnia` enum('Poniedziałek','Wtorek','Środa','Czwartek','Piątek','Sobota','Niedziela') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Rozpoczecia_pracy` time DEFAULT NULL,
  `Zakonczenia_pracy` time DEFAULT NULL,
  `Tydzien_idTydzien` int NOT NULL,
  `Przerwa` time DEFAULT NULL,
  PRIMARY KEY (`idDzien`,`Tydzien_idTydzien`),
  KEY `fk_Dzien_Tydzien1_idx` (`Tydzien_idTydzien`),
  CONSTRAINT `fk_Dzien_Tydzien1` FOREIGN KEY (`Tydzien_idTydzien`) REFERENCES `tydzien` (`idTydzien`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dzien`
--

LOCK TABLES `dzien` WRITE;
/*!40000 ALTER TABLE `dzien` DISABLE KEYS */;
/*!40000 ALTER TABLE `dzien` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dzien_projekty`
--

DROP TABLE IF EXISTS `dzien_projekty`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dzien_projekty` (
  `idDzien_Projekty` int NOT NULL AUTO_INCREMENT,
  `Godziny_przepracowane` decimal(5,2) NOT NULL,
  `Dzien_idDzien` int NOT NULL,
  `Projekty_idProjekty` int NOT NULL,
  `Pojazdy_idPojazdy` int DEFAULT NULL,
  `Komentarz` varchar(1024) DEFAULT NULL,
  `Parking` varchar(255) DEFAULT NULL,
  `Kilometry` varchar(45) DEFAULT NULL,
  `Inne_koszty` varchar(45) DEFAULT NULL,
  `Diety` varchar(45) DEFAULT NULL,
  `Wypozyczenie_narzedzi` varchar(45) DEFAULT NULL,
  `Zuzyte_materialy` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`idDzien_Projekty`,`Dzien_idDzien`,`Projekty_idProjekty`),
  KEY `fk_Dzien_Projekty_Dzien1_idx` (`Dzien_idDzien`),
  KEY `fk_Dzien_Projekty_Projekty1_idx` (`Projekty_idProjekty`),
  KEY `fk_Dzien_Projekty_Pojazdy1_idx` (`Pojazdy_idPojazdy`),
  CONSTRAINT `fk_Dzien_Projekty_Dzien1` FOREIGN KEY (`Dzien_idDzien`) REFERENCES `dzien` (`idDzien`),
  CONSTRAINT `fk_Dzien_Projekty_Pojazdy1` FOREIGN KEY (`Pojazdy_idPojazdy`) REFERENCES `pojazdy` (`idPojazdy`),
  CONSTRAINT `fk_Dzien_Projekty_Projekty1` FOREIGN KEY (`Projekty_idProjekty`) REFERENCES `projekty` (`idProjekty`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dzien_projekty`
--

LOCK TABLES `dzien_projekty` WRITE;
/*!40000 ALTER TABLE `dzien_projekty` DISABLE KEYS */;
/*!40000 ALTER TABLE `dzien_projekty` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `firma`
--

DROP TABLE IF EXISTS `firma`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `firma` (
  `idFirma` int NOT NULL AUTO_INCREMENT,
  `Nazwa_firmy` varchar(45) DEFAULT NULL,
  `Wlasciciel_firmy` varchar(45) DEFAULT NULL,
  `Liczba_pracownikow` int DEFAULT NULL,
  `Archiwum` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`idFirma`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `firma`
--

LOCK TABLES `firma` WRITE;
/*!40000 ALTER TABLE `firma` DISABLE KEYS */;
INSERT INTO `firma` VALUES (1,'PC Husbyggen','Adam Wiśniewski',25,0);
/*!40000 ALTER TABLE `firma` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grupa_urlopowa`
--

DROP TABLE IF EXISTS `grupa_urlopowa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grupa_urlopowa` (
  `idGrupa_urlopowa` int NOT NULL AUTO_INCREMENT,
  `Zleceniodawca` varchar(45) DEFAULT NULL,
  `Cennik` varchar(45) DEFAULT NULL,
  `Stawka` decimal(10,2) DEFAULT NULL,
  `Plan_tygodniaV` tinyint DEFAULT NULL,
  `Archiwum` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`idGrupa_urlopowa`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grupa_urlopowa`
--

LOCK TABLES `grupa_urlopowa` WRITE;
/*!40000 ALTER TABLE `grupa_urlopowa` DISABLE KEYS */;
INSERT INTO `grupa_urlopowa` VALUES (1,'Zleceniodawca A','Cennik A',50.00,1,1),(2,'Zleceniodawca B','Cennik B',75.00,0,1),(3,'NCW Plåt',NULL,NULL,1,0),(4,'NCC',NULL,NULL,1,0),(5,'POGAB',NULL,NULL,1,0),(6,'PC Husbyggen',NULL,NULL,1,0),(7,'Skanska',NULL,NULL,1,0),(8,'Bygg System',NULL,NULL,1,0),(9,'Bygglogik Nisse',NULL,NULL,1,0),(10,'Mide Bygg / Bogdan',NULL,NULL,1,0),(11,'Do dyspozycji',NULL,NULL,1,0),(12,'Urlopy',NULL,NULL,1,0);
/*!40000 ALTER TABLE `grupa_urlopowa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `informacje_o_firmie`
--

DROP TABLE IF EXISTS `informacje_o_firmie`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `informacje_o_firmie` (
  `idInformacje_o_firmie` int NOT NULL AUTO_INCREMENT,
  `Data_rozpoczecia` date NOT NULL,
  `Data_zakonczenia` date DEFAULT NULL,
  `Kod_wynagrodzenia` varchar(45) DEFAULT NULL,
  `Plan_TygodniaV` tinyint DEFAULT NULL,
  `Drukowac_Urlop` tinyint DEFAULT NULL,
  `FK_idPojazdy` int DEFAULT NULL,
  `FK_idFirma` int NOT NULL,
  `FK_idGrupa_urlopowa` int DEFAULT NULL,
  PRIMARY KEY (`idInformacje_o_firmie`,`FK_idFirma`),
  KEY `fk_Informacje_o_firmie_Pojazdy1_idx` (`FK_idPojazdy`),
  KEY `fk_Informacje_o_firmie_Firma1_idx` (`FK_idFirma`),
  KEY `fk_Informacje_o_firmie_Grupa_urlopowa1_idx` (`FK_idGrupa_urlopowa`),
  CONSTRAINT `fk_Informacje_o_firmie_Firma1` FOREIGN KEY (`FK_idFirma`) REFERENCES `firma` (`idFirma`),
  CONSTRAINT `fk_Informacje_o_firmie_Grupa_urlopowa1` FOREIGN KEY (`FK_idGrupa_urlopowa`) REFERENCES `grupa_urlopowa` (`idGrupa_urlopowa`) ON DELETE SET NULL,
  CONSTRAINT `fk_Informacje_o_firmie_Pojazdy1` FOREIGN KEY (`FK_idPojazdy`) REFERENCES `pojazdy` (`idPojazdy`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `informacje_o_firmie`
--

LOCK TABLES `informacje_o_firmie` WRITE;
/*!40000 ALTER TABLE `informacje_o_firmie` DISABLE KEYS */;
INSERT INTO `informacje_o_firmie` VALUES (1,'2024-01-01','2024-12-31','KOD001',1,1,1,1,1),(2,'2024-06-01','2025-05-31','KOD002',0,0,2,1,2),(3,'2023-12-30','2024-12-29','KOD003',0,0,1,1,NULL),(4,'2025-01-26','1969-12-29',NULL,1,1,NULL,1,12),(5,'2025-01-27','1969-12-30',NULL,1,1,19,1,5),(6,'2025-01-29',NULL,NULL,1,1,NULL,1,NULL),(7,'2025-01-28','1969-12-31',NULL,1,1,NULL,1,3),(8,'2025-01-27','1969-12-30',NULL,1,1,15,1,3),(9,'2025-01-28','1969-12-31',NULL,1,1,11,1,3),(10,'2025-01-27','1969-12-30',NULL,1,1,17,1,3),(11,'2025-01-28','1969-12-31',NULL,1,1,8,1,3),(12,'2025-01-28','1969-12-31',NULL,1,1,18,1,4),(13,'2025-01-28','1969-12-31',NULL,1,1,3,1,4),(14,'2025-01-28','1969-12-31',NULL,1,1,18,1,4),(15,'2025-01-28','1969-12-31',NULL,0,0,NULL,1,NULL),(16,'2025-01-28','1969-12-31',NULL,1,1,4,1,9),(17,'2025-01-28','1969-12-31',NULL,1,1,11,1,10),(18,'2025-01-28','1969-12-31',NULL,1,1,19,1,5),(19,'2025-01-28','1969-12-31',NULL,1,1,7,1,5),(20,'2025-01-28',NULL,NULL,1,1,NULL,1,4),(21,'2025-01-28','1969-12-31',NULL,1,1,NULL,1,4),(22,'2025-01-28','1969-12-31',NULL,1,1,NULL,1,11),(23,'2025-01-28','1969-12-31',NULL,1,1,NULL,1,11),(24,'2025-01-28','1969-12-31',NULL,1,1,NULL,1,4),(25,'2025-01-28','1969-12-31',NULL,1,1,NULL,1,4),(26,'2025-01-28','1969-12-31',NULL,1,1,NULL,1,12),(27,'2025-01-28','1969-12-31',NULL,1,1,10,1,3),(28,'2025-01-28',NULL,NULL,1,1,NULL,1,NULL),(29,'2025-02-05',NULL,NULL,1,1,NULL,1,NULL),(30,'2025-02-05',NULL,NULL,1,1,NULL,1,NULL),(31,'2025-01-29',NULL,NULL,0,0,NULL,1,NULL),(32,'2025-01-29',NULL,NULL,0,0,NULL,1,NULL),(33,'2025-01-29',NULL,NULL,0,0,NULL,1,NULL),(34,'2025-01-29',NULL,NULL,0,0,NULL,1,NULL),(35,'2025-01-29',NULL,NULL,1,1,18,1,4),(36,'2025-01-29',NULL,NULL,0,0,NULL,1,NULL),(37,'2025-01-28','1969-12-31',NULL,1,1,3,1,4),(38,'2025-01-29',NULL,NULL,1,1,3,1,4),(39,'2025-01-27','1969-12-30',NULL,1,1,7,1,5),(40,'2025-01-29',NULL,NULL,1,1,19,1,5),(41,'2025-01-29',NULL,NULL,1,1,10,1,3),(42,'2024-12-29',NULL,NULL,0,0,NULL,1,NULL),(43,'2024-12-29',NULL,NULL,0,0,NULL,1,NULL);
/*!40000 ALTER TABLE `informacje_o_firmie` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `logi`
--

DROP TABLE IF EXISTS `logi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `logi` (
  `idLogi` int NOT NULL AUTO_INCREMENT,
  `Data` timestamp NULL DEFAULT NULL,
  `Komentarz` varchar(45) DEFAULT NULL,
  `FK_idPracownik` int NOT NULL,
  PRIMARY KEY (`idLogi`,`FK_idPracownik`),
  KEY `fk_Logi_Pracownik1_idx` (`FK_idPracownik`),
  CONSTRAINT `fk_Logi_Pracownik1` FOREIGN KEY (`FK_idPracownik`) REFERENCES `pracownik` (`idPracownik`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `logi`
--

LOCK TABLES `logi` WRITE;
/*!40000 ALTER TABLE `logi` DISABLE KEYS */;
INSERT INTO `logi` VALUES (1,'2025-01-30 15:21:14','Zalogowano',3),(2,'2025-01-30 15:46:41','Zalogowano',3),(3,'2025-01-30 15:54:20','Zalogowano',3),(4,'2025-01-30 16:04:03','Zalogowano',28),(5,'2025-01-30 16:05:34','Zalogowano',3),(6,'2025-01-30 16:06:49','Zalogowano',3),(7,'2025-01-30 16:22:28','Zalogowano',28),(8,'2025-01-30 16:22:39','Zalogowano',28),(9,'2025-01-30 16:22:46','Zalogowano',3),(10,'2025-01-30 16:23:33','Zalogowano',28),(11,'2025-01-30 16:24:10','Zalogowano',3),(12,'2025-01-30 16:24:40','Zalogowano',34),(13,'2025-01-30 16:24:56','Zalogowano',3),(14,'2025-01-30 16:30:30','Zalogowano',3),(15,'2025-01-30 17:05:10','Zalogowano',36),(16,'2025-01-30 17:05:53','Zalogowano',3),(17,'2025-01-30 17:41:46','Zalogowano',4),(18,'2025-01-30 17:45:04','Zalogowano',42),(19,'2025-01-30 17:49:49','Zalogowano',4),(20,'2025-01-30 18:05:10','Zalogowano',3),(21,'2025-01-30 18:35:51','Zalogowano',4),(22,'2025-01-30 18:43:10','Zalogowano',3),(23,'2025-01-30 19:36:30','Zalogowano',3),(24,'2025-01-30 21:12:45','Zalogowano',3),(25,'2025-01-30 21:43:18','Zalogowano',3),(26,'2025-01-30 22:18:44','Zalogowano',3),(27,'2025-01-30 22:19:24','Zalogowano',3),(28,'2025-01-30 22:19:24','Zalogowano',3),(29,'2025-01-30 22:21:37','Zalogowano',3),(30,'2025-01-31 06:11:39','Zalogowano',4),(31,'2025-01-31 06:17:14','Zalogowano',4),(32,'2025-01-31 06:30:29','Zalogowano',4),(33,'2025-01-31 06:47:10','Zalogowano',43),(34,'2025-01-31 06:56:00','Zalogowano',4),(35,'2025-01-31 07:01:14','Zalogowano',43),(36,'2025-01-31 07:02:18','Zalogowano',43),(37,'2025-01-31 08:00:48','Zalogowano',40),(38,'2025-01-31 08:06:36','Zalogowano',3),(39,'2025-01-31 09:37:58','Zalogowano',3),(40,'2025-01-31 10:29:20','Zalogowano',3),(41,'2025-01-31 18:21:00','Zalogowano',3),(42,'2025-01-31 19:04:56','Zalogowano',20),(43,'2025-01-31 19:09:16','Zalogowano',20);
/*!40000 ALTER TABLE `logi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ogloszenia`
--

DROP TABLE IF EXISTS `ogloszenia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ogloszenia` (
  `idOgloszenia` int NOT NULL AUTO_INCREMENT,
  `Wiadomosc` varchar(45) DEFAULT NULL,
  `Tytul` varchar(45) DEFAULT NULL,
  `Grupa_urlopowa_idGrupa_urlopowa` int DEFAULT NULL,
  PRIMARY KEY (`idOgloszenia`),
  KEY `fk_Ogloszenia_Grupa_urlopowa1_idx` (`Grupa_urlopowa_idGrupa_urlopowa`),
  CONSTRAINT `fk_Ogloszenia_Grupa_urlopowa1` FOREIGN KEY (`Grupa_urlopowa_idGrupa_urlopowa`) REFERENCES `grupa_urlopowa` (`idGrupa_urlopowa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ogloszenia`
--

LOCK TABLES `ogloszenia` WRITE;
/*!40000 ALTER TABLE `ogloszenia` DISABLE KEYS */;
/*!40000 ALTER TABLE `ogloszenia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plan_tygodnia_v`
--

DROP TABLE IF EXISTS `plan_tygodnia_v`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plan_tygodnia_v` (
  `idPlan_Tygodnia_V` int NOT NULL AUTO_INCREMENT,
  `Pracownik_idPracownik` int DEFAULT NULL,
  `tydzienRoku` int NOT NULL,
  `Rok` int NOT NULL,
  `m_value` enum('M1','M2','M3','M4','M5') DEFAULT NULL,
  `Opis` varchar(150) DEFAULT NULL,
  `data_od` date DEFAULT NULL,
  `data_do` date DEFAULT NULL,
  `Grupa_urlopowa_idGrupa_urlopowa` int NOT NULL,
  `Pojazdy_idPojazdy` int DEFAULT NULL,
  PRIMARY KEY (`idPlan_Tygodnia_V`,`Grupa_urlopowa_idGrupa_urlopowa`),
  UNIQUE KEY `Rok_UNIQUE` (`Rok`,`tydzienRoku`,`Pracownik_idPracownik`,`Pojazdy_idPojazdy`) /*!80000 INVISIBLE */,
  KEY `fk_Plan_Tygodnia_V_Pracownik1_idx` (`Pracownik_idPracownik`),
  KEY `fk_Plan_Tygodnia_V_Grupa_urlopowa1_idx` (`Grupa_urlopowa_idGrupa_urlopowa`),
  KEY `fk_Plan_Tygodnia_V_Pojazdy1_idx` (`Pojazdy_idPojazdy`),
  CONSTRAINT `fk_Plan_Tygodnia_V_Grupa_urlopowa1` FOREIGN KEY (`Grupa_urlopowa_idGrupa_urlopowa`) REFERENCES `grupa_urlopowa` (`idGrupa_urlopowa`),
  CONSTRAINT `fk_Plan_Tygodnia_V_Pojazdy1` FOREIGN KEY (`Pojazdy_idPojazdy`) REFERENCES `pojazdy` (`idPojazdy`),
  CONSTRAINT `fk_Plan_Tygodnia_V_Pracownik1` FOREIGN KEY (`Pracownik_idPracownik`) REFERENCES `pracownik` (`idPracownik`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plan_tygodnia_v`
--

LOCK TABLES `plan_tygodnia_v` WRITE;
/*!40000 ALTER TABLE `plan_tygodnia_v` DISABLE KEYS */;
INSERT INTO `plan_tygodnia_v` VALUES (1,4,4,2025,'M1','','2025-01-27','2025-02-02',11,NULL),(2,5,4,2025,'M1','','2025-01-27','2025-02-02',5,NULL),(3,7,4,2025,'M1','','2025-01-27','2025-02-02',3,NULL),(4,8,4,2025,'M1','','2025-01-27','2025-02-02',3,NULL),(5,10,4,2025,'M1','','2025-01-27','2025-02-02',3,NULL),(6,11,4,2025,'M1','','2025-01-27','2025-02-02',3,NULL),(7,12,4,2025,'M1','','2025-01-27','2025-02-02',4,NULL),(8,13,4,2025,'M1','','2025-01-27','2025-02-02',4,NULL),(9,14,4,2025,'M1','','2025-01-27','2025-02-02',4,NULL),(11,16,4,2025,'M1','','2025-01-27','2025-02-02',8,NULL),(12,17,4,2025,'M1','','2025-01-27','2025-02-02',10,NULL),(13,18,4,2025,'M1','','2025-01-27','2025-02-02',5,NULL),(14,19,4,2025,'M1','','2025-01-27','2025-02-02',5,NULL),(15,20,4,2025,'M1','','2025-01-27','2025-02-02',4,NULL),(16,21,4,2025,'M1','','2025-01-27','2025-02-02',4,NULL),(17,22,4,2025,'M1','','2025-01-27','2025-02-02',6,NULL),(18,23,4,2025,'M1','','2025-01-27','2025-02-02',6,NULL),(19,24,4,2025,'M1','','2025-01-27','2025-02-02',11,NULL),(20,25,4,2025,'M1','','2025-01-27','2025-02-02',4,NULL),(21,26,4,2025,'M1','','2025-01-27','2025-02-02',12,NULL),(22,27,4,2025,'M1','','2025-01-27','2025-02-02',3,NULL),(23,9,4,2025,'M1','','2025-01-27','2025-02-02',3,NULL),(24,NULL,4,2025,'M1','','2025-01-27','2025-02-02',4,3),(25,NULL,4,2025,'M1','','2025-01-27','2025-02-02',8,4),(26,NULL,4,2025,'M1','','2025-01-27','2025-02-02',3,5),(27,NULL,4,2025,'M1','','2025-01-27','2025-02-02',5,6),(28,NULL,4,2025,'M1','','2025-01-27','2025-02-02',5,7),(29,NULL,4,2025,'M1','','2025-01-27','2025-02-02',3,8),(30,NULL,4,2025,'M1','','2025-01-27','2025-02-02',11,9),(31,NULL,4,2025,'M1','','2025-01-27','2025-02-02',11,10),(32,NULL,4,2025,'M1','','2025-01-27','2025-02-02',10,11),(33,NULL,4,2025,'M1','','2025-01-27','2025-02-02',5,12),(34,NULL,4,2025,'M1','','2025-01-27','2025-02-02',11,13),(35,NULL,4,2025,'M1','','2025-01-27','2025-02-02',11,14),(36,NULL,4,2025,'M1','','2025-01-27','2025-02-02',3,15),(37,NULL,4,2025,'M1','','2025-01-27','2025-02-02',11,16),(38,NULL,4,2025,'M1','','2025-01-27','2025-02-02',3,17),(39,NULL,4,2025,'M1','','2025-01-27','2025-02-02',4,18),(40,NULL,4,2025,'M1','','2025-01-27','2025-02-02',11,19),(41,NULL,4,2025,'M1','','2025-01-27','2025-02-02',11,20),(42,37,4,2025,'M1','','2025-01-27','2025-02-02',4,NULL),(43,38,4,2025,'M1','','2025-01-27','2025-02-02',4,NULL),(44,40,4,2025,'M1','','2025-01-27','2025-02-02',5,NULL),(45,41,4,2025,'M1','','2025-01-27','2025-02-02',3,NULL),(46,39,4,2025,'M1','','2025-01-27','2025-02-02',5,NULL);
/*!40000 ALTER TABLE `plan_tygodnia_v` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pojazdy`
--

DROP TABLE IF EXISTS `pojazdy`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pojazdy` (
  `idPojazdy` int NOT NULL AUTO_INCREMENT,
  `Nr_rejestracyjny` varchar(45) NOT NULL,
  `Marka` varchar(45) NOT NULL,
  `Uwagi` varchar(70) DEFAULT NULL,
  `Archiwum` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`idPojazdy`),
  UNIQUE KEY `Nr_rejestracyjny_UNIQUE` (`Nr_rejestracyjny`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pojazdy`
--

LOCK TABLES `pojazdy` WRITE;
/*!40000 ALTER TABLE `pojazdy` DISABLE KEYS */;
INSERT INTO `pojazdy` VALUES (1,'XYZ123','Toyota','Nowy samochód',1),(2,'ABC456','Ford','Używany samochód',1),(3,'BRL 642','VW transporter 5 os.','',0),(4,'KNS 0235T','VW transporter 3 os.','',0),(5,'RUM 546','Ford Transit 3os.','NCW',0),(6,'YGN 19L','Ford Transit 3os.','Pogab',0),(7,'DMJ 95T','Ford Transit 3os.','Pogab Tomek',0),(8,'RYR 350','Ford Transit 3os.','NCW',0),(9,'LDB 733','Ford Transit 5os.',NULL,0),(10,'RZH 46E','Ford Transit 3os.','NCW',0),(11,'PYH 74M','Ford Transit 3os.','',0),(12,'OCS 25E','Ford Transit 3os.','Pogab',0),(13,'KNS 7805J','Ford Transit 5os.',NULL,0),(14,'KNS 9388L','Volvo FH','',0),(15,'PTZ 981','VW transporter 3 os.','NCW',0),(16,'MPP 205','VW Caddy','',0),(17,'KNS 88463','VW transporter 3 os.','NCW',0),(18,'KNS 95816','VW transporter 6 os.',NULL,0),(19,'KNS 95817','VW transporter 6 os.',NULL,0),(20,'KR7 WU95','VW transporter 3 os.','PL',0);
/*!40000 ALTER TABLE `pojazdy` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pracownik`
--

DROP TABLE IF EXISTS `pracownik`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pracownik` (
  `idPracownik` int NOT NULL AUTO_INCREMENT,
  `Nazwa_uzytkownika` varchar(45) NOT NULL,
  `Haslo` varchar(255) NOT NULL,
  `Typ_konta` enum('Administrator','Kierownik','Pracownik','Biuro') NOT NULL,
  `Status_konta` enum('Aktywne','Nieaktywne') DEFAULT NULL,
  `Jezyk` enum('Polski') DEFAULT NULL,
  `FK_Dane_osobowe` int NOT NULL,
  `FK_Informacje_o_firmie` int NOT NULL,
  `Archiwum` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`idPracownik`,`FK_Dane_osobowe`,`FK_Informacje_o_firmie`),
  KEY `fk_Pracownik2_Dane osobowe_idx` (`FK_Dane_osobowe`),
  KEY `fk_Pracownik2_Informacje_o_firmie1_idx` (`FK_Informacje_o_firmie`),
  CONSTRAINT `fk_Pracownik2_Dane osobowe` FOREIGN KEY (`FK_Dane_osobowe`) REFERENCES `dane_osobowe` (`idDane_osobowe`) ON DELETE RESTRICT,
  CONSTRAINT `fk_Pracownik2_Informacje_o_firmie1` FOREIGN KEY (`FK_Informacje_o_firmie`) REFERENCES `informacje_o_firmie` (`idInformacje_o_firmie`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pracownik`
--

LOCK TABLES `pracownik` WRITE;
/*!40000 ALTER TABLE `pracownik` DISABLE KEYS */;
INSERT INTO `pracownik` VALUES (1,'jankowalski','password123','Administrator','Aktywne','Polski',1,1,1),(2,'annnowak','password456','Pracownik','Nieaktywne','Polski',2,2,1),(3,'twachala','$2a$10$MC1xZAJCCwoXtKodeRBeY.coClQ1.MTIyF9fKO6VOVrnylF1QiI4K','Administrator','Aktywne',NULL,3,3,0),(4,'Chełmecki Paweł','$2a$10$GZ3RIufkm.uWIu/LWPjXM.cg/iS7/P1I3FXAciA.7I.02xXqOLsVC','Administrator','Aktywne',NULL,4,4,0),(5,'Gołąb Łukasz','$2a$10$yYahRasvs1eZIy3ju1PkP.Z5WWobDpDrjY3j5V.r1ch8S2.ja5DYS','Pracownik','Aktywne',NULL,5,5,0),(6,'Łukasz Gołąb','$2a$10$.kyEvrf55HTgRQgv29a9YeK2nUj3amM670TqvlxRf72ZgcKo7N1Om','Pracownik','Aktywne',NULL,6,6,1),(7,'Chełmecki Józef','$2a$10$UlxXJeH.KC5nFvDT/0UJJO2hnt.cAsqxAeZSa0J1p8fc3ZAex/ncW','Pracownik','Aktywne',NULL,7,7,0),(8,'Dymowski Waldemar','$2a$10$FHTBxYkVBu7eTIeVygTmiu1MTV38wR3FLXPNG6XPFBDXn4ruNRluK','Pracownik','Aktywne',NULL,8,8,0),(9,'Prusak Krzysztof','$2a$10$MrgUPRB05N.GEztrtZ0jAuDNehKdO57el9mnEXKzLuAMMziHZGTIO','Pracownik','Aktywne',NULL,9,9,0),(10,'Kowalczyk Artur','$2a$10$bEWJucAppF2vnRcElO6Poey4TL8isr/egNF1ogKGGTqLhuX2wSa8i','Pracownik','Aktywne',NULL,10,10,0),(11,'Pajor Jarosław','$2a$10$/3uvWcQaOga14vm9uhDfFuYrDMfkPpZAIPJ28Y75ldb64cJvGwjsG','Pracownik','Aktywne',NULL,11,11,0),(12,'Kocoń Mirosław','$2a$10$cGhH4s1i9AF8laISbmcZme0er1zwiUYy2QawnWbame1PgGInnYRuy','Pracownik','Aktywne',NULL,12,12,0),(13,'Kołodziej Marek','$2a$10$1lDMA/Zq7n5KfYXX/bSl0uOaWIeFe3vl9oQCsdPCq36VdmiWWY2xu','Pracownik','Aktywne',NULL,13,13,0),(14,'Lupa Wojciech','$2a$10$ffFLGS6RbsKS6gGW9DiQPOkh8m75o3WQLJoTDc9aniFaicnPW.HO.','Pracownik','Aktywne',NULL,14,14,0),(15,'Janór Patryk','$2a$10$7cq05ZhnJAnjFy6KZoZj0eUra0fGcKvU3ouwpnE4MDjWCdpwdKQ12','Pracownik','Aktywne',NULL,15,15,0),(16,'Król Marek','$2a$10$MdE8ORVOfx41ZlzrY5y6wuQlJ7kAZkCwCsGXNeLZPSq57llDVzJ6a','Pracownik','Aktywne',NULL,16,16,0),(17,'Kozuch Michał','$2a$10$JhBLtRfNJU4h/fO.E5kVa.cFLCmegwuxFkg2fUFRFtpZpBrrDhX86','Pracownik','Aktywne',NULL,17,17,0),(18,'Wieczorek Krzysztof','$2a$10$8JbJvN45gpnxBYSnHlhdJOtDcDVGgz5w4OqSTw/CNEjNVKdV1Gqb2','Pracownik','Aktywne',NULL,18,18,0),(19,'Błoniarz Tomasz','$2a$10$dxliQC7nzJHaeLnCIqKhx.HdCAEVSGrIIoiinPvvOjJeUp1wkUY/G','Pracownik','Aktywne',NULL,19,19,0),(20,'Gołąb Piotr','$2a$10$IQZUPXpCBBo.wPMvVFzUa.s5IHLn932mQ0yMPLIXw.ij.yzDHFRHS','Pracownik','Aktywne',NULL,20,20,0),(21,'Pajor Adrian','$2a$10$wRLPPk7SrBl5.eKWes9csORYMaIaxipBeiOnzHvQEJplGr82JamAC','Pracownik','Aktywne',NULL,21,21,0),(22,'Malik Dariusz','$2a$10$9AEcBJI5DIKvbMCGirZnnuPVQsSIjjWBS./ugVM/g48txrAMt02t2','Pracownik','Aktywne',NULL,22,22,0),(23,'Zabrzeński Paweł','$2a$10$NfyIWjbpbdCrH5mK6rTzfet9gUxtysvRKIsb0XHuJ4Yem3SVPlZo.','Pracownik','Aktywne',NULL,23,23,0),(24,'Nowak Kazimierz','$2a$10$ocWCjASafVzq9FVcY.SdI.mzdXO84CVCNN3/DyWQ57tMv9MUNlG9W','Pracownik','Aktywne',NULL,24,24,0),(25,'Wójtowicz Paweł','$2a$10$cR.L1coFeXOH1e7.btuw9OCViSea48QtsdtDUnVSUT3JdKmcSDTJW','Pracownik','Aktywne',NULL,25,25,0),(26,'Hajduga Piotr','$2a$10$MVnkmImpEstyUtF3biLrLeifLbIE7V21jlFDy6JDT2lnYGxUa/FS2','Pracownik','Aktywne',NULL,26,26,0),(27,'Pawlikowski Dariusz','$2a$10$qQgLUkDeA7aXU9FnC982.OEB2nJRhKkqj281XgnzIdssSVhVzf5Xi','Pracownik','Aktywne',NULL,27,27,0),(28,'test','$2a$10$SPZE97xCtEfoDWB6tSZ9VukIrDRd.cmjrvNBJTKCTh9rcYVF926W2','Pracownik','Aktywne',NULL,28,28,1),(29,'test','$2a$10$b3bV8vz/583ZlU2Jexz7xePrwrIofzEuvYxIlDqvo1B/TUUEx6n2i','Pracownik','Aktywne',NULL,29,29,1),(30,'test','$2a$10$IxJKAaYps.HaoKoJLi74UepZ.c9BPZ4.z5RF8MnrECuYa04H10E8q','Pracownik','Aktywne',NULL,30,30,1),(31,'test','$2a$10$yU43HBFWUT49hXMr8p10o.xlkvd0u9Vex42qqECdarhUxjMsrAjJW','Pracownik','Aktywne',NULL,31,31,1),(32,'test','$2a$10$AR.sHlH76hbKLB6GXmkFPOxRixdAVuhtWRNiRQ/zYwVOm1SLONQKG','Pracownik','Aktywne',NULL,32,32,1),(33,'test','$2a$10$5NVT8jjH0ffRuzA80eYW4Ol3ykF954KR4f6Hu4eAs0an/ylSkZefO','Pracownik','Aktywne',NULL,33,33,1),(34,'test12','$2a$10$faUvaz7pnm8K/yxSF1iCdOaLX49RluAzOX/gHJQXS26GGwuo/KgWu','Pracownik','Aktywne',NULL,34,34,1),(35,'Kocoń Mirosław','$2a$10$wf4A1LzxzSXvZBSywI962ezhRQ8/eCaBmVuYTLcSRi0dmZjuD4hgm','Pracownik','Aktywne',NULL,35,35,1),(36,'tt','$2a$10$3mSKv3jZBp5fttPvhW0OieWqv3Nbm34Plor4i8Ou4srwdcHXhvACm','Pracownik','Aktywne',NULL,36,36,1),(37,'Zabrzeński Andrzej','$2a$10$O58/2a.xKht.Tfr2VIZwaOKnZyZrIZX9O.mjj1ZMOpyZ/kiZweeWy','Pracownik','Aktywne',NULL,37,37,0),(38,'Zabrzeński Krzysztof','$2a$10$ZtHFRJ3lhEDO9FeGXgaFIeCKJq3e5UZk/3ONjE1PljZk10L.qx3F6','Pracownik','Aktywne',NULL,38,38,0),(39,'Maciaś Tomasz','$2a$10$RStFSnsUMscdyeJ0VHjYFOdjUQZIoH5W3WEc.Ytx16zZ1f/qs1Q7q','Pracownik','Aktywne',NULL,39,39,0),(40,'Szymosz Wojciech','$2a$10$Cd1ejW9N0IxuIsLlHR70EemI77EUJGePtmZmR4/PO5r418MkKZIci','Pracownik','Aktywne',NULL,40,40,0),(41,'Lipina Szymon','$2a$10$UYq3ykX5t53llcth8WK5v.1mKtOJruMwGAtNMRZd0RYiT3hdeI/5u','Pracownik','Aktywne',NULL,41,41,0),(42,'Test Test','$2a$10$Zvhqh3KH3FV2b56YWnrAM.OfR7lk1XblWSuopyR1f4yp3FD10dRoe','Pracownik','Aktywne',NULL,42,42,0),(43,'Tylicki Małgorzata ','$2a$10$oudIsXorrD3W5s2ZCoFEsemLFb.t7UofJiDtKQGQ01ZHrAGJQbvc2','Biuro','Aktywne',NULL,43,43,0);
/*!40000 ALTER TABLE `pracownik` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `Pracownik_AFTER_INSERT` AFTER INSERT ON `pracownik` FOR EACH ROW BEGIN
    DECLARE aktualny_rok INT;
    DECLARE tydzien INT;
    DECLARE max_tydzien INT;
    DECLARE aktualny_tydzien INT;

    SET aktualny_rok = YEAR(CURDATE());
    SET aktualny_tydzien = WEEK(CURDATE(), 1);

    SET max_tydzien = IF(aktualny_rok % 4 = 0 AND (aktualny_rok % 100 != 0 OR aktualny_rok % 400 = 0), 53, 52); 

    SET tydzien = 1;

    WHILE tydzien <= max_tydzien DO
        INSERT INTO tydzien (Godziny_Tygodniowe, Status_tygodnia, tydzienRoku, Rok, Pracownik_idPracownik)
        VALUES (
            NULL,
            CASE 
                WHEN tydzien < aktualny_tydzien THEN 'Zamkniety'
                ELSE 'Otwarty'
            END,
            tydzien,
            aktualny_rok,
            NEW.idPracownik
        );
        
        SET tydzien = tydzien + 1;
    END WHILE;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `pracownik_has_ogloszenia`
--

DROP TABLE IF EXISTS `pracownik_has_ogloszenia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pracownik_has_ogloszenia` (
  `Pracownik_idPracownik` int NOT NULL,
  `Ogloszenia_idOgloszenia` int NOT NULL,
  `Przeczytane` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`Ogloszenia_idOgloszenia`,`Pracownik_idPracownik`),
  KEY `fk_Pracownik_has_Ogloszenia_Ogloszenia1_idx` (`Ogloszenia_idOgloszenia`),
  KEY `fk_Pracownik_has_Ogloszenia_Pracownik1_idx` (`Pracownik_idPracownik`),
  CONSTRAINT `fk_Pracownik_has_Ogloszenia_Ogloszenia1` FOREIGN KEY (`Ogloszenia_idOgloszenia`) REFERENCES `ogloszenia` (`idOgloszenia`),
  CONSTRAINT `fk_Pracownik_has_Ogloszenia_Pracownik1` FOREIGN KEY (`Pracownik_idPracownik`) REFERENCES `pracownik` (`idPracownik`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pracownik_has_ogloszenia`
--

LOCK TABLES `pracownik_has_ogloszenia` WRITE;
/*!40000 ALTER TABLE `pracownik_has_ogloszenia` DISABLE KEYS */;
/*!40000 ALTER TABLE `pracownik_has_ogloszenia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pracownik_ostrzezenia`
--

DROP TABLE IF EXISTS `pracownik_ostrzezenia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pracownik_ostrzezenia` (
  `idPracownik_ostrzezenia` int NOT NULL AUTO_INCREMENT,
  `data_ostrzezenia` date NOT NULL,
  `godziny_tygodniowe` int NOT NULL,
  `czy_zablokowany` tinyint DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `Pracownik_idPracownik` int NOT NULL,
  `Pracownik_FK_Dane_osobowe` int DEFAULT NULL,
  `Pracownik_FK_Informacje_o_firmie` int DEFAULT NULL,
  PRIMARY KEY (`idPracownik_ostrzezenia`),
  KEY `fk_Pracownik_ostrzezenia_Pracownik1_idx` (`Pracownik_idPracownik`,`Pracownik_FK_Dane_osobowe`,`Pracownik_FK_Informacje_o_firmie`),
  CONSTRAINT `fk_Pracownik_ostrzezenia_Pracownik1` FOREIGN KEY (`Pracownik_idPracownik`, `Pracownik_FK_Dane_osobowe`, `Pracownik_FK_Informacje_o_firmie`) REFERENCES `pracownik` (`idPracownik`, `FK_Dane_osobowe`, `FK_Informacje_o_firmie`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pracownik_ostrzezenia`
--

LOCK TABLES `pracownik_ostrzezenia` WRITE;
/*!40000 ALTER TABLE `pracownik_ostrzezenia` DISABLE KEYS */;
/*!40000 ALTER TABLE `pracownik_ostrzezenia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `projekty`
--

DROP TABLE IF EXISTS `projekty`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projekty` (
  `idProjekty` int NOT NULL AUTO_INCREMENT,
  `NazwaKod_Projektu` varchar(45) NOT NULL,
  `Status` varchar(45) DEFAULT 'Aktywny',
  `Ulica` varchar(45) DEFAULT NULL,
  `Miejscowosc` varchar(45) DEFAULT NULL,
  `Kod_pocztowy` varchar(45) DEFAULT NULL,
  `Kraj` varchar(45) DEFAULT NULL,
  `Archiwum` tinyint(1) NOT NULL DEFAULT '0',
  `Grupa_urlopowa_idGrupa_urlopowa` int NOT NULL,
  `Firma_idFirma` int NOT NULL,
  PRIMARY KEY (`idProjekty`,`Grupa_urlopowa_idGrupa_urlopowa`,`Firma_idFirma`),
  KEY `fk_Projekty_Grupa_urlopowa1_idx` (`Grupa_urlopowa_idGrupa_urlopowa`),
  KEY `fk_Projekty_Firma1_idx` (`Firma_idFirma`),
  CONSTRAINT `fk_Projekty_Firma1` FOREIGN KEY (`Firma_idFirma`) REFERENCES `firma` (`idFirma`),
  CONSTRAINT `fk_Projekty_Grupa_urlopowa1` FOREIGN KEY (`Grupa_urlopowa_idGrupa_urlopowa`) REFERENCES `grupa_urlopowa` (`idGrupa_urlopowa`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projekty`
--

LOCK TABLES `projekty` WRITE;
/*!40000 ALTER TABLE `projekty` DISABLE KEYS */;
INSERT INTO `projekty` VALUES (1,'PROJ001','Aktywny','Mokotowska 5','Warszawa','00-003','Polska',1,1,1),(2,'PROJ002','Zamkniety','Karmelicka 8','Kraków','00-004','Polska',1,1,1),(3,'P-8325','Aktywny','','','','',0,5,1),(4,'Standard 992','Aktywny','','','','',0,9,1),(5,'7364121-6530-43590 ( Jimmy Daniel )','Aktywny','','','','',0,4,1),(6,'7364121-6540-43590 ( Cristian )','Aktywny','','','','',0,4,1),(7,'7364122 Håkan GK övrigt Städ och provisorium ','Aktywny','','','','',0,4,1);
/*!40000 ALTER TABLE `projekty` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tydzien`
--

DROP TABLE IF EXISTS `tydzien`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tydzien` (
  `idTydzien` int NOT NULL AUTO_INCREMENT,
  `Godziny_Tygodniowe` varchar(45) DEFAULT NULL,
  `Status_tygodnia` enum('Otwarty','Zamkniety') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `tydzienRoku` int DEFAULT NULL,
  `Rok` int DEFAULT NULL,
  `Pracownik_idPracownik` int NOT NULL,
  PRIMARY KEY (`idTydzien`,`Pracownik_idPracownik`),
  KEY `fk_Tydzień_Pracownik1_idx` (`Pracownik_idPracownik`),
  CONSTRAINT `fk_Tydzień_Pracownik1` FOREIGN KEY (`Pracownik_idPracownik`) REFERENCES `pracownik` (`idPracownik`)
) ENGINE=InnoDB AUTO_INCREMENT=2237 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tydzien`
--

LOCK TABLES `tydzien` WRITE;
/*!40000 ALTER TABLE `tydzien` DISABLE KEYS */;
INSERT INTO `tydzien` VALUES (1,NULL,'Zamkniety',1,2025,1),(2,NULL,'Zamkniety',2,2025,1),(3,NULL,'Zamkniety',3,2025,1),(4,NULL,'Zamkniety',4,2025,1),(5,NULL,'Otwarty',5,2025,1),(6,NULL,'Otwarty',6,2025,1),(7,NULL,'Otwarty',7,2025,1),(8,NULL,'Otwarty',8,2025,1),(9,NULL,'Otwarty',9,2025,1),(10,NULL,'Otwarty',10,2025,1),(11,NULL,'Otwarty',11,2025,1),(12,NULL,'Otwarty',12,2025,1),(13,NULL,'Otwarty',13,2025,1),(14,NULL,'Otwarty',14,2025,1),(15,NULL,'Otwarty',15,2025,1),(16,NULL,'Otwarty',16,2025,1),(17,NULL,'Otwarty',17,2025,1),(18,NULL,'Otwarty',18,2025,1),(19,NULL,'Otwarty',19,2025,1),(20,NULL,'Otwarty',20,2025,1),(21,NULL,'Otwarty',21,2025,1),(22,NULL,'Otwarty',22,2025,1),(23,NULL,'Otwarty',23,2025,1),(24,NULL,'Otwarty',24,2025,1),(25,NULL,'Otwarty',25,2025,1),(26,NULL,'Otwarty',26,2025,1),(27,NULL,'Otwarty',27,2025,1),(28,NULL,'Otwarty',28,2025,1),(29,NULL,'Otwarty',29,2025,1),(30,NULL,'Otwarty',30,2025,1),(31,NULL,'Otwarty',31,2025,1),(32,NULL,'Otwarty',32,2025,1),(33,NULL,'Otwarty',33,2025,1),(34,NULL,'Otwarty',34,2025,1),(35,NULL,'Otwarty',35,2025,1),(36,NULL,'Otwarty',36,2025,1),(37,NULL,'Otwarty',37,2025,1),(38,NULL,'Otwarty',38,2025,1),(39,NULL,'Otwarty',39,2025,1),(40,NULL,'Otwarty',40,2025,1),(41,NULL,'Otwarty',41,2025,1),(42,NULL,'Otwarty',42,2025,1),(43,NULL,'Otwarty',43,2025,1),(44,NULL,'Otwarty',44,2025,1),(45,NULL,'Otwarty',45,2025,1),(46,NULL,'Otwarty',46,2025,1),(47,NULL,'Otwarty',47,2025,1),(48,NULL,'Otwarty',48,2025,1),(49,NULL,'Otwarty',49,2025,1),(50,NULL,'Otwarty',50,2025,1),(51,NULL,'Otwarty',51,2025,1),(52,NULL,'Otwarty',52,2025,1),(53,NULL,'Zamkniety',1,2025,2),(54,NULL,'Zamkniety',2,2025,2),(55,NULL,'Zamkniety',3,2025,2),(56,NULL,'Zamkniety',4,2025,2),(57,NULL,'Otwarty',5,2025,2),(58,NULL,'Otwarty',6,2025,2),(59,NULL,'Otwarty',7,2025,2),(60,NULL,'Otwarty',8,2025,2),(61,NULL,'Otwarty',9,2025,2),(62,NULL,'Otwarty',10,2025,2),(63,NULL,'Otwarty',11,2025,2),(64,NULL,'Otwarty',12,2025,2),(65,NULL,'Otwarty',13,2025,2),(66,NULL,'Otwarty',14,2025,2),(67,NULL,'Otwarty',15,2025,2),(68,NULL,'Otwarty',16,2025,2),(69,NULL,'Otwarty',17,2025,2),(70,NULL,'Otwarty',18,2025,2),(71,NULL,'Otwarty',19,2025,2),(72,NULL,'Otwarty',20,2025,2),(73,NULL,'Otwarty',21,2025,2),(74,NULL,'Otwarty',22,2025,2),(75,NULL,'Otwarty',23,2025,2),(76,NULL,'Otwarty',24,2025,2),(77,NULL,'Otwarty',25,2025,2),(78,NULL,'Otwarty',26,2025,2),(79,NULL,'Otwarty',27,2025,2),(80,NULL,'Otwarty',28,2025,2),(81,NULL,'Otwarty',29,2025,2),(82,NULL,'Otwarty',30,2025,2),(83,NULL,'Otwarty',31,2025,2),(84,NULL,'Otwarty',32,2025,2),(85,NULL,'Otwarty',33,2025,2),(86,NULL,'Otwarty',34,2025,2),(87,NULL,'Otwarty',35,2025,2),(88,NULL,'Otwarty',36,2025,2),(89,NULL,'Otwarty',37,2025,2),(90,NULL,'Otwarty',38,2025,2),(91,NULL,'Otwarty',39,2025,2),(92,NULL,'Otwarty',40,2025,2),(93,NULL,'Otwarty',41,2025,2),(94,NULL,'Otwarty',42,2025,2),(95,NULL,'Otwarty',43,2025,2),(96,NULL,'Otwarty',44,2025,2),(97,NULL,'Otwarty',45,2025,2),(98,NULL,'Otwarty',46,2025,2),(99,NULL,'Otwarty',47,2025,2),(100,NULL,'Otwarty',48,2025,2),(101,NULL,'Otwarty',49,2025,2),(102,NULL,'Otwarty',50,2025,2),(103,NULL,'Otwarty',51,2025,2),(104,NULL,'Otwarty',52,2025,2),(105,NULL,'Zamkniety',1,2025,3),(106,NULL,'Zamkniety',2,2025,3),(107,NULL,'Zamkniety',3,2025,3),(108,NULL,'Zamkniety',4,2025,3),(109,NULL,'Otwarty',5,2025,3),(110,NULL,'Otwarty',6,2025,3),(111,NULL,'Otwarty',7,2025,3),(112,NULL,'Otwarty',8,2025,3),(113,NULL,'Otwarty',9,2025,3),(114,NULL,'Otwarty',10,2025,3),(115,NULL,'Otwarty',11,2025,3),(116,NULL,'Otwarty',12,2025,3),(117,NULL,'Otwarty',13,2025,3),(118,NULL,'Otwarty',14,2025,3),(119,NULL,'Otwarty',15,2025,3),(120,NULL,'Otwarty',16,2025,3),(121,NULL,'Otwarty',17,2025,3),(122,NULL,'Otwarty',18,2025,3),(123,NULL,'Otwarty',19,2025,3),(124,NULL,'Otwarty',20,2025,3),(125,NULL,'Otwarty',21,2025,3),(126,NULL,'Otwarty',22,2025,3),(127,NULL,'Otwarty',23,2025,3),(128,NULL,'Otwarty',24,2025,3),(129,NULL,'Otwarty',25,2025,3),(130,NULL,'Otwarty',26,2025,3),(131,NULL,'Otwarty',27,2025,3),(132,NULL,'Otwarty',28,2025,3),(133,NULL,'Otwarty',29,2025,3),(134,NULL,'Otwarty',30,2025,3),(135,NULL,'Otwarty',31,2025,3),(136,NULL,'Otwarty',32,2025,3),(137,NULL,'Otwarty',33,2025,3),(138,NULL,'Otwarty',34,2025,3),(139,NULL,'Otwarty',35,2025,3),(140,NULL,'Otwarty',36,2025,3),(141,NULL,'Otwarty',37,2025,3),(142,NULL,'Otwarty',38,2025,3),(143,NULL,'Otwarty',39,2025,3),(144,NULL,'Otwarty',40,2025,3),(145,NULL,'Otwarty',41,2025,3),(146,NULL,'Otwarty',42,2025,3),(147,NULL,'Otwarty',43,2025,3),(148,NULL,'Otwarty',44,2025,3),(149,NULL,'Otwarty',45,2025,3),(150,NULL,'Otwarty',46,2025,3),(151,NULL,'Otwarty',47,2025,3),(152,NULL,'Otwarty',48,2025,3),(153,NULL,'Otwarty',49,2025,3),(154,NULL,'Otwarty',50,2025,3),(155,NULL,'Otwarty',51,2025,3),(156,NULL,'Otwarty',52,2025,3),(157,NULL,'Zamkniety',1,2025,4),(158,NULL,'Zamkniety',2,2025,4),(159,NULL,'Zamkniety',3,2025,4),(160,NULL,'Zamkniety',4,2025,4),(161,NULL,'Otwarty',5,2025,4),(162,NULL,'Otwarty',6,2025,4),(163,NULL,'Otwarty',7,2025,4),(164,NULL,'Otwarty',8,2025,4),(165,NULL,'Otwarty',9,2025,4),(166,NULL,'Otwarty',10,2025,4),(167,NULL,'Otwarty',11,2025,4),(168,NULL,'Otwarty',12,2025,4),(169,NULL,'Otwarty',13,2025,4),(170,NULL,'Otwarty',14,2025,4),(171,NULL,'Otwarty',15,2025,4),(172,NULL,'Otwarty',16,2025,4),(173,NULL,'Otwarty',17,2025,4),(174,NULL,'Otwarty',18,2025,4),(175,NULL,'Otwarty',19,2025,4),(176,NULL,'Otwarty',20,2025,4),(177,NULL,'Otwarty',21,2025,4),(178,NULL,'Otwarty',22,2025,4),(179,NULL,'Otwarty',23,2025,4),(180,NULL,'Otwarty',24,2025,4),(181,NULL,'Otwarty',25,2025,4),(182,NULL,'Otwarty',26,2025,4),(183,NULL,'Otwarty',27,2025,4),(184,NULL,'Otwarty',28,2025,4),(185,NULL,'Otwarty',29,2025,4),(186,NULL,'Otwarty',30,2025,4),(187,NULL,'Otwarty',31,2025,4),(188,NULL,'Otwarty',32,2025,4),(189,NULL,'Otwarty',33,2025,4),(190,NULL,'Otwarty',34,2025,4),(191,NULL,'Otwarty',35,2025,4),(192,NULL,'Otwarty',36,2025,4),(193,NULL,'Otwarty',37,2025,4),(194,NULL,'Otwarty',38,2025,4),(195,NULL,'Otwarty',39,2025,4),(196,NULL,'Otwarty',40,2025,4),(197,NULL,'Otwarty',41,2025,4),(198,NULL,'Otwarty',42,2025,4),(199,NULL,'Otwarty',43,2025,4),(200,NULL,'Otwarty',44,2025,4),(201,NULL,'Otwarty',45,2025,4),(202,NULL,'Otwarty',46,2025,4),(203,NULL,'Otwarty',47,2025,4),(204,NULL,'Otwarty',48,2025,4),(205,NULL,'Otwarty',49,2025,4),(206,NULL,'Otwarty',50,2025,4),(207,NULL,'Otwarty',51,2025,4),(208,NULL,'Otwarty',52,2025,4),(209,NULL,'Zamkniety',1,2025,5),(210,NULL,'Zamkniety',2,2025,5),(211,NULL,'Zamkniety',3,2025,5),(212,NULL,'Zamkniety',4,2025,5),(213,NULL,'Otwarty',5,2025,5),(214,NULL,'Otwarty',6,2025,5),(215,NULL,'Otwarty',7,2025,5),(216,NULL,'Otwarty',8,2025,5),(217,NULL,'Otwarty',9,2025,5),(218,NULL,'Otwarty',10,2025,5),(219,NULL,'Otwarty',11,2025,5),(220,NULL,'Otwarty',12,2025,5),(221,NULL,'Otwarty',13,2025,5),(222,NULL,'Otwarty',14,2025,5),(223,NULL,'Otwarty',15,2025,5),(224,NULL,'Otwarty',16,2025,5),(225,NULL,'Otwarty',17,2025,5),(226,NULL,'Otwarty',18,2025,5),(227,NULL,'Otwarty',19,2025,5),(228,NULL,'Otwarty',20,2025,5),(229,NULL,'Otwarty',21,2025,5),(230,NULL,'Otwarty',22,2025,5),(231,NULL,'Otwarty',23,2025,5),(232,NULL,'Otwarty',24,2025,5),(233,NULL,'Otwarty',25,2025,5),(234,NULL,'Otwarty',26,2025,5),(235,NULL,'Otwarty',27,2025,5),(236,NULL,'Otwarty',28,2025,5),(237,NULL,'Otwarty',29,2025,5),(238,NULL,'Otwarty',30,2025,5),(239,NULL,'Otwarty',31,2025,5),(240,NULL,'Otwarty',32,2025,5),(241,NULL,'Otwarty',33,2025,5),(242,NULL,'Otwarty',34,2025,5),(243,NULL,'Otwarty',35,2025,5),(244,NULL,'Otwarty',36,2025,5),(245,NULL,'Otwarty',37,2025,5),(246,NULL,'Otwarty',38,2025,5),(247,NULL,'Otwarty',39,2025,5),(248,NULL,'Otwarty',40,2025,5),(249,NULL,'Otwarty',41,2025,5),(250,NULL,'Otwarty',42,2025,5),(251,NULL,'Otwarty',43,2025,5),(252,NULL,'Otwarty',44,2025,5),(253,NULL,'Otwarty',45,2025,5),(254,NULL,'Otwarty',46,2025,5),(255,NULL,'Otwarty',47,2025,5),(256,NULL,'Otwarty',48,2025,5),(257,NULL,'Otwarty',49,2025,5),(258,NULL,'Otwarty',50,2025,5),(259,NULL,'Otwarty',51,2025,5),(260,NULL,'Otwarty',52,2025,5),(261,NULL,'Zamkniety',1,2025,6),(262,NULL,'Zamkniety',2,2025,6),(263,NULL,'Zamkniety',3,2025,6),(264,NULL,'Zamkniety',4,2025,6),(265,NULL,'Otwarty',5,2025,6),(266,NULL,'Otwarty',6,2025,6),(267,NULL,'Otwarty',7,2025,6),(268,NULL,'Otwarty',8,2025,6),(269,NULL,'Otwarty',9,2025,6),(270,NULL,'Otwarty',10,2025,6),(271,NULL,'Otwarty',11,2025,6),(272,NULL,'Otwarty',12,2025,6),(273,NULL,'Otwarty',13,2025,6),(274,NULL,'Otwarty',14,2025,6),(275,NULL,'Otwarty',15,2025,6),(276,NULL,'Otwarty',16,2025,6),(277,NULL,'Otwarty',17,2025,6),(278,NULL,'Otwarty',18,2025,6),(279,NULL,'Otwarty',19,2025,6),(280,NULL,'Otwarty',20,2025,6),(281,NULL,'Otwarty',21,2025,6),(282,NULL,'Otwarty',22,2025,6),(283,NULL,'Otwarty',23,2025,6),(284,NULL,'Otwarty',24,2025,6),(285,NULL,'Otwarty',25,2025,6),(286,NULL,'Otwarty',26,2025,6),(287,NULL,'Otwarty',27,2025,6),(288,NULL,'Otwarty',28,2025,6),(289,NULL,'Otwarty',29,2025,6),(290,NULL,'Otwarty',30,2025,6),(291,NULL,'Otwarty',31,2025,6),(292,NULL,'Otwarty',32,2025,6),(293,NULL,'Otwarty',33,2025,6),(294,NULL,'Otwarty',34,2025,6),(295,NULL,'Otwarty',35,2025,6),(296,NULL,'Otwarty',36,2025,6),(297,NULL,'Otwarty',37,2025,6),(298,NULL,'Otwarty',38,2025,6),(299,NULL,'Otwarty',39,2025,6),(300,NULL,'Otwarty',40,2025,6),(301,NULL,'Otwarty',41,2025,6),(302,NULL,'Otwarty',42,2025,6),(303,NULL,'Otwarty',43,2025,6),(304,NULL,'Otwarty',44,2025,6),(305,NULL,'Otwarty',45,2025,6),(306,NULL,'Otwarty',46,2025,6),(307,NULL,'Otwarty',47,2025,6),(308,NULL,'Otwarty',48,2025,6),(309,NULL,'Otwarty',49,2025,6),(310,NULL,'Otwarty',50,2025,6),(311,NULL,'Otwarty',51,2025,6),(312,NULL,'Otwarty',52,2025,6),(313,NULL,'Zamkniety',1,2025,7),(314,NULL,'Zamkniety',2,2025,7),(315,NULL,'Zamkniety',3,2025,7),(316,NULL,'Zamkniety',4,2025,7),(317,NULL,'Otwarty',5,2025,7),(318,NULL,'Otwarty',6,2025,7),(319,NULL,'Otwarty',7,2025,7),(320,NULL,'Otwarty',8,2025,7),(321,NULL,'Otwarty',9,2025,7),(322,NULL,'Otwarty',10,2025,7),(323,NULL,'Otwarty',11,2025,7),(324,NULL,'Otwarty',12,2025,7),(325,NULL,'Otwarty',13,2025,7),(326,NULL,'Otwarty',14,2025,7),(327,NULL,'Otwarty',15,2025,7),(328,NULL,'Otwarty',16,2025,7),(329,NULL,'Otwarty',17,2025,7),(330,NULL,'Otwarty',18,2025,7),(331,NULL,'Otwarty',19,2025,7),(332,NULL,'Otwarty',20,2025,7),(333,NULL,'Otwarty',21,2025,7),(334,NULL,'Otwarty',22,2025,7),(335,NULL,'Otwarty',23,2025,7),(336,NULL,'Otwarty',24,2025,7),(337,NULL,'Otwarty',25,2025,7),(338,NULL,'Otwarty',26,2025,7),(339,NULL,'Otwarty',27,2025,7),(340,NULL,'Otwarty',28,2025,7),(341,NULL,'Otwarty',29,2025,7),(342,NULL,'Otwarty',30,2025,7),(343,NULL,'Otwarty',31,2025,7),(344,NULL,'Otwarty',32,2025,7),(345,NULL,'Otwarty',33,2025,7),(346,NULL,'Otwarty',34,2025,7),(347,NULL,'Otwarty',35,2025,7),(348,NULL,'Otwarty',36,2025,7),(349,NULL,'Otwarty',37,2025,7),(350,NULL,'Otwarty',38,2025,7),(351,NULL,'Otwarty',39,2025,7),(352,NULL,'Otwarty',40,2025,7),(353,NULL,'Otwarty',41,2025,7),(354,NULL,'Otwarty',42,2025,7),(355,NULL,'Otwarty',43,2025,7),(356,NULL,'Otwarty',44,2025,7),(357,NULL,'Otwarty',45,2025,7),(358,NULL,'Otwarty',46,2025,7),(359,NULL,'Otwarty',47,2025,7),(360,NULL,'Otwarty',48,2025,7),(361,NULL,'Otwarty',49,2025,7),(362,NULL,'Otwarty',50,2025,7),(363,NULL,'Otwarty',51,2025,7),(364,NULL,'Otwarty',52,2025,7),(365,NULL,'Zamkniety',1,2025,8),(366,NULL,'Zamkniety',2,2025,8),(367,NULL,'Zamkniety',3,2025,8),(368,NULL,'Zamkniety',4,2025,8),(369,NULL,'Otwarty',5,2025,8),(370,NULL,'Otwarty',6,2025,8),(371,NULL,'Otwarty',7,2025,8),(372,NULL,'Otwarty',8,2025,8),(373,NULL,'Otwarty',9,2025,8),(374,NULL,'Otwarty',10,2025,8),(375,NULL,'Otwarty',11,2025,8),(376,NULL,'Otwarty',12,2025,8),(377,NULL,'Otwarty',13,2025,8),(378,NULL,'Otwarty',14,2025,8),(379,NULL,'Otwarty',15,2025,8),(380,NULL,'Otwarty',16,2025,8),(381,NULL,'Otwarty',17,2025,8),(382,NULL,'Otwarty',18,2025,8),(383,NULL,'Otwarty',19,2025,8),(384,NULL,'Otwarty',20,2025,8),(385,NULL,'Otwarty',21,2025,8),(386,NULL,'Otwarty',22,2025,8),(387,NULL,'Otwarty',23,2025,8),(388,NULL,'Otwarty',24,2025,8),(389,NULL,'Otwarty',25,2025,8),(390,NULL,'Otwarty',26,2025,8),(391,NULL,'Otwarty',27,2025,8),(392,NULL,'Otwarty',28,2025,8),(393,NULL,'Otwarty',29,2025,8),(394,NULL,'Otwarty',30,2025,8),(395,NULL,'Otwarty',31,2025,8),(396,NULL,'Otwarty',32,2025,8),(397,NULL,'Otwarty',33,2025,8),(398,NULL,'Otwarty',34,2025,8),(399,NULL,'Otwarty',35,2025,8),(400,NULL,'Otwarty',36,2025,8),(401,NULL,'Otwarty',37,2025,8),(402,NULL,'Otwarty',38,2025,8),(403,NULL,'Otwarty',39,2025,8),(404,NULL,'Otwarty',40,2025,8),(405,NULL,'Otwarty',41,2025,8),(406,NULL,'Otwarty',42,2025,8),(407,NULL,'Otwarty',43,2025,8),(408,NULL,'Otwarty',44,2025,8),(409,NULL,'Otwarty',45,2025,8),(410,NULL,'Otwarty',46,2025,8),(411,NULL,'Otwarty',47,2025,8),(412,NULL,'Otwarty',48,2025,8),(413,NULL,'Otwarty',49,2025,8),(414,NULL,'Otwarty',50,2025,8),(415,NULL,'Otwarty',51,2025,8),(416,NULL,'Otwarty',52,2025,8),(417,NULL,'Zamkniety',1,2025,9),(418,NULL,'Zamkniety',2,2025,9),(419,NULL,'Zamkniety',3,2025,9),(420,NULL,'Zamkniety',4,2025,9),(421,NULL,'Otwarty',5,2025,9),(422,NULL,'Otwarty',6,2025,9),(423,NULL,'Otwarty',7,2025,9),(424,NULL,'Otwarty',8,2025,9),(425,NULL,'Otwarty',9,2025,9),(426,NULL,'Otwarty',10,2025,9),(427,NULL,'Otwarty',11,2025,9),(428,NULL,'Otwarty',12,2025,9),(429,NULL,'Otwarty',13,2025,9),(430,NULL,'Otwarty',14,2025,9),(431,NULL,'Otwarty',15,2025,9),(432,NULL,'Otwarty',16,2025,9),(433,NULL,'Otwarty',17,2025,9),(434,NULL,'Otwarty',18,2025,9),(435,NULL,'Otwarty',19,2025,9),(436,NULL,'Otwarty',20,2025,9),(437,NULL,'Otwarty',21,2025,9),(438,NULL,'Otwarty',22,2025,9),(439,NULL,'Otwarty',23,2025,9),(440,NULL,'Otwarty',24,2025,9),(441,NULL,'Otwarty',25,2025,9),(442,NULL,'Otwarty',26,2025,9),(443,NULL,'Otwarty',27,2025,9),(444,NULL,'Otwarty',28,2025,9),(445,NULL,'Otwarty',29,2025,9),(446,NULL,'Otwarty',30,2025,9),(447,NULL,'Otwarty',31,2025,9),(448,NULL,'Otwarty',32,2025,9),(449,NULL,'Otwarty',33,2025,9),(450,NULL,'Otwarty',34,2025,9),(451,NULL,'Otwarty',35,2025,9),(452,NULL,'Otwarty',36,2025,9),(453,NULL,'Otwarty',37,2025,9),(454,NULL,'Otwarty',38,2025,9),(455,NULL,'Otwarty',39,2025,9),(456,NULL,'Otwarty',40,2025,9),(457,NULL,'Otwarty',41,2025,9),(458,NULL,'Otwarty',42,2025,9),(459,NULL,'Otwarty',43,2025,9),(460,NULL,'Otwarty',44,2025,9),(461,NULL,'Otwarty',45,2025,9),(462,NULL,'Otwarty',46,2025,9),(463,NULL,'Otwarty',47,2025,9),(464,NULL,'Otwarty',48,2025,9),(465,NULL,'Otwarty',49,2025,9),(466,NULL,'Otwarty',50,2025,9),(467,NULL,'Otwarty',51,2025,9),(468,NULL,'Otwarty',52,2025,9),(469,NULL,'Zamkniety',1,2025,10),(470,NULL,'Zamkniety',2,2025,10),(471,NULL,'Zamkniety',3,2025,10),(472,NULL,'Zamkniety',4,2025,10),(473,NULL,'Otwarty',5,2025,10),(474,NULL,'Otwarty',6,2025,10),(475,NULL,'Otwarty',7,2025,10),(476,NULL,'Otwarty',8,2025,10),(477,NULL,'Otwarty',9,2025,10),(478,NULL,'Otwarty',10,2025,10),(479,NULL,'Otwarty',11,2025,10),(480,NULL,'Otwarty',12,2025,10),(481,NULL,'Otwarty',13,2025,10),(482,NULL,'Otwarty',14,2025,10),(483,NULL,'Otwarty',15,2025,10),(484,NULL,'Otwarty',16,2025,10),(485,NULL,'Otwarty',17,2025,10),(486,NULL,'Otwarty',18,2025,10),(487,NULL,'Otwarty',19,2025,10),(488,NULL,'Otwarty',20,2025,10),(489,NULL,'Otwarty',21,2025,10),(490,NULL,'Otwarty',22,2025,10),(491,NULL,'Otwarty',23,2025,10),(492,NULL,'Otwarty',24,2025,10),(493,NULL,'Otwarty',25,2025,10),(494,NULL,'Otwarty',26,2025,10),(495,NULL,'Otwarty',27,2025,10),(496,NULL,'Otwarty',28,2025,10),(497,NULL,'Otwarty',29,2025,10),(498,NULL,'Otwarty',30,2025,10),(499,NULL,'Otwarty',31,2025,10),(500,NULL,'Otwarty',32,2025,10),(501,NULL,'Otwarty',33,2025,10),(502,NULL,'Otwarty',34,2025,10),(503,NULL,'Otwarty',35,2025,10),(504,NULL,'Otwarty',36,2025,10),(505,NULL,'Otwarty',37,2025,10),(506,NULL,'Otwarty',38,2025,10),(507,NULL,'Otwarty',39,2025,10),(508,NULL,'Otwarty',40,2025,10),(509,NULL,'Otwarty',41,2025,10),(510,NULL,'Otwarty',42,2025,10),(511,NULL,'Otwarty',43,2025,10),(512,NULL,'Otwarty',44,2025,10),(513,NULL,'Otwarty',45,2025,10),(514,NULL,'Otwarty',46,2025,10),(515,NULL,'Otwarty',47,2025,10),(516,NULL,'Otwarty',48,2025,10),(517,NULL,'Otwarty',49,2025,10),(518,NULL,'Otwarty',50,2025,10),(519,NULL,'Otwarty',51,2025,10),(520,NULL,'Otwarty',52,2025,10),(521,NULL,'Zamkniety',1,2025,11),(522,NULL,'Zamkniety',2,2025,11),(523,NULL,'Zamkniety',3,2025,11),(524,NULL,'Zamkniety',4,2025,11),(525,NULL,'Otwarty',5,2025,11),(526,NULL,'Otwarty',6,2025,11),(527,NULL,'Otwarty',7,2025,11),(528,NULL,'Otwarty',8,2025,11),(529,NULL,'Otwarty',9,2025,11),(530,NULL,'Otwarty',10,2025,11),(531,NULL,'Otwarty',11,2025,11),(532,NULL,'Otwarty',12,2025,11),(533,NULL,'Otwarty',13,2025,11),(534,NULL,'Otwarty',14,2025,11),(535,NULL,'Otwarty',15,2025,11),(536,NULL,'Otwarty',16,2025,11),(537,NULL,'Otwarty',17,2025,11),(538,NULL,'Otwarty',18,2025,11),(539,NULL,'Otwarty',19,2025,11),(540,NULL,'Otwarty',20,2025,11),(541,NULL,'Otwarty',21,2025,11),(542,NULL,'Otwarty',22,2025,11),(543,NULL,'Otwarty',23,2025,11),(544,NULL,'Otwarty',24,2025,11),(545,NULL,'Otwarty',25,2025,11),(546,NULL,'Otwarty',26,2025,11),(547,NULL,'Otwarty',27,2025,11),(548,NULL,'Otwarty',28,2025,11),(549,NULL,'Otwarty',29,2025,11),(550,NULL,'Otwarty',30,2025,11),(551,NULL,'Otwarty',31,2025,11),(552,NULL,'Otwarty',32,2025,11),(553,NULL,'Otwarty',33,2025,11),(554,NULL,'Otwarty',34,2025,11),(555,NULL,'Otwarty',35,2025,11),(556,NULL,'Otwarty',36,2025,11),(557,NULL,'Otwarty',37,2025,11),(558,NULL,'Otwarty',38,2025,11),(559,NULL,'Otwarty',39,2025,11),(560,NULL,'Otwarty',40,2025,11),(561,NULL,'Otwarty',41,2025,11),(562,NULL,'Otwarty',42,2025,11),(563,NULL,'Otwarty',43,2025,11),(564,NULL,'Otwarty',44,2025,11),(565,NULL,'Otwarty',45,2025,11),(566,NULL,'Otwarty',46,2025,11),(567,NULL,'Otwarty',47,2025,11),(568,NULL,'Otwarty',48,2025,11),(569,NULL,'Otwarty',49,2025,11),(570,NULL,'Otwarty',50,2025,11),(571,NULL,'Otwarty',51,2025,11),(572,NULL,'Otwarty',52,2025,11),(573,NULL,'Zamkniety',1,2025,12),(574,NULL,'Zamkniety',2,2025,12),(575,NULL,'Zamkniety',3,2025,12),(576,NULL,'Zamkniety',4,2025,12),(577,NULL,'Otwarty',5,2025,12),(578,NULL,'Otwarty',6,2025,12),(579,NULL,'Otwarty',7,2025,12),(580,NULL,'Otwarty',8,2025,12),(581,NULL,'Otwarty',9,2025,12),(582,NULL,'Otwarty',10,2025,12),(583,NULL,'Otwarty',11,2025,12),(584,NULL,'Otwarty',12,2025,12),(585,NULL,'Otwarty',13,2025,12),(586,NULL,'Otwarty',14,2025,12),(587,NULL,'Otwarty',15,2025,12),(588,NULL,'Otwarty',16,2025,12),(589,NULL,'Otwarty',17,2025,12),(590,NULL,'Otwarty',18,2025,12),(591,NULL,'Otwarty',19,2025,12),(592,NULL,'Otwarty',20,2025,12),(593,NULL,'Otwarty',21,2025,12),(594,NULL,'Otwarty',22,2025,12),(595,NULL,'Otwarty',23,2025,12),(596,NULL,'Otwarty',24,2025,12),(597,NULL,'Otwarty',25,2025,12),(598,NULL,'Otwarty',26,2025,12),(599,NULL,'Otwarty',27,2025,12),(600,NULL,'Otwarty',28,2025,12),(601,NULL,'Otwarty',29,2025,12),(602,NULL,'Otwarty',30,2025,12),(603,NULL,'Otwarty',31,2025,12),(604,NULL,'Otwarty',32,2025,12),(605,NULL,'Otwarty',33,2025,12),(606,NULL,'Otwarty',34,2025,12),(607,NULL,'Otwarty',35,2025,12),(608,NULL,'Otwarty',36,2025,12),(609,NULL,'Otwarty',37,2025,12),(610,NULL,'Otwarty',38,2025,12),(611,NULL,'Otwarty',39,2025,12),(612,NULL,'Otwarty',40,2025,12),(613,NULL,'Otwarty',41,2025,12),(614,NULL,'Otwarty',42,2025,12),(615,NULL,'Otwarty',43,2025,12),(616,NULL,'Otwarty',44,2025,12),(617,NULL,'Otwarty',45,2025,12),(618,NULL,'Otwarty',46,2025,12),(619,NULL,'Otwarty',47,2025,12),(620,NULL,'Otwarty',48,2025,12),(621,NULL,'Otwarty',49,2025,12),(622,NULL,'Otwarty',50,2025,12),(623,NULL,'Otwarty',51,2025,12),(624,NULL,'Otwarty',52,2025,12),(625,NULL,'Zamkniety',1,2025,13),(626,NULL,'Zamkniety',2,2025,13),(627,NULL,'Zamkniety',3,2025,13),(628,NULL,'Zamkniety',4,2025,13),(629,NULL,'Otwarty',5,2025,13),(630,NULL,'Otwarty',6,2025,13),(631,NULL,'Otwarty',7,2025,13),(632,NULL,'Otwarty',8,2025,13),(633,NULL,'Otwarty',9,2025,13),(634,NULL,'Otwarty',10,2025,13),(635,NULL,'Otwarty',11,2025,13),(636,NULL,'Otwarty',12,2025,13),(637,NULL,'Otwarty',13,2025,13),(638,NULL,'Otwarty',14,2025,13),(639,NULL,'Otwarty',15,2025,13),(640,NULL,'Otwarty',16,2025,13),(641,NULL,'Otwarty',17,2025,13),(642,NULL,'Otwarty',18,2025,13),(643,NULL,'Otwarty',19,2025,13),(644,NULL,'Otwarty',20,2025,13),(645,NULL,'Otwarty',21,2025,13),(646,NULL,'Otwarty',22,2025,13),(647,NULL,'Otwarty',23,2025,13),(648,NULL,'Otwarty',24,2025,13),(649,NULL,'Otwarty',25,2025,13),(650,NULL,'Otwarty',26,2025,13),(651,NULL,'Otwarty',27,2025,13),(652,NULL,'Otwarty',28,2025,13),(653,NULL,'Otwarty',29,2025,13),(654,NULL,'Otwarty',30,2025,13),(655,NULL,'Otwarty',31,2025,13),(656,NULL,'Otwarty',32,2025,13),(657,NULL,'Otwarty',33,2025,13),(658,NULL,'Otwarty',34,2025,13),(659,NULL,'Otwarty',35,2025,13),(660,NULL,'Otwarty',36,2025,13),(661,NULL,'Otwarty',37,2025,13),(662,NULL,'Otwarty',38,2025,13),(663,NULL,'Otwarty',39,2025,13),(664,NULL,'Otwarty',40,2025,13),(665,NULL,'Otwarty',41,2025,13),(666,NULL,'Otwarty',42,2025,13),(667,NULL,'Otwarty',43,2025,13),(668,NULL,'Otwarty',44,2025,13),(669,NULL,'Otwarty',45,2025,13),(670,NULL,'Otwarty',46,2025,13),(671,NULL,'Otwarty',47,2025,13),(672,NULL,'Otwarty',48,2025,13),(673,NULL,'Otwarty',49,2025,13),(674,NULL,'Otwarty',50,2025,13),(675,NULL,'Otwarty',51,2025,13),(676,NULL,'Otwarty',52,2025,13),(677,NULL,'Zamkniety',1,2025,14),(678,NULL,'Zamkniety',2,2025,14),(679,NULL,'Zamkniety',3,2025,14),(680,NULL,'Zamkniety',4,2025,14),(681,NULL,'Otwarty',5,2025,14),(682,NULL,'Otwarty',6,2025,14),(683,NULL,'Otwarty',7,2025,14),(684,NULL,'Otwarty',8,2025,14),(685,NULL,'Otwarty',9,2025,14),(686,NULL,'Otwarty',10,2025,14),(687,NULL,'Otwarty',11,2025,14),(688,NULL,'Otwarty',12,2025,14),(689,NULL,'Otwarty',13,2025,14),(690,NULL,'Otwarty',14,2025,14),(691,NULL,'Otwarty',15,2025,14),(692,NULL,'Otwarty',16,2025,14),(693,NULL,'Otwarty',17,2025,14),(694,NULL,'Otwarty',18,2025,14),(695,NULL,'Otwarty',19,2025,14),(696,NULL,'Otwarty',20,2025,14),(697,NULL,'Otwarty',21,2025,14),(698,NULL,'Otwarty',22,2025,14),(699,NULL,'Otwarty',23,2025,14),(700,NULL,'Otwarty',24,2025,14),(701,NULL,'Otwarty',25,2025,14),(702,NULL,'Otwarty',26,2025,14),(703,NULL,'Otwarty',27,2025,14),(704,NULL,'Otwarty',28,2025,14),(705,NULL,'Otwarty',29,2025,14),(706,NULL,'Otwarty',30,2025,14),(707,NULL,'Otwarty',31,2025,14),(708,NULL,'Otwarty',32,2025,14),(709,NULL,'Otwarty',33,2025,14),(710,NULL,'Otwarty',34,2025,14),(711,NULL,'Otwarty',35,2025,14),(712,NULL,'Otwarty',36,2025,14),(713,NULL,'Otwarty',37,2025,14),(714,NULL,'Otwarty',38,2025,14),(715,NULL,'Otwarty',39,2025,14),(716,NULL,'Otwarty',40,2025,14),(717,NULL,'Otwarty',41,2025,14),(718,NULL,'Otwarty',42,2025,14),(719,NULL,'Otwarty',43,2025,14),(720,NULL,'Otwarty',44,2025,14),(721,NULL,'Otwarty',45,2025,14),(722,NULL,'Otwarty',46,2025,14),(723,NULL,'Otwarty',47,2025,14),(724,NULL,'Otwarty',48,2025,14),(725,NULL,'Otwarty',49,2025,14),(726,NULL,'Otwarty',50,2025,14),(727,NULL,'Otwarty',51,2025,14),(728,NULL,'Otwarty',52,2025,14),(729,NULL,'Zamkniety',1,2025,15),(730,NULL,'Zamkniety',2,2025,15),(731,NULL,'Zamkniety',3,2025,15),(732,NULL,'Zamkniety',4,2025,15),(733,NULL,'Otwarty',5,2025,15),(734,NULL,'Otwarty',6,2025,15),(735,NULL,'Otwarty',7,2025,15),(736,NULL,'Otwarty',8,2025,15),(737,NULL,'Otwarty',9,2025,15),(738,NULL,'Otwarty',10,2025,15),(739,NULL,'Otwarty',11,2025,15),(740,NULL,'Otwarty',12,2025,15),(741,NULL,'Otwarty',13,2025,15),(742,NULL,'Otwarty',14,2025,15),(743,NULL,'Otwarty',15,2025,15),(744,NULL,'Otwarty',16,2025,15),(745,NULL,'Otwarty',17,2025,15),(746,NULL,'Otwarty',18,2025,15),(747,NULL,'Otwarty',19,2025,15),(748,NULL,'Otwarty',20,2025,15),(749,NULL,'Otwarty',21,2025,15),(750,NULL,'Otwarty',22,2025,15),(751,NULL,'Otwarty',23,2025,15),(752,NULL,'Otwarty',24,2025,15),(753,NULL,'Otwarty',25,2025,15),(754,NULL,'Otwarty',26,2025,15),(755,NULL,'Otwarty',27,2025,15),(756,NULL,'Otwarty',28,2025,15),(757,NULL,'Otwarty',29,2025,15),(758,NULL,'Otwarty',30,2025,15),(759,NULL,'Otwarty',31,2025,15),(760,NULL,'Otwarty',32,2025,15),(761,NULL,'Otwarty',33,2025,15),(762,NULL,'Otwarty',34,2025,15),(763,NULL,'Otwarty',35,2025,15),(764,NULL,'Otwarty',36,2025,15),(765,NULL,'Otwarty',37,2025,15),(766,NULL,'Otwarty',38,2025,15),(767,NULL,'Otwarty',39,2025,15),(768,NULL,'Otwarty',40,2025,15),(769,NULL,'Otwarty',41,2025,15),(770,NULL,'Otwarty',42,2025,15),(771,NULL,'Otwarty',43,2025,15),(772,NULL,'Otwarty',44,2025,15),(773,NULL,'Otwarty',45,2025,15),(774,NULL,'Otwarty',46,2025,15),(775,NULL,'Otwarty',47,2025,15),(776,NULL,'Otwarty',48,2025,15),(777,NULL,'Otwarty',49,2025,15),(778,NULL,'Otwarty',50,2025,15),(779,NULL,'Otwarty',51,2025,15),(780,NULL,'Otwarty',52,2025,15),(781,NULL,'Zamkniety',1,2025,16),(782,NULL,'Zamkniety',2,2025,16),(783,NULL,'Zamkniety',3,2025,16),(784,NULL,'Zamkniety',4,2025,16),(785,NULL,'Otwarty',5,2025,16),(786,NULL,'Otwarty',6,2025,16),(787,NULL,'Otwarty',7,2025,16),(788,NULL,'Otwarty',8,2025,16),(789,NULL,'Otwarty',9,2025,16),(790,NULL,'Otwarty',10,2025,16),(791,NULL,'Otwarty',11,2025,16),(792,NULL,'Otwarty',12,2025,16),(793,NULL,'Otwarty',13,2025,16),(794,NULL,'Otwarty',14,2025,16),(795,NULL,'Otwarty',15,2025,16),(796,NULL,'Otwarty',16,2025,16),(797,NULL,'Otwarty',17,2025,16),(798,NULL,'Otwarty',18,2025,16),(799,NULL,'Otwarty',19,2025,16),(800,NULL,'Otwarty',20,2025,16),(801,NULL,'Otwarty',21,2025,16),(802,NULL,'Otwarty',22,2025,16),(803,NULL,'Otwarty',23,2025,16),(804,NULL,'Otwarty',24,2025,16),(805,NULL,'Otwarty',25,2025,16),(806,NULL,'Otwarty',26,2025,16),(807,NULL,'Otwarty',27,2025,16),(808,NULL,'Otwarty',28,2025,16),(809,NULL,'Otwarty',29,2025,16),(810,NULL,'Otwarty',30,2025,16),(811,NULL,'Otwarty',31,2025,16),(812,NULL,'Otwarty',32,2025,16),(813,NULL,'Otwarty',33,2025,16),(814,NULL,'Otwarty',34,2025,16),(815,NULL,'Otwarty',35,2025,16),(816,NULL,'Otwarty',36,2025,16),(817,NULL,'Otwarty',37,2025,16),(818,NULL,'Otwarty',38,2025,16),(819,NULL,'Otwarty',39,2025,16),(820,NULL,'Otwarty',40,2025,16),(821,NULL,'Otwarty',41,2025,16),(822,NULL,'Otwarty',42,2025,16),(823,NULL,'Otwarty',43,2025,16),(824,NULL,'Otwarty',44,2025,16),(825,NULL,'Otwarty',45,2025,16),(826,NULL,'Otwarty',46,2025,16),(827,NULL,'Otwarty',47,2025,16),(828,NULL,'Otwarty',48,2025,16),(829,NULL,'Otwarty',49,2025,16),(830,NULL,'Otwarty',50,2025,16),(831,NULL,'Otwarty',51,2025,16),(832,NULL,'Otwarty',52,2025,16),(833,NULL,'Zamkniety',1,2025,17),(834,NULL,'Zamkniety',2,2025,17),(835,NULL,'Zamkniety',3,2025,17),(836,NULL,'Zamkniety',4,2025,17),(837,NULL,'Otwarty',5,2025,17),(838,NULL,'Otwarty',6,2025,17),(839,NULL,'Otwarty',7,2025,17),(840,NULL,'Otwarty',8,2025,17),(841,NULL,'Otwarty',9,2025,17),(842,NULL,'Otwarty',10,2025,17),(843,NULL,'Otwarty',11,2025,17),(844,NULL,'Otwarty',12,2025,17),(845,NULL,'Otwarty',13,2025,17),(846,NULL,'Otwarty',14,2025,17),(847,NULL,'Otwarty',15,2025,17),(848,NULL,'Otwarty',16,2025,17),(849,NULL,'Otwarty',17,2025,17),(850,NULL,'Otwarty',18,2025,17),(851,NULL,'Otwarty',19,2025,17),(852,NULL,'Otwarty',20,2025,17),(853,NULL,'Otwarty',21,2025,17),(854,NULL,'Otwarty',22,2025,17),(855,NULL,'Otwarty',23,2025,17),(856,NULL,'Otwarty',24,2025,17),(857,NULL,'Otwarty',25,2025,17),(858,NULL,'Otwarty',26,2025,17),(859,NULL,'Otwarty',27,2025,17),(860,NULL,'Otwarty',28,2025,17),(861,NULL,'Otwarty',29,2025,17),(862,NULL,'Otwarty',30,2025,17),(863,NULL,'Otwarty',31,2025,17),(864,NULL,'Otwarty',32,2025,17),(865,NULL,'Otwarty',33,2025,17),(866,NULL,'Otwarty',34,2025,17),(867,NULL,'Otwarty',35,2025,17),(868,NULL,'Otwarty',36,2025,17),(869,NULL,'Otwarty',37,2025,17),(870,NULL,'Otwarty',38,2025,17),(871,NULL,'Otwarty',39,2025,17),(872,NULL,'Otwarty',40,2025,17),(873,NULL,'Otwarty',41,2025,17),(874,NULL,'Otwarty',42,2025,17),(875,NULL,'Otwarty',43,2025,17),(876,NULL,'Otwarty',44,2025,17),(877,NULL,'Otwarty',45,2025,17),(878,NULL,'Otwarty',46,2025,17),(879,NULL,'Otwarty',47,2025,17),(880,NULL,'Otwarty',48,2025,17),(881,NULL,'Otwarty',49,2025,17),(882,NULL,'Otwarty',50,2025,17),(883,NULL,'Otwarty',51,2025,17),(884,NULL,'Otwarty',52,2025,17),(885,NULL,'Zamkniety',1,2025,18),(886,NULL,'Zamkniety',2,2025,18),(887,NULL,'Zamkniety',3,2025,18),(888,NULL,'Zamkniety',4,2025,18),(889,NULL,'Otwarty',5,2025,18),(890,NULL,'Otwarty',6,2025,18),(891,NULL,'Otwarty',7,2025,18),(892,NULL,'Otwarty',8,2025,18),(893,NULL,'Otwarty',9,2025,18),(894,NULL,'Otwarty',10,2025,18),(895,NULL,'Otwarty',11,2025,18),(896,NULL,'Otwarty',12,2025,18),(897,NULL,'Otwarty',13,2025,18),(898,NULL,'Otwarty',14,2025,18),(899,NULL,'Otwarty',15,2025,18),(900,NULL,'Otwarty',16,2025,18),(901,NULL,'Otwarty',17,2025,18),(902,NULL,'Otwarty',18,2025,18),(903,NULL,'Otwarty',19,2025,18),(904,NULL,'Otwarty',20,2025,18),(905,NULL,'Otwarty',21,2025,18),(906,NULL,'Otwarty',22,2025,18),(907,NULL,'Otwarty',23,2025,18),(908,NULL,'Otwarty',24,2025,18),(909,NULL,'Otwarty',25,2025,18),(910,NULL,'Otwarty',26,2025,18),(911,NULL,'Otwarty',27,2025,18),(912,NULL,'Otwarty',28,2025,18),(913,NULL,'Otwarty',29,2025,18),(914,NULL,'Otwarty',30,2025,18),(915,NULL,'Otwarty',31,2025,18),(916,NULL,'Otwarty',32,2025,18),(917,NULL,'Otwarty',33,2025,18),(918,NULL,'Otwarty',34,2025,18),(919,NULL,'Otwarty',35,2025,18),(920,NULL,'Otwarty',36,2025,18),(921,NULL,'Otwarty',37,2025,18),(922,NULL,'Otwarty',38,2025,18),(923,NULL,'Otwarty',39,2025,18),(924,NULL,'Otwarty',40,2025,18),(925,NULL,'Otwarty',41,2025,18),(926,NULL,'Otwarty',42,2025,18),(927,NULL,'Otwarty',43,2025,18),(928,NULL,'Otwarty',44,2025,18),(929,NULL,'Otwarty',45,2025,18),(930,NULL,'Otwarty',46,2025,18),(931,NULL,'Otwarty',47,2025,18),(932,NULL,'Otwarty',48,2025,18),(933,NULL,'Otwarty',49,2025,18),(934,NULL,'Otwarty',50,2025,18),(935,NULL,'Otwarty',51,2025,18),(936,NULL,'Otwarty',52,2025,18),(937,NULL,'Zamkniety',1,2025,19),(938,NULL,'Zamkniety',2,2025,19),(939,NULL,'Zamkniety',3,2025,19),(940,NULL,'Zamkniety',4,2025,19),(941,NULL,'Otwarty',5,2025,19),(942,NULL,'Otwarty',6,2025,19),(943,NULL,'Otwarty',7,2025,19),(944,NULL,'Otwarty',8,2025,19),(945,NULL,'Otwarty',9,2025,19),(946,NULL,'Otwarty',10,2025,19),(947,NULL,'Otwarty',11,2025,19),(948,NULL,'Otwarty',12,2025,19),(949,NULL,'Otwarty',13,2025,19),(950,NULL,'Otwarty',14,2025,19),(951,NULL,'Otwarty',15,2025,19),(952,NULL,'Otwarty',16,2025,19),(953,NULL,'Otwarty',17,2025,19),(954,NULL,'Otwarty',18,2025,19),(955,NULL,'Otwarty',19,2025,19),(956,NULL,'Otwarty',20,2025,19),(957,NULL,'Otwarty',21,2025,19),(958,NULL,'Otwarty',22,2025,19),(959,NULL,'Otwarty',23,2025,19),(960,NULL,'Otwarty',24,2025,19),(961,NULL,'Otwarty',25,2025,19),(962,NULL,'Otwarty',26,2025,19),(963,NULL,'Otwarty',27,2025,19),(964,NULL,'Otwarty',28,2025,19),(965,NULL,'Otwarty',29,2025,19),(966,NULL,'Otwarty',30,2025,19),(967,NULL,'Otwarty',31,2025,19),(968,NULL,'Otwarty',32,2025,19),(969,NULL,'Otwarty',33,2025,19),(970,NULL,'Otwarty',34,2025,19),(971,NULL,'Otwarty',35,2025,19),(972,NULL,'Otwarty',36,2025,19),(973,NULL,'Otwarty',37,2025,19),(974,NULL,'Otwarty',38,2025,19),(975,NULL,'Otwarty',39,2025,19),(976,NULL,'Otwarty',40,2025,19),(977,NULL,'Otwarty',41,2025,19),(978,NULL,'Otwarty',42,2025,19),(979,NULL,'Otwarty',43,2025,19),(980,NULL,'Otwarty',44,2025,19),(981,NULL,'Otwarty',45,2025,19),(982,NULL,'Otwarty',46,2025,19),(983,NULL,'Otwarty',47,2025,19),(984,NULL,'Otwarty',48,2025,19),(985,NULL,'Otwarty',49,2025,19),(986,NULL,'Otwarty',50,2025,19),(987,NULL,'Otwarty',51,2025,19),(988,NULL,'Otwarty',52,2025,19),(989,NULL,'Zamkniety',1,2025,20),(990,NULL,'Zamkniety',2,2025,20),(991,NULL,'Zamkniety',3,2025,20),(992,NULL,'Zamkniety',4,2025,20),(993,NULL,'Otwarty',5,2025,20),(994,NULL,'Otwarty',6,2025,20),(995,NULL,'Otwarty',7,2025,20),(996,NULL,'Otwarty',8,2025,20),(997,NULL,'Otwarty',9,2025,20),(998,NULL,'Otwarty',10,2025,20),(999,NULL,'Otwarty',11,2025,20),(1000,NULL,'Otwarty',12,2025,20),(1001,NULL,'Otwarty',13,2025,20),(1002,NULL,'Otwarty',14,2025,20),(1003,NULL,'Otwarty',15,2025,20),(1004,NULL,'Otwarty',16,2025,20),(1005,NULL,'Otwarty',17,2025,20),(1006,NULL,'Otwarty',18,2025,20),(1007,NULL,'Otwarty',19,2025,20),(1008,NULL,'Otwarty',20,2025,20),(1009,NULL,'Otwarty',21,2025,20),(1010,NULL,'Otwarty',22,2025,20),(1011,NULL,'Otwarty',23,2025,20),(1012,NULL,'Otwarty',24,2025,20),(1013,NULL,'Otwarty',25,2025,20),(1014,NULL,'Otwarty',26,2025,20),(1015,NULL,'Otwarty',27,2025,20),(1016,NULL,'Otwarty',28,2025,20),(1017,NULL,'Otwarty',29,2025,20),(1018,NULL,'Otwarty',30,2025,20),(1019,NULL,'Otwarty',31,2025,20),(1020,NULL,'Otwarty',32,2025,20),(1021,NULL,'Otwarty',33,2025,20),(1022,NULL,'Otwarty',34,2025,20),(1023,NULL,'Otwarty',35,2025,20),(1024,NULL,'Otwarty',36,2025,20),(1025,NULL,'Otwarty',37,2025,20),(1026,NULL,'Otwarty',38,2025,20),(1027,NULL,'Otwarty',39,2025,20),(1028,NULL,'Otwarty',40,2025,20),(1029,NULL,'Otwarty',41,2025,20),(1030,NULL,'Otwarty',42,2025,20),(1031,NULL,'Otwarty',43,2025,20),(1032,NULL,'Otwarty',44,2025,20),(1033,NULL,'Otwarty',45,2025,20),(1034,NULL,'Otwarty',46,2025,20),(1035,NULL,'Otwarty',47,2025,20),(1036,NULL,'Otwarty',48,2025,20),(1037,NULL,'Otwarty',49,2025,20),(1038,NULL,'Otwarty',50,2025,20),(1039,NULL,'Otwarty',51,2025,20),(1040,NULL,'Otwarty',52,2025,20),(1041,NULL,'Zamkniety',1,2025,21),(1042,NULL,'Zamkniety',2,2025,21),(1043,NULL,'Zamkniety',3,2025,21),(1044,NULL,'Zamkniety',4,2025,21),(1045,NULL,'Otwarty',5,2025,21),(1046,NULL,'Otwarty',6,2025,21),(1047,NULL,'Otwarty',7,2025,21),(1048,NULL,'Otwarty',8,2025,21),(1049,NULL,'Otwarty',9,2025,21),(1050,NULL,'Otwarty',10,2025,21),(1051,NULL,'Otwarty',11,2025,21),(1052,NULL,'Otwarty',12,2025,21),(1053,NULL,'Otwarty',13,2025,21),(1054,NULL,'Otwarty',14,2025,21),(1055,NULL,'Otwarty',15,2025,21),(1056,NULL,'Otwarty',16,2025,21),(1057,NULL,'Otwarty',17,2025,21),(1058,NULL,'Otwarty',18,2025,21),(1059,NULL,'Otwarty',19,2025,21),(1060,NULL,'Otwarty',20,2025,21),(1061,NULL,'Otwarty',21,2025,21),(1062,NULL,'Otwarty',22,2025,21),(1063,NULL,'Otwarty',23,2025,21),(1064,NULL,'Otwarty',24,2025,21),(1065,NULL,'Otwarty',25,2025,21),(1066,NULL,'Otwarty',26,2025,21),(1067,NULL,'Otwarty',27,2025,21),(1068,NULL,'Otwarty',28,2025,21),(1069,NULL,'Otwarty',29,2025,21),(1070,NULL,'Otwarty',30,2025,21),(1071,NULL,'Otwarty',31,2025,21),(1072,NULL,'Otwarty',32,2025,21),(1073,NULL,'Otwarty',33,2025,21),(1074,NULL,'Otwarty',34,2025,21),(1075,NULL,'Otwarty',35,2025,21),(1076,NULL,'Otwarty',36,2025,21),(1077,NULL,'Otwarty',37,2025,21),(1078,NULL,'Otwarty',38,2025,21),(1079,NULL,'Otwarty',39,2025,21),(1080,NULL,'Otwarty',40,2025,21),(1081,NULL,'Otwarty',41,2025,21),(1082,NULL,'Otwarty',42,2025,21),(1083,NULL,'Otwarty',43,2025,21),(1084,NULL,'Otwarty',44,2025,21),(1085,NULL,'Otwarty',45,2025,21),(1086,NULL,'Otwarty',46,2025,21),(1087,NULL,'Otwarty',47,2025,21),(1088,NULL,'Otwarty',48,2025,21),(1089,NULL,'Otwarty',49,2025,21),(1090,NULL,'Otwarty',50,2025,21),(1091,NULL,'Otwarty',51,2025,21),(1092,NULL,'Otwarty',52,2025,21),(1093,NULL,'Zamkniety',1,2025,22),(1094,NULL,'Zamkniety',2,2025,22),(1095,NULL,'Zamkniety',3,2025,22),(1096,NULL,'Zamkniety',4,2025,22),(1097,NULL,'Otwarty',5,2025,22),(1098,NULL,'Otwarty',6,2025,22),(1099,NULL,'Otwarty',7,2025,22),(1100,NULL,'Otwarty',8,2025,22),(1101,NULL,'Otwarty',9,2025,22),(1102,NULL,'Otwarty',10,2025,22),(1103,NULL,'Otwarty',11,2025,22),(1104,NULL,'Otwarty',12,2025,22),(1105,NULL,'Otwarty',13,2025,22),(1106,NULL,'Otwarty',14,2025,22),(1107,NULL,'Otwarty',15,2025,22),(1108,NULL,'Otwarty',16,2025,22),(1109,NULL,'Otwarty',17,2025,22),(1110,NULL,'Otwarty',18,2025,22),(1111,NULL,'Otwarty',19,2025,22),(1112,NULL,'Otwarty',20,2025,22),(1113,NULL,'Otwarty',21,2025,22),(1114,NULL,'Otwarty',22,2025,22),(1115,NULL,'Otwarty',23,2025,22),(1116,NULL,'Otwarty',24,2025,22),(1117,NULL,'Otwarty',25,2025,22),(1118,NULL,'Otwarty',26,2025,22),(1119,NULL,'Otwarty',27,2025,22),(1120,NULL,'Otwarty',28,2025,22),(1121,NULL,'Otwarty',29,2025,22),(1122,NULL,'Otwarty',30,2025,22),(1123,NULL,'Otwarty',31,2025,22),(1124,NULL,'Otwarty',32,2025,22),(1125,NULL,'Otwarty',33,2025,22),(1126,NULL,'Otwarty',34,2025,22),(1127,NULL,'Otwarty',35,2025,22),(1128,NULL,'Otwarty',36,2025,22),(1129,NULL,'Otwarty',37,2025,22),(1130,NULL,'Otwarty',38,2025,22),(1131,NULL,'Otwarty',39,2025,22),(1132,NULL,'Otwarty',40,2025,22),(1133,NULL,'Otwarty',41,2025,22),(1134,NULL,'Otwarty',42,2025,22),(1135,NULL,'Otwarty',43,2025,22),(1136,NULL,'Otwarty',44,2025,22),(1137,NULL,'Otwarty',45,2025,22),(1138,NULL,'Otwarty',46,2025,22),(1139,NULL,'Otwarty',47,2025,22),(1140,NULL,'Otwarty',48,2025,22),(1141,NULL,'Otwarty',49,2025,22),(1142,NULL,'Otwarty',50,2025,22),(1143,NULL,'Otwarty',51,2025,22),(1144,NULL,'Otwarty',52,2025,22),(1145,NULL,'Zamkniety',1,2025,23),(1146,NULL,'Zamkniety',2,2025,23),(1147,NULL,'Zamkniety',3,2025,23),(1148,NULL,'Zamkniety',4,2025,23),(1149,NULL,'Otwarty',5,2025,23),(1150,NULL,'Otwarty',6,2025,23),(1151,NULL,'Otwarty',7,2025,23),(1152,NULL,'Otwarty',8,2025,23),(1153,NULL,'Otwarty',9,2025,23),(1154,NULL,'Otwarty',10,2025,23),(1155,NULL,'Otwarty',11,2025,23),(1156,NULL,'Otwarty',12,2025,23),(1157,NULL,'Otwarty',13,2025,23),(1158,NULL,'Otwarty',14,2025,23),(1159,NULL,'Otwarty',15,2025,23),(1160,NULL,'Otwarty',16,2025,23),(1161,NULL,'Otwarty',17,2025,23),(1162,NULL,'Otwarty',18,2025,23),(1163,NULL,'Otwarty',19,2025,23),(1164,NULL,'Otwarty',20,2025,23),(1165,NULL,'Otwarty',21,2025,23),(1166,NULL,'Otwarty',22,2025,23),(1167,NULL,'Otwarty',23,2025,23),(1168,NULL,'Otwarty',24,2025,23),(1169,NULL,'Otwarty',25,2025,23),(1170,NULL,'Otwarty',26,2025,23),(1171,NULL,'Otwarty',27,2025,23),(1172,NULL,'Otwarty',28,2025,23),(1173,NULL,'Otwarty',29,2025,23),(1174,NULL,'Otwarty',30,2025,23),(1175,NULL,'Otwarty',31,2025,23),(1176,NULL,'Otwarty',32,2025,23),(1177,NULL,'Otwarty',33,2025,23),(1178,NULL,'Otwarty',34,2025,23),(1179,NULL,'Otwarty',35,2025,23),(1180,NULL,'Otwarty',36,2025,23),(1181,NULL,'Otwarty',37,2025,23),(1182,NULL,'Otwarty',38,2025,23),(1183,NULL,'Otwarty',39,2025,23),(1184,NULL,'Otwarty',40,2025,23),(1185,NULL,'Otwarty',41,2025,23),(1186,NULL,'Otwarty',42,2025,23),(1187,NULL,'Otwarty',43,2025,23),(1188,NULL,'Otwarty',44,2025,23),(1189,NULL,'Otwarty',45,2025,23),(1190,NULL,'Otwarty',46,2025,23),(1191,NULL,'Otwarty',47,2025,23),(1192,NULL,'Otwarty',48,2025,23),(1193,NULL,'Otwarty',49,2025,23),(1194,NULL,'Otwarty',50,2025,23),(1195,NULL,'Otwarty',51,2025,23),(1196,NULL,'Otwarty',52,2025,23),(1197,NULL,'Zamkniety',1,2025,24),(1198,NULL,'Zamkniety',2,2025,24),(1199,NULL,'Zamkniety',3,2025,24),(1200,NULL,'Zamkniety',4,2025,24),(1201,NULL,'Otwarty',5,2025,24),(1202,NULL,'Otwarty',6,2025,24),(1203,NULL,'Otwarty',7,2025,24),(1204,NULL,'Otwarty',8,2025,24),(1205,NULL,'Otwarty',9,2025,24),(1206,NULL,'Otwarty',10,2025,24),(1207,NULL,'Otwarty',11,2025,24),(1208,NULL,'Otwarty',12,2025,24),(1209,NULL,'Otwarty',13,2025,24),(1210,NULL,'Otwarty',14,2025,24),(1211,NULL,'Otwarty',15,2025,24),(1212,NULL,'Otwarty',16,2025,24),(1213,NULL,'Otwarty',17,2025,24),(1214,NULL,'Otwarty',18,2025,24),(1215,NULL,'Otwarty',19,2025,24),(1216,NULL,'Otwarty',20,2025,24),(1217,NULL,'Otwarty',21,2025,24),(1218,NULL,'Otwarty',22,2025,24),(1219,NULL,'Otwarty',23,2025,24),(1220,NULL,'Otwarty',24,2025,24),(1221,NULL,'Otwarty',25,2025,24),(1222,NULL,'Otwarty',26,2025,24),(1223,NULL,'Otwarty',27,2025,24),(1224,NULL,'Otwarty',28,2025,24),(1225,NULL,'Otwarty',29,2025,24),(1226,NULL,'Otwarty',30,2025,24),(1227,NULL,'Otwarty',31,2025,24),(1228,NULL,'Otwarty',32,2025,24),(1229,NULL,'Otwarty',33,2025,24),(1230,NULL,'Otwarty',34,2025,24),(1231,NULL,'Otwarty',35,2025,24),(1232,NULL,'Otwarty',36,2025,24),(1233,NULL,'Otwarty',37,2025,24),(1234,NULL,'Otwarty',38,2025,24),(1235,NULL,'Otwarty',39,2025,24),(1236,NULL,'Otwarty',40,2025,24),(1237,NULL,'Otwarty',41,2025,24),(1238,NULL,'Otwarty',42,2025,24),(1239,NULL,'Otwarty',43,2025,24),(1240,NULL,'Otwarty',44,2025,24),(1241,NULL,'Otwarty',45,2025,24),(1242,NULL,'Otwarty',46,2025,24),(1243,NULL,'Otwarty',47,2025,24),(1244,NULL,'Otwarty',48,2025,24),(1245,NULL,'Otwarty',49,2025,24),(1246,NULL,'Otwarty',50,2025,24),(1247,NULL,'Otwarty',51,2025,24),(1248,NULL,'Otwarty',52,2025,24),(1249,NULL,'Zamkniety',1,2025,25),(1250,NULL,'Zamkniety',2,2025,25),(1251,NULL,'Zamkniety',3,2025,25),(1252,NULL,'Zamkniety',4,2025,25),(1253,NULL,'Otwarty',5,2025,25),(1254,NULL,'Otwarty',6,2025,25),(1255,NULL,'Otwarty',7,2025,25),(1256,NULL,'Otwarty',8,2025,25),(1257,NULL,'Otwarty',9,2025,25),(1258,NULL,'Otwarty',10,2025,25),(1259,NULL,'Otwarty',11,2025,25),(1260,NULL,'Otwarty',12,2025,25),(1261,NULL,'Otwarty',13,2025,25),(1262,NULL,'Otwarty',14,2025,25),(1263,NULL,'Otwarty',15,2025,25),(1264,NULL,'Otwarty',16,2025,25),(1265,NULL,'Otwarty',17,2025,25),(1266,NULL,'Otwarty',18,2025,25),(1267,NULL,'Otwarty',19,2025,25),(1268,NULL,'Otwarty',20,2025,25),(1269,NULL,'Otwarty',21,2025,25),(1270,NULL,'Otwarty',22,2025,25),(1271,NULL,'Otwarty',23,2025,25),(1272,NULL,'Otwarty',24,2025,25),(1273,NULL,'Otwarty',25,2025,25),(1274,NULL,'Otwarty',26,2025,25),(1275,NULL,'Otwarty',27,2025,25),(1276,NULL,'Otwarty',28,2025,25),(1277,NULL,'Otwarty',29,2025,25),(1278,NULL,'Otwarty',30,2025,25),(1279,NULL,'Otwarty',31,2025,25),(1280,NULL,'Otwarty',32,2025,25),(1281,NULL,'Otwarty',33,2025,25),(1282,NULL,'Otwarty',34,2025,25),(1283,NULL,'Otwarty',35,2025,25),(1284,NULL,'Otwarty',36,2025,25),(1285,NULL,'Otwarty',37,2025,25),(1286,NULL,'Otwarty',38,2025,25),(1287,NULL,'Otwarty',39,2025,25),(1288,NULL,'Otwarty',40,2025,25),(1289,NULL,'Otwarty',41,2025,25),(1290,NULL,'Otwarty',42,2025,25),(1291,NULL,'Otwarty',43,2025,25),(1292,NULL,'Otwarty',44,2025,25),(1293,NULL,'Otwarty',45,2025,25),(1294,NULL,'Otwarty',46,2025,25),(1295,NULL,'Otwarty',47,2025,25),(1296,NULL,'Otwarty',48,2025,25),(1297,NULL,'Otwarty',49,2025,25),(1298,NULL,'Otwarty',50,2025,25),(1299,NULL,'Otwarty',51,2025,25),(1300,NULL,'Otwarty',52,2025,25),(1301,NULL,'Zamkniety',1,2025,26),(1302,NULL,'Zamkniety',2,2025,26),(1303,NULL,'Zamkniety',3,2025,26),(1304,NULL,'Zamkniety',4,2025,26),(1305,NULL,'Otwarty',5,2025,26),(1306,NULL,'Otwarty',6,2025,26),(1307,NULL,'Otwarty',7,2025,26),(1308,NULL,'Otwarty',8,2025,26),(1309,NULL,'Otwarty',9,2025,26),(1310,NULL,'Otwarty',10,2025,26),(1311,NULL,'Otwarty',11,2025,26),(1312,NULL,'Otwarty',12,2025,26),(1313,NULL,'Otwarty',13,2025,26),(1314,NULL,'Otwarty',14,2025,26),(1315,NULL,'Otwarty',15,2025,26),(1316,NULL,'Otwarty',16,2025,26),(1317,NULL,'Otwarty',17,2025,26),(1318,NULL,'Otwarty',18,2025,26),(1319,NULL,'Otwarty',19,2025,26),(1320,NULL,'Otwarty',20,2025,26),(1321,NULL,'Otwarty',21,2025,26),(1322,NULL,'Otwarty',22,2025,26),(1323,NULL,'Otwarty',23,2025,26),(1324,NULL,'Otwarty',24,2025,26),(1325,NULL,'Otwarty',25,2025,26),(1326,NULL,'Otwarty',26,2025,26),(1327,NULL,'Otwarty',27,2025,26),(1328,NULL,'Otwarty',28,2025,26),(1329,NULL,'Otwarty',29,2025,26),(1330,NULL,'Otwarty',30,2025,26),(1331,NULL,'Otwarty',31,2025,26),(1332,NULL,'Otwarty',32,2025,26),(1333,NULL,'Otwarty',33,2025,26),(1334,NULL,'Otwarty',34,2025,26),(1335,NULL,'Otwarty',35,2025,26),(1336,NULL,'Otwarty',36,2025,26),(1337,NULL,'Otwarty',37,2025,26),(1338,NULL,'Otwarty',38,2025,26),(1339,NULL,'Otwarty',39,2025,26),(1340,NULL,'Otwarty',40,2025,26),(1341,NULL,'Otwarty',41,2025,26),(1342,NULL,'Otwarty',42,2025,26),(1343,NULL,'Otwarty',43,2025,26),(1344,NULL,'Otwarty',44,2025,26),(1345,NULL,'Otwarty',45,2025,26),(1346,NULL,'Otwarty',46,2025,26),(1347,NULL,'Otwarty',47,2025,26),(1348,NULL,'Otwarty',48,2025,26),(1349,NULL,'Otwarty',49,2025,26),(1350,NULL,'Otwarty',50,2025,26),(1351,NULL,'Otwarty',51,2025,26),(1352,NULL,'Otwarty',52,2025,26),(1353,NULL,'Zamkniety',1,2025,27),(1354,NULL,'Zamkniety',2,2025,27),(1355,NULL,'Zamkniety',3,2025,27),(1356,NULL,'Zamkniety',4,2025,27),(1357,NULL,'Otwarty',5,2025,27),(1358,NULL,'Otwarty',6,2025,27),(1359,NULL,'Otwarty',7,2025,27),(1360,NULL,'Otwarty',8,2025,27),(1361,NULL,'Otwarty',9,2025,27),(1362,NULL,'Otwarty',10,2025,27),(1363,NULL,'Otwarty',11,2025,27),(1364,NULL,'Otwarty',12,2025,27),(1365,NULL,'Otwarty',13,2025,27),(1366,NULL,'Otwarty',14,2025,27),(1367,NULL,'Otwarty',15,2025,27),(1368,NULL,'Otwarty',16,2025,27),(1369,NULL,'Otwarty',17,2025,27),(1370,NULL,'Otwarty',18,2025,27),(1371,NULL,'Otwarty',19,2025,27),(1372,NULL,'Otwarty',20,2025,27),(1373,NULL,'Otwarty',21,2025,27),(1374,NULL,'Otwarty',22,2025,27),(1375,NULL,'Otwarty',23,2025,27),(1376,NULL,'Otwarty',24,2025,27),(1377,NULL,'Otwarty',25,2025,27),(1378,NULL,'Otwarty',26,2025,27),(1379,NULL,'Otwarty',27,2025,27),(1380,NULL,'Otwarty',28,2025,27),(1381,NULL,'Otwarty',29,2025,27),(1382,NULL,'Otwarty',30,2025,27),(1383,NULL,'Otwarty',31,2025,27),(1384,NULL,'Otwarty',32,2025,27),(1385,NULL,'Otwarty',33,2025,27),(1386,NULL,'Otwarty',34,2025,27),(1387,NULL,'Otwarty',35,2025,27),(1388,NULL,'Otwarty',36,2025,27),(1389,NULL,'Otwarty',37,2025,27),(1390,NULL,'Otwarty',38,2025,27),(1391,NULL,'Otwarty',39,2025,27),(1392,NULL,'Otwarty',40,2025,27),(1393,NULL,'Otwarty',41,2025,27),(1394,NULL,'Otwarty',42,2025,27),(1395,NULL,'Otwarty',43,2025,27),(1396,NULL,'Otwarty',44,2025,27),(1397,NULL,'Otwarty',45,2025,27),(1398,NULL,'Otwarty',46,2025,27),(1399,NULL,'Otwarty',47,2025,27),(1400,NULL,'Otwarty',48,2025,27),(1401,NULL,'Otwarty',49,2025,27),(1402,NULL,'Otwarty',50,2025,27),(1403,NULL,'Otwarty',51,2025,27),(1404,NULL,'Otwarty',52,2025,27),(1405,NULL,'Zamkniety',1,2025,28),(1406,NULL,'Zamkniety',2,2025,28),(1407,NULL,'Zamkniety',3,2025,28),(1408,NULL,'Zamkniety',4,2025,28),(1409,NULL,'Otwarty',5,2025,28),(1410,NULL,'Otwarty',6,2025,28),(1411,NULL,'Otwarty',7,2025,28),(1412,NULL,'Otwarty',8,2025,28),(1413,NULL,'Otwarty',9,2025,28),(1414,NULL,'Otwarty',10,2025,28),(1415,NULL,'Otwarty',11,2025,28),(1416,NULL,'Otwarty',12,2025,28),(1417,NULL,'Otwarty',13,2025,28),(1418,NULL,'Otwarty',14,2025,28),(1419,NULL,'Otwarty',15,2025,28),(1420,NULL,'Otwarty',16,2025,28),(1421,NULL,'Otwarty',17,2025,28),(1422,NULL,'Otwarty',18,2025,28),(1423,NULL,'Otwarty',19,2025,28),(1424,NULL,'Otwarty',20,2025,28),(1425,NULL,'Otwarty',21,2025,28),(1426,NULL,'Otwarty',22,2025,28),(1427,NULL,'Otwarty',23,2025,28),(1428,NULL,'Otwarty',24,2025,28),(1429,NULL,'Otwarty',25,2025,28),(1430,NULL,'Otwarty',26,2025,28),(1431,NULL,'Otwarty',27,2025,28),(1432,NULL,'Otwarty',28,2025,28),(1433,NULL,'Otwarty',29,2025,28),(1434,NULL,'Otwarty',30,2025,28),(1435,NULL,'Otwarty',31,2025,28),(1436,NULL,'Otwarty',32,2025,28),(1437,NULL,'Otwarty',33,2025,28),(1438,NULL,'Otwarty',34,2025,28),(1439,NULL,'Otwarty',35,2025,28),(1440,NULL,'Otwarty',36,2025,28),(1441,NULL,'Otwarty',37,2025,28),(1442,NULL,'Otwarty',38,2025,28),(1443,NULL,'Otwarty',39,2025,28),(1444,NULL,'Otwarty',40,2025,28),(1445,NULL,'Otwarty',41,2025,28),(1446,NULL,'Otwarty',42,2025,28),(1447,NULL,'Otwarty',43,2025,28),(1448,NULL,'Otwarty',44,2025,28),(1449,NULL,'Otwarty',45,2025,28),(1450,NULL,'Otwarty',46,2025,28),(1451,NULL,'Otwarty',47,2025,28),(1452,NULL,'Otwarty',48,2025,28),(1453,NULL,'Otwarty',49,2025,28),(1454,NULL,'Otwarty',50,2025,28),(1455,NULL,'Otwarty',51,2025,28),(1456,NULL,'Otwarty',52,2025,28),(1457,NULL,'Zamkniety',1,2025,29),(1458,NULL,'Zamkniety',2,2025,29),(1459,NULL,'Zamkniety',3,2025,29),(1460,NULL,'Zamkniety',4,2025,29),(1461,NULL,'Otwarty',5,2025,29),(1462,NULL,'Otwarty',6,2025,29),(1463,NULL,'Otwarty',7,2025,29),(1464,NULL,'Otwarty',8,2025,29),(1465,NULL,'Otwarty',9,2025,29),(1466,NULL,'Otwarty',10,2025,29),(1467,NULL,'Otwarty',11,2025,29),(1468,NULL,'Otwarty',12,2025,29),(1469,NULL,'Otwarty',13,2025,29),(1470,NULL,'Otwarty',14,2025,29),(1471,NULL,'Otwarty',15,2025,29),(1472,NULL,'Otwarty',16,2025,29),(1473,NULL,'Otwarty',17,2025,29),(1474,NULL,'Otwarty',18,2025,29),(1475,NULL,'Otwarty',19,2025,29),(1476,NULL,'Otwarty',20,2025,29),(1477,NULL,'Otwarty',21,2025,29),(1478,NULL,'Otwarty',22,2025,29),(1479,NULL,'Otwarty',23,2025,29),(1480,NULL,'Otwarty',24,2025,29),(1481,NULL,'Otwarty',25,2025,29),(1482,NULL,'Otwarty',26,2025,29),(1483,NULL,'Otwarty',27,2025,29),(1484,NULL,'Otwarty',28,2025,29),(1485,NULL,'Otwarty',29,2025,29),(1486,NULL,'Otwarty',30,2025,29),(1487,NULL,'Otwarty',31,2025,29),(1488,NULL,'Otwarty',32,2025,29),(1489,NULL,'Otwarty',33,2025,29),(1490,NULL,'Otwarty',34,2025,29),(1491,NULL,'Otwarty',35,2025,29),(1492,NULL,'Otwarty',36,2025,29),(1493,NULL,'Otwarty',37,2025,29),(1494,NULL,'Otwarty',38,2025,29),(1495,NULL,'Otwarty',39,2025,29),(1496,NULL,'Otwarty',40,2025,29),(1497,NULL,'Otwarty',41,2025,29),(1498,NULL,'Otwarty',42,2025,29),(1499,NULL,'Otwarty',43,2025,29),(1500,NULL,'Otwarty',44,2025,29),(1501,NULL,'Otwarty',45,2025,29),(1502,NULL,'Otwarty',46,2025,29),(1503,NULL,'Otwarty',47,2025,29),(1504,NULL,'Otwarty',48,2025,29),(1505,NULL,'Otwarty',49,2025,29),(1506,NULL,'Otwarty',50,2025,29),(1507,NULL,'Otwarty',51,2025,29),(1508,NULL,'Otwarty',52,2025,29),(1509,NULL,'Zamkniety',1,2025,30),(1510,NULL,'Zamkniety',2,2025,30),(1511,NULL,'Zamkniety',3,2025,30),(1512,NULL,'Zamkniety',4,2025,30),(1513,NULL,'Otwarty',5,2025,30),(1514,NULL,'Otwarty',6,2025,30),(1515,NULL,'Otwarty',7,2025,30),(1516,NULL,'Otwarty',8,2025,30),(1517,NULL,'Otwarty',9,2025,30),(1518,NULL,'Otwarty',10,2025,30),(1519,NULL,'Otwarty',11,2025,30),(1520,NULL,'Otwarty',12,2025,30),(1521,NULL,'Otwarty',13,2025,30),(1522,NULL,'Otwarty',14,2025,30),(1523,NULL,'Otwarty',15,2025,30),(1524,NULL,'Otwarty',16,2025,30),(1525,NULL,'Otwarty',17,2025,30),(1526,NULL,'Otwarty',18,2025,30),(1527,NULL,'Otwarty',19,2025,30),(1528,NULL,'Otwarty',20,2025,30),(1529,NULL,'Otwarty',21,2025,30),(1530,NULL,'Otwarty',22,2025,30),(1531,NULL,'Otwarty',23,2025,30),(1532,NULL,'Otwarty',24,2025,30),(1533,NULL,'Otwarty',25,2025,30),(1534,NULL,'Otwarty',26,2025,30),(1535,NULL,'Otwarty',27,2025,30),(1536,NULL,'Otwarty',28,2025,30),(1537,NULL,'Otwarty',29,2025,30),(1538,NULL,'Otwarty',30,2025,30),(1539,NULL,'Otwarty',31,2025,30),(1540,NULL,'Otwarty',32,2025,30),(1541,NULL,'Otwarty',33,2025,30),(1542,NULL,'Otwarty',34,2025,30),(1543,NULL,'Otwarty',35,2025,30),(1544,NULL,'Otwarty',36,2025,30),(1545,NULL,'Otwarty',37,2025,30),(1546,NULL,'Otwarty',38,2025,30),(1547,NULL,'Otwarty',39,2025,30),(1548,NULL,'Otwarty',40,2025,30),(1549,NULL,'Otwarty',41,2025,30),(1550,NULL,'Otwarty',42,2025,30),(1551,NULL,'Otwarty',43,2025,30),(1552,NULL,'Otwarty',44,2025,30),(1553,NULL,'Otwarty',45,2025,30),(1554,NULL,'Otwarty',46,2025,30),(1555,NULL,'Otwarty',47,2025,30),(1556,NULL,'Otwarty',48,2025,30),(1557,NULL,'Otwarty',49,2025,30),(1558,NULL,'Otwarty',50,2025,30),(1559,NULL,'Otwarty',51,2025,30),(1560,NULL,'Otwarty',52,2025,30),(1561,NULL,'Zamkniety',1,2025,31),(1562,NULL,'Zamkniety',2,2025,31),(1563,NULL,'Zamkniety',3,2025,31),(1564,NULL,'Zamkniety',4,2025,31),(1565,NULL,'Otwarty',5,2025,31),(1566,NULL,'Otwarty',6,2025,31),(1567,NULL,'Otwarty',7,2025,31),(1568,NULL,'Otwarty',8,2025,31),(1569,NULL,'Otwarty',9,2025,31),(1570,NULL,'Otwarty',10,2025,31),(1571,NULL,'Otwarty',11,2025,31),(1572,NULL,'Otwarty',12,2025,31),(1573,NULL,'Otwarty',13,2025,31),(1574,NULL,'Otwarty',14,2025,31),(1575,NULL,'Otwarty',15,2025,31),(1576,NULL,'Otwarty',16,2025,31),(1577,NULL,'Otwarty',17,2025,31),(1578,NULL,'Otwarty',18,2025,31),(1579,NULL,'Otwarty',19,2025,31),(1580,NULL,'Otwarty',20,2025,31),(1581,NULL,'Otwarty',21,2025,31),(1582,NULL,'Otwarty',22,2025,31),(1583,NULL,'Otwarty',23,2025,31),(1584,NULL,'Otwarty',24,2025,31),(1585,NULL,'Otwarty',25,2025,31),(1586,NULL,'Otwarty',26,2025,31),(1587,NULL,'Otwarty',27,2025,31),(1588,NULL,'Otwarty',28,2025,31),(1589,NULL,'Otwarty',29,2025,31),(1590,NULL,'Otwarty',30,2025,31),(1591,NULL,'Otwarty',31,2025,31),(1592,NULL,'Otwarty',32,2025,31),(1593,NULL,'Otwarty',33,2025,31),(1594,NULL,'Otwarty',34,2025,31),(1595,NULL,'Otwarty',35,2025,31),(1596,NULL,'Otwarty',36,2025,31),(1597,NULL,'Otwarty',37,2025,31),(1598,NULL,'Otwarty',38,2025,31),(1599,NULL,'Otwarty',39,2025,31),(1600,NULL,'Otwarty',40,2025,31),(1601,NULL,'Otwarty',41,2025,31),(1602,NULL,'Otwarty',42,2025,31),(1603,NULL,'Otwarty',43,2025,31),(1604,NULL,'Otwarty',44,2025,31),(1605,NULL,'Otwarty',45,2025,31),(1606,NULL,'Otwarty',46,2025,31),(1607,NULL,'Otwarty',47,2025,31),(1608,NULL,'Otwarty',48,2025,31),(1609,NULL,'Otwarty',49,2025,31),(1610,NULL,'Otwarty',50,2025,31),(1611,NULL,'Otwarty',51,2025,31),(1612,NULL,'Otwarty',52,2025,31),(1613,NULL,'Zamkniety',1,2025,32),(1614,NULL,'Zamkniety',2,2025,32),(1615,NULL,'Zamkniety',3,2025,32),(1616,NULL,'Zamkniety',4,2025,32),(1617,NULL,'Otwarty',5,2025,32),(1618,NULL,'Otwarty',6,2025,32),(1619,NULL,'Otwarty',7,2025,32),(1620,NULL,'Otwarty',8,2025,32),(1621,NULL,'Otwarty',9,2025,32),(1622,NULL,'Otwarty',10,2025,32),(1623,NULL,'Otwarty',11,2025,32),(1624,NULL,'Otwarty',12,2025,32),(1625,NULL,'Otwarty',13,2025,32),(1626,NULL,'Otwarty',14,2025,32),(1627,NULL,'Otwarty',15,2025,32),(1628,NULL,'Otwarty',16,2025,32),(1629,NULL,'Otwarty',17,2025,32),(1630,NULL,'Otwarty',18,2025,32),(1631,NULL,'Otwarty',19,2025,32),(1632,NULL,'Otwarty',20,2025,32),(1633,NULL,'Otwarty',21,2025,32),(1634,NULL,'Otwarty',22,2025,32),(1635,NULL,'Otwarty',23,2025,32),(1636,NULL,'Otwarty',24,2025,32),(1637,NULL,'Otwarty',25,2025,32),(1638,NULL,'Otwarty',26,2025,32),(1639,NULL,'Otwarty',27,2025,32),(1640,NULL,'Otwarty',28,2025,32),(1641,NULL,'Otwarty',29,2025,32),(1642,NULL,'Otwarty',30,2025,32),(1643,NULL,'Otwarty',31,2025,32),(1644,NULL,'Otwarty',32,2025,32),(1645,NULL,'Otwarty',33,2025,32),(1646,NULL,'Otwarty',34,2025,32),(1647,NULL,'Otwarty',35,2025,32),(1648,NULL,'Otwarty',36,2025,32),(1649,NULL,'Otwarty',37,2025,32),(1650,NULL,'Otwarty',38,2025,32),(1651,NULL,'Otwarty',39,2025,32),(1652,NULL,'Otwarty',40,2025,32),(1653,NULL,'Otwarty',41,2025,32),(1654,NULL,'Otwarty',42,2025,32),(1655,NULL,'Otwarty',43,2025,32),(1656,NULL,'Otwarty',44,2025,32),(1657,NULL,'Otwarty',45,2025,32),(1658,NULL,'Otwarty',46,2025,32),(1659,NULL,'Otwarty',47,2025,32),(1660,NULL,'Otwarty',48,2025,32),(1661,NULL,'Otwarty',49,2025,32),(1662,NULL,'Otwarty',50,2025,32),(1663,NULL,'Otwarty',51,2025,32),(1664,NULL,'Otwarty',52,2025,32),(1665,NULL,'Zamkniety',1,2025,33),(1666,NULL,'Zamkniety',2,2025,33),(1667,NULL,'Zamkniety',3,2025,33),(1668,NULL,'Zamkniety',4,2025,33),(1669,NULL,'Otwarty',5,2025,33),(1670,NULL,'Otwarty',6,2025,33),(1671,NULL,'Otwarty',7,2025,33),(1672,NULL,'Otwarty',8,2025,33),(1673,NULL,'Otwarty',9,2025,33),(1674,NULL,'Otwarty',10,2025,33),(1675,NULL,'Otwarty',11,2025,33),(1676,NULL,'Otwarty',12,2025,33),(1677,NULL,'Otwarty',13,2025,33),(1678,NULL,'Otwarty',14,2025,33),(1679,NULL,'Otwarty',15,2025,33),(1680,NULL,'Otwarty',16,2025,33),(1681,NULL,'Otwarty',17,2025,33),(1682,NULL,'Otwarty',18,2025,33),(1683,NULL,'Otwarty',19,2025,33),(1684,NULL,'Otwarty',20,2025,33),(1685,NULL,'Otwarty',21,2025,33),(1686,NULL,'Otwarty',22,2025,33),(1687,NULL,'Otwarty',23,2025,33),(1688,NULL,'Otwarty',24,2025,33),(1689,NULL,'Otwarty',25,2025,33),(1690,NULL,'Otwarty',26,2025,33),(1691,NULL,'Otwarty',27,2025,33),(1692,NULL,'Otwarty',28,2025,33),(1693,NULL,'Otwarty',29,2025,33),(1694,NULL,'Otwarty',30,2025,33),(1695,NULL,'Otwarty',31,2025,33),(1696,NULL,'Otwarty',32,2025,33),(1697,NULL,'Otwarty',33,2025,33),(1698,NULL,'Otwarty',34,2025,33),(1699,NULL,'Otwarty',35,2025,33),(1700,NULL,'Otwarty',36,2025,33),(1701,NULL,'Otwarty',37,2025,33),(1702,NULL,'Otwarty',38,2025,33),(1703,NULL,'Otwarty',39,2025,33),(1704,NULL,'Otwarty',40,2025,33),(1705,NULL,'Otwarty',41,2025,33),(1706,NULL,'Otwarty',42,2025,33),(1707,NULL,'Otwarty',43,2025,33),(1708,NULL,'Otwarty',44,2025,33),(1709,NULL,'Otwarty',45,2025,33),(1710,NULL,'Otwarty',46,2025,33),(1711,NULL,'Otwarty',47,2025,33),(1712,NULL,'Otwarty',48,2025,33),(1713,NULL,'Otwarty',49,2025,33),(1714,NULL,'Otwarty',50,2025,33),(1715,NULL,'Otwarty',51,2025,33),(1716,NULL,'Otwarty',52,2025,33),(1717,NULL,'Zamkniety',1,2025,34),(1718,NULL,'Zamkniety',2,2025,34),(1719,NULL,'Zamkniety',3,2025,34),(1720,NULL,'Zamkniety',4,2025,34),(1721,NULL,'Otwarty',5,2025,34),(1722,NULL,'Otwarty',6,2025,34),(1723,NULL,'Otwarty',7,2025,34),(1724,NULL,'Otwarty',8,2025,34),(1725,NULL,'Otwarty',9,2025,34),(1726,NULL,'Otwarty',10,2025,34),(1727,NULL,'Otwarty',11,2025,34),(1728,NULL,'Otwarty',12,2025,34),(1729,NULL,'Otwarty',13,2025,34),(1730,NULL,'Otwarty',14,2025,34),(1731,NULL,'Otwarty',15,2025,34),(1732,NULL,'Otwarty',16,2025,34),(1733,NULL,'Otwarty',17,2025,34),(1734,NULL,'Otwarty',18,2025,34),(1735,NULL,'Otwarty',19,2025,34),(1736,NULL,'Otwarty',20,2025,34),(1737,NULL,'Otwarty',21,2025,34),(1738,NULL,'Otwarty',22,2025,34),(1739,NULL,'Otwarty',23,2025,34),(1740,NULL,'Otwarty',24,2025,34),(1741,NULL,'Otwarty',25,2025,34),(1742,NULL,'Otwarty',26,2025,34),(1743,NULL,'Otwarty',27,2025,34),(1744,NULL,'Otwarty',28,2025,34),(1745,NULL,'Otwarty',29,2025,34),(1746,NULL,'Otwarty',30,2025,34),(1747,NULL,'Otwarty',31,2025,34),(1748,NULL,'Otwarty',32,2025,34),(1749,NULL,'Otwarty',33,2025,34),(1750,NULL,'Otwarty',34,2025,34),(1751,NULL,'Otwarty',35,2025,34),(1752,NULL,'Otwarty',36,2025,34),(1753,NULL,'Otwarty',37,2025,34),(1754,NULL,'Otwarty',38,2025,34),(1755,NULL,'Otwarty',39,2025,34),(1756,NULL,'Otwarty',40,2025,34),(1757,NULL,'Otwarty',41,2025,34),(1758,NULL,'Otwarty',42,2025,34),(1759,NULL,'Otwarty',43,2025,34),(1760,NULL,'Otwarty',44,2025,34),(1761,NULL,'Otwarty',45,2025,34),(1762,NULL,'Otwarty',46,2025,34),(1763,NULL,'Otwarty',47,2025,34),(1764,NULL,'Otwarty',48,2025,34),(1765,NULL,'Otwarty',49,2025,34),(1766,NULL,'Otwarty',50,2025,34),(1767,NULL,'Otwarty',51,2025,34),(1768,NULL,'Otwarty',52,2025,34),(1769,NULL,'Zamkniety',1,2025,35),(1770,NULL,'Zamkniety',2,2025,35),(1771,NULL,'Zamkniety',3,2025,35),(1772,NULL,'Zamkniety',4,2025,35),(1773,NULL,'Otwarty',5,2025,35),(1774,NULL,'Otwarty',6,2025,35),(1775,NULL,'Otwarty',7,2025,35),(1776,NULL,'Otwarty',8,2025,35),(1777,NULL,'Otwarty',9,2025,35),(1778,NULL,'Otwarty',10,2025,35),(1779,NULL,'Otwarty',11,2025,35),(1780,NULL,'Otwarty',12,2025,35),(1781,NULL,'Otwarty',13,2025,35),(1782,NULL,'Otwarty',14,2025,35),(1783,NULL,'Otwarty',15,2025,35),(1784,NULL,'Otwarty',16,2025,35),(1785,NULL,'Otwarty',17,2025,35),(1786,NULL,'Otwarty',18,2025,35),(1787,NULL,'Otwarty',19,2025,35),(1788,NULL,'Otwarty',20,2025,35),(1789,NULL,'Otwarty',21,2025,35),(1790,NULL,'Otwarty',22,2025,35),(1791,NULL,'Otwarty',23,2025,35),(1792,NULL,'Otwarty',24,2025,35),(1793,NULL,'Otwarty',25,2025,35),(1794,NULL,'Otwarty',26,2025,35),(1795,NULL,'Otwarty',27,2025,35),(1796,NULL,'Otwarty',28,2025,35),(1797,NULL,'Otwarty',29,2025,35),(1798,NULL,'Otwarty',30,2025,35),(1799,NULL,'Otwarty',31,2025,35),(1800,NULL,'Otwarty',32,2025,35),(1801,NULL,'Otwarty',33,2025,35),(1802,NULL,'Otwarty',34,2025,35),(1803,NULL,'Otwarty',35,2025,35),(1804,NULL,'Otwarty',36,2025,35),(1805,NULL,'Otwarty',37,2025,35),(1806,NULL,'Otwarty',38,2025,35),(1807,NULL,'Otwarty',39,2025,35),(1808,NULL,'Otwarty',40,2025,35),(1809,NULL,'Otwarty',41,2025,35),(1810,NULL,'Otwarty',42,2025,35),(1811,NULL,'Otwarty',43,2025,35),(1812,NULL,'Otwarty',44,2025,35),(1813,NULL,'Otwarty',45,2025,35),(1814,NULL,'Otwarty',46,2025,35),(1815,NULL,'Otwarty',47,2025,35),(1816,NULL,'Otwarty',48,2025,35),(1817,NULL,'Otwarty',49,2025,35),(1818,NULL,'Otwarty',50,2025,35),(1819,NULL,'Otwarty',51,2025,35),(1820,NULL,'Otwarty',52,2025,35),(1821,NULL,'Zamkniety',1,2025,36),(1822,NULL,'Zamkniety',2,2025,36),(1823,NULL,'Zamkniety',3,2025,36),(1824,NULL,'Zamkniety',4,2025,36),(1825,NULL,'Otwarty',5,2025,36),(1826,NULL,'Otwarty',6,2025,36),(1827,NULL,'Otwarty',7,2025,36),(1828,NULL,'Otwarty',8,2025,36),(1829,NULL,'Otwarty',9,2025,36),(1830,NULL,'Otwarty',10,2025,36),(1831,NULL,'Otwarty',11,2025,36),(1832,NULL,'Otwarty',12,2025,36),(1833,NULL,'Otwarty',13,2025,36),(1834,NULL,'Otwarty',14,2025,36),(1835,NULL,'Otwarty',15,2025,36),(1836,NULL,'Otwarty',16,2025,36),(1837,NULL,'Otwarty',17,2025,36),(1838,NULL,'Otwarty',18,2025,36),(1839,NULL,'Otwarty',19,2025,36),(1840,NULL,'Otwarty',20,2025,36),(1841,NULL,'Otwarty',21,2025,36),(1842,NULL,'Otwarty',22,2025,36),(1843,NULL,'Otwarty',23,2025,36),(1844,NULL,'Otwarty',24,2025,36),(1845,NULL,'Otwarty',25,2025,36),(1846,NULL,'Otwarty',26,2025,36),(1847,NULL,'Otwarty',27,2025,36),(1848,NULL,'Otwarty',28,2025,36),(1849,NULL,'Otwarty',29,2025,36),(1850,NULL,'Otwarty',30,2025,36),(1851,NULL,'Otwarty',31,2025,36),(1852,NULL,'Otwarty',32,2025,36),(1853,NULL,'Otwarty',33,2025,36),(1854,NULL,'Otwarty',34,2025,36),(1855,NULL,'Otwarty',35,2025,36),(1856,NULL,'Otwarty',36,2025,36),(1857,NULL,'Otwarty',37,2025,36),(1858,NULL,'Otwarty',38,2025,36),(1859,NULL,'Otwarty',39,2025,36),(1860,NULL,'Otwarty',40,2025,36),(1861,NULL,'Otwarty',41,2025,36),(1862,NULL,'Otwarty',42,2025,36),(1863,NULL,'Otwarty',43,2025,36),(1864,NULL,'Otwarty',44,2025,36),(1865,NULL,'Otwarty',45,2025,36),(1866,NULL,'Otwarty',46,2025,36),(1867,NULL,'Otwarty',47,2025,36),(1868,NULL,'Otwarty',48,2025,36),(1869,NULL,'Otwarty',49,2025,36),(1870,NULL,'Otwarty',50,2025,36),(1871,NULL,'Otwarty',51,2025,36),(1872,NULL,'Otwarty',52,2025,36),(1873,NULL,'Zamkniety',1,2025,37),(1874,NULL,'Zamkniety',2,2025,37),(1875,NULL,'Zamkniety',3,2025,37),(1876,NULL,'Zamkniety',4,2025,37),(1877,NULL,'Otwarty',5,2025,37),(1878,NULL,'Otwarty',6,2025,37),(1879,NULL,'Otwarty',7,2025,37),(1880,NULL,'Otwarty',8,2025,37),(1881,NULL,'Otwarty',9,2025,37),(1882,NULL,'Otwarty',10,2025,37),(1883,NULL,'Otwarty',11,2025,37),(1884,NULL,'Otwarty',12,2025,37),(1885,NULL,'Otwarty',13,2025,37),(1886,NULL,'Otwarty',14,2025,37),(1887,NULL,'Otwarty',15,2025,37),(1888,NULL,'Otwarty',16,2025,37),(1889,NULL,'Otwarty',17,2025,37),(1890,NULL,'Otwarty',18,2025,37),(1891,NULL,'Otwarty',19,2025,37),(1892,NULL,'Otwarty',20,2025,37),(1893,NULL,'Otwarty',21,2025,37),(1894,NULL,'Otwarty',22,2025,37),(1895,NULL,'Otwarty',23,2025,37),(1896,NULL,'Otwarty',24,2025,37),(1897,NULL,'Otwarty',25,2025,37),(1898,NULL,'Otwarty',26,2025,37),(1899,NULL,'Otwarty',27,2025,37),(1900,NULL,'Otwarty',28,2025,37),(1901,NULL,'Otwarty',29,2025,37),(1902,NULL,'Otwarty',30,2025,37),(1903,NULL,'Otwarty',31,2025,37),(1904,NULL,'Otwarty',32,2025,37),(1905,NULL,'Otwarty',33,2025,37),(1906,NULL,'Otwarty',34,2025,37),(1907,NULL,'Otwarty',35,2025,37),(1908,NULL,'Otwarty',36,2025,37),(1909,NULL,'Otwarty',37,2025,37),(1910,NULL,'Otwarty',38,2025,37),(1911,NULL,'Otwarty',39,2025,37),(1912,NULL,'Otwarty',40,2025,37),(1913,NULL,'Otwarty',41,2025,37),(1914,NULL,'Otwarty',42,2025,37),(1915,NULL,'Otwarty',43,2025,37),(1916,NULL,'Otwarty',44,2025,37),(1917,NULL,'Otwarty',45,2025,37),(1918,NULL,'Otwarty',46,2025,37),(1919,NULL,'Otwarty',47,2025,37),(1920,NULL,'Otwarty',48,2025,37),(1921,NULL,'Otwarty',49,2025,37),(1922,NULL,'Otwarty',50,2025,37),(1923,NULL,'Otwarty',51,2025,37),(1924,NULL,'Otwarty',52,2025,37),(1925,NULL,'Zamkniety',1,2025,38),(1926,NULL,'Zamkniety',2,2025,38),(1927,NULL,'Zamkniety',3,2025,38),(1928,NULL,'Zamkniety',4,2025,38),(1929,NULL,'Otwarty',5,2025,38),(1930,NULL,'Otwarty',6,2025,38),(1931,NULL,'Otwarty',7,2025,38),(1932,NULL,'Otwarty',8,2025,38),(1933,NULL,'Otwarty',9,2025,38),(1934,NULL,'Otwarty',10,2025,38),(1935,NULL,'Otwarty',11,2025,38),(1936,NULL,'Otwarty',12,2025,38),(1937,NULL,'Otwarty',13,2025,38),(1938,NULL,'Otwarty',14,2025,38),(1939,NULL,'Otwarty',15,2025,38),(1940,NULL,'Otwarty',16,2025,38),(1941,NULL,'Otwarty',17,2025,38),(1942,NULL,'Otwarty',18,2025,38),(1943,NULL,'Otwarty',19,2025,38),(1944,NULL,'Otwarty',20,2025,38),(1945,NULL,'Otwarty',21,2025,38),(1946,NULL,'Otwarty',22,2025,38),(1947,NULL,'Otwarty',23,2025,38),(1948,NULL,'Otwarty',24,2025,38),(1949,NULL,'Otwarty',25,2025,38),(1950,NULL,'Otwarty',26,2025,38),(1951,NULL,'Otwarty',27,2025,38),(1952,NULL,'Otwarty',28,2025,38),(1953,NULL,'Otwarty',29,2025,38),(1954,NULL,'Otwarty',30,2025,38),(1955,NULL,'Otwarty',31,2025,38),(1956,NULL,'Otwarty',32,2025,38),(1957,NULL,'Otwarty',33,2025,38),(1958,NULL,'Otwarty',34,2025,38),(1959,NULL,'Otwarty',35,2025,38),(1960,NULL,'Otwarty',36,2025,38),(1961,NULL,'Otwarty',37,2025,38),(1962,NULL,'Otwarty',38,2025,38),(1963,NULL,'Otwarty',39,2025,38),(1964,NULL,'Otwarty',40,2025,38),(1965,NULL,'Otwarty',41,2025,38),(1966,NULL,'Otwarty',42,2025,38),(1967,NULL,'Otwarty',43,2025,38),(1968,NULL,'Otwarty',44,2025,38),(1969,NULL,'Otwarty',45,2025,38),(1970,NULL,'Otwarty',46,2025,38),(1971,NULL,'Otwarty',47,2025,38),(1972,NULL,'Otwarty',48,2025,38),(1973,NULL,'Otwarty',49,2025,38),(1974,NULL,'Otwarty',50,2025,38),(1975,NULL,'Otwarty',51,2025,38),(1976,NULL,'Otwarty',52,2025,38),(1977,NULL,'Zamkniety',1,2025,39),(1978,NULL,'Zamkniety',2,2025,39),(1979,NULL,'Zamkniety',3,2025,39),(1980,NULL,'Zamkniety',4,2025,39),(1981,NULL,'Otwarty',5,2025,39),(1982,NULL,'Otwarty',6,2025,39),(1983,NULL,'Otwarty',7,2025,39),(1984,NULL,'Otwarty',8,2025,39),(1985,NULL,'Otwarty',9,2025,39),(1986,NULL,'Otwarty',10,2025,39),(1987,NULL,'Otwarty',11,2025,39),(1988,NULL,'Otwarty',12,2025,39),(1989,NULL,'Otwarty',13,2025,39),(1990,NULL,'Otwarty',14,2025,39),(1991,NULL,'Otwarty',15,2025,39),(1992,NULL,'Otwarty',16,2025,39),(1993,NULL,'Otwarty',17,2025,39),(1994,NULL,'Otwarty',18,2025,39),(1995,NULL,'Otwarty',19,2025,39),(1996,NULL,'Otwarty',20,2025,39),(1997,NULL,'Otwarty',21,2025,39),(1998,NULL,'Otwarty',22,2025,39),(1999,NULL,'Otwarty',23,2025,39),(2000,NULL,'Otwarty',24,2025,39),(2001,NULL,'Otwarty',25,2025,39),(2002,NULL,'Otwarty',26,2025,39),(2003,NULL,'Otwarty',27,2025,39),(2004,NULL,'Otwarty',28,2025,39),(2005,NULL,'Otwarty',29,2025,39),(2006,NULL,'Otwarty',30,2025,39),(2007,NULL,'Otwarty',31,2025,39),(2008,NULL,'Otwarty',32,2025,39),(2009,NULL,'Otwarty',33,2025,39),(2010,NULL,'Otwarty',34,2025,39),(2011,NULL,'Otwarty',35,2025,39),(2012,NULL,'Otwarty',36,2025,39),(2013,NULL,'Otwarty',37,2025,39),(2014,NULL,'Otwarty',38,2025,39),(2015,NULL,'Otwarty',39,2025,39),(2016,NULL,'Otwarty',40,2025,39),(2017,NULL,'Otwarty',41,2025,39),(2018,NULL,'Otwarty',42,2025,39),(2019,NULL,'Otwarty',43,2025,39),(2020,NULL,'Otwarty',44,2025,39),(2021,NULL,'Otwarty',45,2025,39),(2022,NULL,'Otwarty',46,2025,39),(2023,NULL,'Otwarty',47,2025,39),(2024,NULL,'Otwarty',48,2025,39),(2025,NULL,'Otwarty',49,2025,39),(2026,NULL,'Otwarty',50,2025,39),(2027,NULL,'Otwarty',51,2025,39),(2028,NULL,'Otwarty',52,2025,39),(2029,NULL,'Zamkniety',1,2025,40),(2030,NULL,'Zamkniety',2,2025,40),(2031,NULL,'Zamkniety',3,2025,40),(2032,NULL,'Zamkniety',4,2025,40),(2033,NULL,'Otwarty',5,2025,40),(2034,NULL,'Otwarty',6,2025,40),(2035,NULL,'Otwarty',7,2025,40),(2036,NULL,'Otwarty',8,2025,40),(2037,NULL,'Otwarty',9,2025,40),(2038,NULL,'Otwarty',10,2025,40),(2039,NULL,'Otwarty',11,2025,40),(2040,NULL,'Otwarty',12,2025,40),(2041,NULL,'Otwarty',13,2025,40),(2042,NULL,'Otwarty',14,2025,40),(2043,NULL,'Otwarty',15,2025,40),(2044,NULL,'Otwarty',16,2025,40),(2045,NULL,'Otwarty',17,2025,40),(2046,NULL,'Otwarty',18,2025,40),(2047,NULL,'Otwarty',19,2025,40),(2048,NULL,'Otwarty',20,2025,40),(2049,NULL,'Otwarty',21,2025,40),(2050,NULL,'Otwarty',22,2025,40),(2051,NULL,'Otwarty',23,2025,40),(2052,NULL,'Otwarty',24,2025,40),(2053,NULL,'Otwarty',25,2025,40),(2054,NULL,'Otwarty',26,2025,40),(2055,NULL,'Otwarty',27,2025,40),(2056,NULL,'Otwarty',28,2025,40),(2057,NULL,'Otwarty',29,2025,40),(2058,NULL,'Otwarty',30,2025,40),(2059,NULL,'Otwarty',31,2025,40),(2060,NULL,'Otwarty',32,2025,40),(2061,NULL,'Otwarty',33,2025,40),(2062,NULL,'Otwarty',34,2025,40),(2063,NULL,'Otwarty',35,2025,40),(2064,NULL,'Otwarty',36,2025,40),(2065,NULL,'Otwarty',37,2025,40),(2066,NULL,'Otwarty',38,2025,40),(2067,NULL,'Otwarty',39,2025,40),(2068,NULL,'Otwarty',40,2025,40),(2069,NULL,'Otwarty',41,2025,40),(2070,NULL,'Otwarty',42,2025,40),(2071,NULL,'Otwarty',43,2025,40),(2072,NULL,'Otwarty',44,2025,40),(2073,NULL,'Otwarty',45,2025,40),(2074,NULL,'Otwarty',46,2025,40),(2075,NULL,'Otwarty',47,2025,40),(2076,NULL,'Otwarty',48,2025,40),(2077,NULL,'Otwarty',49,2025,40),(2078,NULL,'Otwarty',50,2025,40),(2079,NULL,'Otwarty',51,2025,40),(2080,NULL,'Otwarty',52,2025,40),(2081,NULL,'Zamkniety',1,2025,41),(2082,NULL,'Zamkniety',2,2025,41),(2083,NULL,'Zamkniety',3,2025,41),(2084,NULL,'Zamkniety',4,2025,41),(2085,NULL,'Otwarty',5,2025,41),(2086,NULL,'Otwarty',6,2025,41),(2087,NULL,'Otwarty',7,2025,41),(2088,NULL,'Otwarty',8,2025,41),(2089,NULL,'Otwarty',9,2025,41),(2090,NULL,'Otwarty',10,2025,41),(2091,NULL,'Otwarty',11,2025,41),(2092,NULL,'Otwarty',12,2025,41),(2093,NULL,'Otwarty',13,2025,41),(2094,NULL,'Otwarty',14,2025,41),(2095,NULL,'Otwarty',15,2025,41),(2096,NULL,'Otwarty',16,2025,41),(2097,NULL,'Otwarty',17,2025,41),(2098,NULL,'Otwarty',18,2025,41),(2099,NULL,'Otwarty',19,2025,41),(2100,NULL,'Otwarty',20,2025,41),(2101,NULL,'Otwarty',21,2025,41),(2102,NULL,'Otwarty',22,2025,41),(2103,NULL,'Otwarty',23,2025,41),(2104,NULL,'Otwarty',24,2025,41),(2105,NULL,'Otwarty',25,2025,41),(2106,NULL,'Otwarty',26,2025,41),(2107,NULL,'Otwarty',27,2025,41),(2108,NULL,'Otwarty',28,2025,41),(2109,NULL,'Otwarty',29,2025,41),(2110,NULL,'Otwarty',30,2025,41),(2111,NULL,'Otwarty',31,2025,41),(2112,NULL,'Otwarty',32,2025,41),(2113,NULL,'Otwarty',33,2025,41),(2114,NULL,'Otwarty',34,2025,41),(2115,NULL,'Otwarty',35,2025,41),(2116,NULL,'Otwarty',36,2025,41),(2117,NULL,'Otwarty',37,2025,41),(2118,NULL,'Otwarty',38,2025,41),(2119,NULL,'Otwarty',39,2025,41),(2120,NULL,'Otwarty',40,2025,41),(2121,NULL,'Otwarty',41,2025,41),(2122,NULL,'Otwarty',42,2025,41),(2123,NULL,'Otwarty',43,2025,41),(2124,NULL,'Otwarty',44,2025,41),(2125,NULL,'Otwarty',45,2025,41),(2126,NULL,'Otwarty',46,2025,41),(2127,NULL,'Otwarty',47,2025,41),(2128,NULL,'Otwarty',48,2025,41),(2129,NULL,'Otwarty',49,2025,41),(2130,NULL,'Otwarty',50,2025,41),(2131,NULL,'Otwarty',51,2025,41),(2132,NULL,'Otwarty',52,2025,41),(2133,NULL,'Zamkniety',1,2025,42),(2134,NULL,'Zamkniety',2,2025,42),(2135,NULL,'Zamkniety',3,2025,42),(2136,NULL,'Zamkniety',4,2025,42),(2137,NULL,'Otwarty',5,2025,42),(2138,NULL,'Otwarty',6,2025,42),(2139,NULL,'Otwarty',7,2025,42),(2140,NULL,'Otwarty',8,2025,42),(2141,NULL,'Otwarty',9,2025,42),(2142,NULL,'Otwarty',10,2025,42),(2143,NULL,'Otwarty',11,2025,42),(2144,NULL,'Otwarty',12,2025,42),(2145,NULL,'Otwarty',13,2025,42),(2146,NULL,'Otwarty',14,2025,42),(2147,NULL,'Otwarty',15,2025,42),(2148,NULL,'Otwarty',16,2025,42),(2149,NULL,'Otwarty',17,2025,42),(2150,NULL,'Otwarty',18,2025,42),(2151,NULL,'Otwarty',19,2025,42),(2152,NULL,'Otwarty',20,2025,42),(2153,NULL,'Otwarty',21,2025,42),(2154,NULL,'Otwarty',22,2025,42),(2155,NULL,'Otwarty',23,2025,42),(2156,NULL,'Otwarty',24,2025,42),(2157,NULL,'Otwarty',25,2025,42),(2158,NULL,'Otwarty',26,2025,42),(2159,NULL,'Otwarty',27,2025,42),(2160,NULL,'Otwarty',28,2025,42),(2161,NULL,'Otwarty',29,2025,42),(2162,NULL,'Otwarty',30,2025,42),(2163,NULL,'Otwarty',31,2025,42),(2164,NULL,'Otwarty',32,2025,42),(2165,NULL,'Otwarty',33,2025,42),(2166,NULL,'Otwarty',34,2025,42),(2167,NULL,'Otwarty',35,2025,42),(2168,NULL,'Otwarty',36,2025,42),(2169,NULL,'Otwarty',37,2025,42),(2170,NULL,'Otwarty',38,2025,42),(2171,NULL,'Otwarty',39,2025,42),(2172,NULL,'Otwarty',40,2025,42),(2173,NULL,'Otwarty',41,2025,42),(2174,NULL,'Otwarty',42,2025,42),(2175,NULL,'Otwarty',43,2025,42),(2176,NULL,'Otwarty',44,2025,42),(2177,NULL,'Otwarty',45,2025,42),(2178,NULL,'Otwarty',46,2025,42),(2179,NULL,'Otwarty',47,2025,42),(2180,NULL,'Otwarty',48,2025,42),(2181,NULL,'Otwarty',49,2025,42),(2182,NULL,'Otwarty',50,2025,42),(2183,NULL,'Otwarty',51,2025,42),(2184,NULL,'Otwarty',52,2025,42),(2185,NULL,'Zamkniety',1,2025,43),(2186,NULL,'Zamkniety',2,2025,43),(2187,NULL,'Zamkniety',3,2025,43),(2188,NULL,'Zamkniety',4,2025,43),(2189,NULL,'Otwarty',5,2025,43),(2190,NULL,'Otwarty',6,2025,43),(2191,NULL,'Otwarty',7,2025,43),(2192,NULL,'Otwarty',8,2025,43),(2193,NULL,'Otwarty',9,2025,43),(2194,NULL,'Otwarty',10,2025,43),(2195,NULL,'Otwarty',11,2025,43),(2196,NULL,'Otwarty',12,2025,43),(2197,NULL,'Otwarty',13,2025,43),(2198,NULL,'Otwarty',14,2025,43),(2199,NULL,'Otwarty',15,2025,43),(2200,NULL,'Otwarty',16,2025,43),(2201,NULL,'Otwarty',17,2025,43),(2202,NULL,'Otwarty',18,2025,43),(2203,NULL,'Otwarty',19,2025,43),(2204,NULL,'Otwarty',20,2025,43),(2205,NULL,'Otwarty',21,2025,43),(2206,NULL,'Otwarty',22,2025,43),(2207,NULL,'Otwarty',23,2025,43),(2208,NULL,'Otwarty',24,2025,43),(2209,NULL,'Otwarty',25,2025,43),(2210,NULL,'Otwarty',26,2025,43),(2211,NULL,'Otwarty',27,2025,43),(2212,NULL,'Otwarty',28,2025,43),(2213,NULL,'Otwarty',29,2025,43),(2214,NULL,'Otwarty',30,2025,43),(2215,NULL,'Otwarty',31,2025,43),(2216,NULL,'Otwarty',32,2025,43),(2217,NULL,'Otwarty',33,2025,43),(2218,NULL,'Otwarty',34,2025,43),(2219,NULL,'Otwarty',35,2025,43),(2220,NULL,'Otwarty',36,2025,43),(2221,NULL,'Otwarty',37,2025,43),(2222,NULL,'Otwarty',38,2025,43),(2223,NULL,'Otwarty',39,2025,43),(2224,NULL,'Otwarty',40,2025,43),(2225,NULL,'Otwarty',41,2025,43),(2226,NULL,'Otwarty',42,2025,43),(2227,NULL,'Otwarty',43,2025,43),(2228,NULL,'Otwarty',44,2025,43),(2229,NULL,'Otwarty',45,2025,43),(2230,NULL,'Otwarty',46,2025,43),(2231,NULL,'Otwarty',47,2025,43),(2232,NULL,'Otwarty',48,2025,43),(2233,NULL,'Otwarty',49,2025,43),(2234,NULL,'Otwarty',50,2025,43),(2235,NULL,'Otwarty',51,2025,43),(2236,NULL,'Otwarty',52,2025,43);
/*!40000 ALTER TABLE `tydzien` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `urlopy`
--

DROP TABLE IF EXISTS `urlopy`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `urlopy` (
  `idUrlopy` int NOT NULL AUTO_INCREMENT,
  `Imie` varchar(45) NOT NULL,
  `Nazwisko` varchar(45) NOT NULL,
  `Urlop_od` timestamp NOT NULL,
  `Urlop_do` timestamp NOT NULL,
  `Status` varchar(45) DEFAULT NULL,
  `Komentarz` varchar(45) DEFAULT NULL,
  `FK_idPracownik` int NOT NULL,
  PRIMARY KEY (`idUrlopy`,`FK_idPracownik`),
  KEY `fk_Urlopy_Pracownik1_idx` (`FK_idPracownik`),
  CONSTRAINT `fk_Urlopy_Pracownik1` FOREIGN KEY (`FK_idPracownik`) REFERENCES `pracownik` (`idPracownik`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `urlopy`
--

LOCK TABLES `urlopy` WRITE;
/*!40000 ALTER TABLE `urlopy` DISABLE KEYS */;
/*!40000 ALTER TABLE `urlopy` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `view_dzien_projekty`
--

DROP TABLE IF EXISTS `view_dzien_projekty`;
/*!50001 DROP VIEW IF EXISTS `view_dzien_projekty`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `view_dzien_projekty` AS SELECT 
 1 AS `Data`,
 1 AS `Pracownik`,
 1 AS `Pojazd`,
 1 AS `Projekt`,
 1 AS `GodzinyPrzepracowane`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `view_dzien_projekty`
--

/*!50001 DROP VIEW IF EXISTS `view_dzien_projekty`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `view_dzien_projekty` AS select (cast(concat(`t`.`Rok`,'-01-01') as date) + interval (`d`.`Dzien_tygodnia` + ((`t`.`tydzienRoku` - 1) * 7)) day) AS `Data`,concat(`do`.`Imie`,' ',`do`.`Nazwisko`) AS `Pracownik`,concat(`pj`.`Marka`,' ',`pj`.`Nr_rejestracyjny`) AS `Pojazd`,`pr`.`NazwaKod_Projektu` AS `Projekt`,`dp`.`Godziny_przepracowane` AS `GodzinyPrzepracowane` from ((((((`dzien_projekty` `dp` join `dzien` `d` on((`dp`.`Dzien_idDzien` = `d`.`idDzien`))) join `tydzien` `t` on((`d`.`Tydzien_idTydzien` = `t`.`idTydzien`))) join `pracownik` `p` on((`t`.`Pracownik_idPracownik` = `p`.`idPracownik`))) join `dane_osobowe` `do` on((`p`.`FK_Dane_osobowe` = `do`.`idDane_osobowe`))) left join `pojazdy` `pj` on((`dp`.`Pojazdy_idPojazdy` = `pj`.`idPojazdy`))) join `projekty` `pr` on((`dp`.`Projekty_idProjekty` = `pr`.`idProjekty`))) where (`dp`.`Godziny_przepracowane` > 0) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-02-01  2:00:01
