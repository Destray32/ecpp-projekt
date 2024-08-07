import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './App.css';

import LoginPage from './pages/Login';
import HomePage from './pages/Home';
import PodzialPage from './pages/Podzial';
import PracownikPage from './pages/Pracownik';
import LogowaniePage from './pages/Logowanie';

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
