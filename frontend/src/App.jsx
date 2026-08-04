import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import CadastroPage from './pages/CadastroPage';
import PedidosPage from './pages/PedidosPage';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<CadastroPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/pedidos" element={<PedidosPage />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/pedidos" replace />} />
        <Route path="*" element={<Navigate to="/pedidos" replace />} />
      </Routes>
    </AuthProvider>
  );
}
