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
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb3 COMMENT='\\''\\''\\';
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB AUTO_INCREMENT=1394 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB AUTO_INCREMENT=2326 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB AUTO_INCREMENT=589 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB AUTO_INCREMENT=223 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

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
  UNIQUE KEY `UC_Nazwa_uzytkownika` (`Nazwa_uzytkownika`),
  KEY `fk_Pracownik2_Dane osobowe_idx` (`FK_Dane_osobowe`),
  KEY `fk_Pracownik2_Informacje_o_firmie1_idx` (`FK_Informacje_o_firmie`),
  CONSTRAINT `fk_Pracownik2_Dane osobowe` FOREIGN KEY (`FK_Dane_osobowe`) REFERENCES `dane_osobowe` (`idDane_osobowe`) ON DELETE RESTRICT,
  CONSTRAINT `fk_Pracownik2_Informacje_o_firmie1` FOREIGN KEY (`FK_Informacje_o_firmie`) REFERENCES `informacje_o_firmie` (`idInformacje_o_firmie`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `projekty`
--

DROP TABLE IF EXISTS `projekty`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projekty` (
  `idProjekty` int NOT NULL AUTO_INCREMENT,
  `NazwaKod_Projektu` varchar(100) DEFAULT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=89 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB AUTO_INCREMENT=2757 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

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
/*!50001 VIEW `view_dzien_projekty` AS select (str_to_date(concat(`t`.`Rok`,'-W',lpad(`t`.`tydzienRoku`,2,'0'),'-',(case `d`.`Dzien_tygodnia` when 'Poniedziałek' then '1' when 'Wtorek' then '2' when 'Środa' then '3' when 'Czwartek' then '4' when 'Piątek' then '5' when 'Sobota' then '6' when 'Niedziela' then '7' end)),'%Y-W%u-%w') + interval 0 day) AS `Data`,concat(`do`.`Imie`,' ',`do`.`Nazwisko`) AS `Pracownik`,concat(`pj`.`Marka`,' ',`pj`.`Nr_rejestracyjny`) AS `Pojazd`,`pr`.`NazwaKod_Projektu` AS `Projekt`,`dp`.`Godziny_przepracowane` AS `GodzinyPrzepracowane` from ((((((`dzien_projekty` `dp` join `dzien` `d` on((`dp`.`Dzien_idDzien` = `d`.`idDzien`))) join `tydzien` `t` on((`d`.`Tydzien_idTydzien` = `t`.`idTydzien`))) join `pracownik` `p` on((`t`.`Pracownik_idPracownik` = `p`.`idPracownik`))) join `dane_osobowe` `do` on((`p`.`FK_Dane_osobowe` = `do`.`idDane_osobowe`))) left join `pojazdy` `pj` on((`dp`.`Pojazdy_idPojazdy` = `pj`.`idPojazdy`))) join `projekty` `pr` on((`dp`.`Projekty_idProjekty` = `pr`.`idProjekty`))) where (`dp`.`Godziny_przepracowane` > 0) */;
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

-- Dump completed on 2025-07-22 11:30:40
