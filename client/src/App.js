import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './App.css';

import LoginPage from './pages/Login';
import HomePage from './pages/Home';
import PracownikPage from './pages/Pracownik/Pracownik';
import ZmienDanePage from './pages/Pracownik/ZmienDane';
import DodajPracownikaPage from './pages/Pracownik/DodajPracownika';
import EdytujPracownikaPage from './pages/Pracownik/EdytujPracownika';
import ZablokowaniPage from './pages/Pracownik/ZablokowaniPage';
import LogowaniePage from './pages/Pracownik/Logowanie';
import CzasPage from './pages/Czas/CzasPracy';
import ProjektyPage from './pages/Czas/Projekty';
import UrlopyPage from './pages/Czas/Urlopy';
import PojazdyPage from './pages/Czas/Pojazdy';
import ArchiwumPage from './pages/Czas/Archiwum';
import TydzienPage from './pages/Czas/Tydzien';
import RaportyPage from './pages/Czas/Raporty';
import PlanTygodniaPage from './pages/PlanTygodnia/PlanTygodnia';
import ZaplanujTydzienPage from './pages/PlanTygodnia/ZaplanujTydzien';
import NowyProjektPage from './pages/Czas/DodajNowyProjekt';
import EdytujProjektPage from './pages/Czas/EdytujProjekt';
import NowaGrupaPage from './pages/Czas/NowaGrupa';
import GrupyProjektowPage from './pages/Czas/GrupyProjektow';
import NowyPojazdPage from './pages/Czas/NowyPojazd';
import SprawdzSamochodPage from './pages/Czas/SprawdzSamochod';
import OgloszeniaPage from './pages/Ogloszenia';

import VacationPlanner from './Components/VacationPlanner copy';
import EdytujGrupePage from './pages/Czas/EdytujGrupe';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/test" element={<VacationPlanner />} />
        <Route path="/home" element={<HomePage />}>
          <Route path="pracownik" element={<PracownikPage />} />
          <Route path="zmien-dane" element={<ZmienDanePage />} />
          <Route path="dodaj-pracownika" element={<DodajPracownikaPage />} />
          <Route path="edytuj-pracownika/:id" element={<EdytujPracownikaPage />} />
          <Route path="zablokowani-pracownicy" element={<ZablokowaniPage />} />
          <Route path="logowanie" element={<LogowaniePage />} />
          <Route path="czas" element={<CzasPage />} />
          <Route path="projekty" element={<ProjektyPage />} />
          <Route path="urlopy" element={<UrlopyPage />} />
          <Route path="pojazdy" element={<PojazdyPage />} />
          <Route path="archiwum" element={<ArchiwumPage />} />
          <Route path="tydzien" element={<TydzienPage />} />
          <Route path="raporty" element={<RaportyPage />} />
          <Route path="plan" element={<PlanTygodniaPage />} />
          <Route path="zaplanuj" element={<ZaplanujTydzienPage />} />
          <Route path="grupy-projektow" element={<GrupyProjektowPage />} />
          <Route path="nowy-projekt" element={<NowyProjektPage />} />
          <Route path="projekt/:id" element={<EdytujProjektPage />} />
          <Route path="nowa-grupa" element={<NowaGrupaPage />} />
          <Route path="grupa/:id" element={<EdytujGrupePage />} />
          <Route path="nowy-pojazd" element={<NowyPojazdPage />} />
          <Route path="sprawdzsamochod" element={<SprawdzSamochodPage />} />
          <Route path="ogloszenia" element={<OgloszeniaPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
