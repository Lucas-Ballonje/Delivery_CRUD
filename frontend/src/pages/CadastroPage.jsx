import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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

export default function CadastroPage() {
  const { cadastrar, login } = useAuth();
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      await cadastrar(nome, email, senha);
      await login(email, senha);
      navigate('/pedidos', { replace: true });
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
            Criar conta
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Cadastre-se para começar a criar e acompanhar pedidos
          </Typography>
        </Stack>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={2}>
            {erro && <Alert severity="error">{erro}</Alert>}
            <TextField
              label="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              autoFocus
              fullWidth
            />
            <TextField
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
              {carregando ? 'Criando conta...' : 'Criar conta'}
            </Button>
          </Stack>
        </Box>

        <Typography variant="body2" textAlign="center" sx={{ mt: 3 }}>
          Já tem conta?{' '}
          <Link component={RouterLink} to="/login">
            Entrar
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
