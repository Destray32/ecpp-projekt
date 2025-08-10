USE mydb;
UPDATE dzien_projekty
SET Godziny_przepracowane = 
    FLOOR(Godziny_przepracowane) + 
    CASE 
        WHEN ROUND((Godziny_przepracowane - FLOOR(Godziny_przepracowane)) * 100) = 50 THEN 0.3
        WHEN ROUND((Godziny_przepracowane - FLOOR(Godziny_przepracowane)) * 100) = 25 THEN 0.15
        WHEN ROUND((Godziny_przepracowane - FLOOR(Godziny_przepracowane)) * 100) = 75 THEN 0.45
        ELSE (Godziny_przepracowane - FLOOR(Godziny_przepracowane)) -- pozostaw inne wartości bez zmian
    END
WHERE (Godziny_przepracowane - FLOOR(Godziny_przepracowane)) > 0;
