import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Registro } from './pages/Registro';
import { Onboarding } from './pages/Onboarding';
import { Home } from './pages/Home';
import { Biblioteca } from './pages/Biblioteca';
import { JogoDetalhe } from './pages/JogoDetalhe';
import { PerfilPublico } from './pages/PerfilPublico';
import { Wrapped } from './pages/Wrapped';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding" element={<Onboarding />} />

        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/biblioteca" element={<Biblioteca />} />
          <Route path="/jogo/:id" element={<JogoDetalhe />} />
          <Route path="/u/:username" element={<PerfilPublico />} />
          <Route path="/wrapped" element={<Wrapped />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
