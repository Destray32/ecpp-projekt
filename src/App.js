import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './App.css';

import LoginPage from './pages/Login';
import HomePage from './pages/Home';
import PodzialPage from './pages/Podzial';
import PracownikPage from './pages/Pracownik';
import LogowaniePage from './pages/Logowanie';
import CzasPage from './pages/ZakladkaCzas/czaspracy';
import CzasPracyPage from './pages/ZakladkaCzas/czaspracy';
import AdministracjaPage from './pages/ZakladkaCzas/administracja';
import TydzienPage from './pages/ZakladkaCzas/tydzien';
import RaportyPage from './pages/ZakladkaCzas/raporty';
import SprawdzSamochodPage from './pages/ZakladkaCzas/sprawdzsamochod';
import ProjektyPage from './pages/ZakladkaCzas/ZakladkaAdministracja/Projekty';
import UrlopyPage from './pages/ZakladkaCzas/ZakladkaAdministracja/Urlopy';
import PojazdyPage from './pages/ZakladkaCzas/ZakladkaAdministracja/Pojazdy';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />}>
          <Route path="pracownik" element={<PracownikPage />} />
          <Route path="podzial" element={<PodzialPage />} />
          <Route path="logowanie" element={<LogowaniePage />} />

        </Route>
        <Route path="/czas" element={<CzasPage />} >
          <Route path="/czas" element={<CzasPracyPage />} />
          <Route path="administracja" element={<AdministracjaPage />} />
          <Route path="tydzien" element={<TydzienPage />} />
          <Route path="raporty" element={<RaportyPage />} />
          <Route path="sprawdzsamochod" element={<SprawdzSamochodPage />} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
