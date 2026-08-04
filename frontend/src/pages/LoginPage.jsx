import { useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import { useAuth } from '../context/AuthContext';
import ThemeToggleButton from '../components/ThemeToggleButton';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      await login(email, senha);
      const destino = location.state?.from?.pathname ?? '/pedidos';
      navigate(destino, { replace: true });
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
        position: 'relative',
      }}
    >
      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
        <ThemeToggleButton />
      </Box>
      <Paper elevation={0} variant="outlined" sx={{ p: 4, width: 380, maxWidth: '100%' }}>
        <Stack spacing={1} sx={{ alignItems: 'center', mb: 3 }}>
          <LocalShippingRoundedIcon color="primary" sx={{ fontSize: 36 }} />
          <Typography variant="h5" fontWeight={700}>
            Entrar
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Acesse para acompanhar e gerenciar os pedidos
          </Typography>
        </Stack>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={2}>
            {erro && <Alert severity="error">{erro}</Alert>}
            <TextField
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              fullWidth
            />
            <TextField
              label="Senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              fullWidth
            />
            <Button type="submit" variant="contained" size="large" disabled={carregando} fullWidth>
              {carregando ? 'Entrando...' : 'Entrar'}
            </Button>
          </Stack>
        </Box>

        <Typography variant="body2" textAlign="center" sx={{ mt: 3 }}>
          Ainda não tem conta?{' '}
          <Link component={RouterLink} to="/cadastro">
            Cadastre-se
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
