ALTER TABLE rozliczenia_miesieczne
    ADD COLUMN IF NOT EXISTS Urlop_zalegly_pula DECIMAL(7,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS Nadgodziny_stawka VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS Nadgodziny_unlocked TINYINT(1) DEFAULT 0;
