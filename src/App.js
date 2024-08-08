import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './App.css';

import LoginPage from './pages/Login';
import HomePage from './pages/Home';
import PracownikPage from './pages/Pracownik/Pracownik';
import ZmienDanePage from './pages/Pracownik/ZmienDane';
import DodajPracownikaPage from './pages/Pracownik/DodajPracownika';
import PodzialPage from './pages/Pracownik/Podzial';
import LogowaniePage from './pages/Pracownik/Logowanie';
import CzasPage from './pages/Czas/CzasPracy';
import AdministracjaPage from './pages/Czas/Administracja';
import ProjektyPage from './pages/Czas/Projekty';
import UrlopyPage from './pages/Czas/Urlopy';
import PojazdyPage from './pages/Czas/Pojazdy';
import TydzienPage from './pages/Czas/Tydzien';
import RaportyPage from './pages/Czas/Raporty';
import PlanTygodniaPage from './pages/PlanTygodnia/PlanTygodnia';
import ZaplanujTydzienPage from './pages/PlanTygodnia/ZaplanujTydzien';
import NowyProjektPage from './pages/Czas/DodajNowy';
import NowaGrupaPage from './pages/Czas/NowaGrupa';
import GrupyProjektowPage from './pages/Czas/GrupyProjektow';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />}>
          <Route path="pracownik" element={<PracownikPage />} />
          <Route path="zmien-dane" element={<ZmienDanePage />} />
          <Route path="dodaj-pracownika" element={<DodajPracownikaPage />} />
          <Route path="podzial" element={<PodzialPage />} />
          <Route path="logowanie" element={<LogowaniePage />} />
          <Route path="czas" element={<CzasPage />} />
          <Route path="administracja" element={<AdministracjaPage />} />
          <Route path="projekty" element={<ProjektyPage />} />
          <Route path="urlopy" element={<UrlopyPage />} />
          <Route path="pojazdy" element={<PojazdyPage />} />
          <Route path="tydzien" element={<TydzienPage />} />
          <Route path="raporty" element={<RaportyPage />} />
          <Route path="plan" element={<PlanTygodniaPage />} />
          <Route path="zaplanuj" element={<ZaplanujTydzienPage />} />
          <Route path="grupy-projektow" element={<GrupyProjektowPage />} />
          <Route path="nowy-projekt" element={<NowyProjektPage />} />
          <Route path="nowa-grupa" element={<NowaGrupaPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
