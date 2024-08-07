import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './App.css';

import LoginPage from './pages/Login';
import HomePage from './pages/Home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
