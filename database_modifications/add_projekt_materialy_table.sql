-- Dodanie tabeli do przechowywania materiałów projektów
CREATE TABLE IF NOT EXISTS `projekt_materialy` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ProjektID` int NOT NULL,
  `NazwaFaktury` varchar(255) NOT NULL,
  `Data` date NOT NULL,
  `Koszty` decimal(10,2) NOT NULL,
  `Opis` text DEFAULT NULL,
  `DataDodania` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `fk_Projekt_Materialy_Projekt_idx` (`ProjektID`),
  CONSTRAINT `fk_Projekt_Materialy_Projekt` FOREIGN KEY (`ProjektID`) REFERENCES `projekty` (`idProjekty`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='Tabela przechowująca materiały/faktury dla projektów';
