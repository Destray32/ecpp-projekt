-- Dodanie tabeli do przechowywania indywidualnych stawek pracowników
CREATE TABLE `pracownik_stawki` (
  `idPracownik_stawki` int NOT NULL AUTO_INCREMENT,
  `FK_idPracownik` int NOT NULL,
  `FK_idGrupa_urlopowa` int NOT NULL,
  `stawka_indywidualna` decimal(10,2) DEFAULT NULL,
  `aktywna` tinyint(1) NOT NULL DEFAULT '1',
  `data_utworzenia` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `data_modyfikacji` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`idPracownik_stawki`),
  UNIQUE KEY `UK_Pracownik_Grupa` (`FK_idPracownik`, `FK_idGrupa_urlopowa`),
  KEY `fk_Pracownik_stawki_Pracownik1_idx` (`FK_idPracownik`),
  KEY `fk_Pracownik_stawki_Grupa1_idx` (`FK_idGrupa_urlopowa`),
  CONSTRAINT `fk_Pracownik_stawki_Pracownik1` FOREIGN KEY (`FK_idPracownik`) REFERENCES `pracownik` (`idPracownik`) ON DELETE CASCADE,
  CONSTRAINT `fk_Pracownik_stawki_Grupa1` FOREIGN KEY (`FK_idGrupa_urlopowa`) REFERENCES `grupa_urlopowa` (`idGrupa_urlopowa`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='Tabela przechowująca indywidualne stawki pracowników dla różnych zleceniodawców';
