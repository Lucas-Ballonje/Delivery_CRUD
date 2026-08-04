import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggleButton from './ThemeToggleButton';

export default function Layout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  function sair() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <Box sx={{ minHeight: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <AppBar position="static" color="default" sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar>
          <LocalShippingRoundedIcon color="primary" sx={{ mr: 1.5 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Sistema de Entregas
          </Typography>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            {usuario && (
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
                  {usuario.nome?.[0]?.toUpperCase() ?? '?'}
                </Avatar>
                <Typography variant="body2" color="text.secondary">
                  {usuario.nome}
                </Typography>
              </Stack>
            )}
            <ThemeToggleButton />
            <Button variant="outlined" size="small" onClick={sair}>
              Sair
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
