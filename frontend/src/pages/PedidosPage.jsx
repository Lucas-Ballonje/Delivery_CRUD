import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import { useAuth } from '../context/AuthContext';
import { listarPedidos, criarPedido, atualizarStatusPedido, excluirPedido } from '../api/pedidos';
import PedidoCard from '../components/PedidoCard';
import NovoPedidoDialog from '../components/NovoPedidoDialog';
import ConfirmarExclusaoDialog from '../components/ConfirmarExclusaoDialog';

const INTERVALO_ATUALIZACAO_MS = 5000;

export default function PedidosPage() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [dialogAberto, setDialogAberto] = useState(false);
  const [idsAtualizando, setIdsAtualizando] = useState(() => new Set());
  const [mensagem, setMensagem] = useState('');
  const [pedidoParaExcluir, setPedidoParaExcluir] = useState(null);
  const [buscaId, setBuscaId] = useState('');

  // Se a sessão expirou (token inválido no back-end, ex: servidor reiniciou),
  // desloga e manda pro login em vez de mostrar um erro genérico.
  function tratarErroDeSessao(err) {
    if (err.status === 401) {
      logout();
      navigate('/login', { replace: true });
      return true;
    }
    return false;
  }

  // mostrarLoading=false é usado na atualização automática em segundo plano,
  // pra não ficar piscando o spinner de carregamento a cada poll.
  const carregarPedidos = useCallback(
    async (mostrarLoading = true) => {
      if (mostrarLoading) setCarregando(true);
      setErro('');
      try {
        const dados = await listarPedidos(token);
        setPedidos([...dados].sort((a, b) => b.id - a.id));
      } catch (err) {
        if (!tratarErroDeSessao(err)) setErro(err.message);
      } finally {
        if (mostrarLoading) setCarregando(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [token],
  );

  useEffect(() => {
    carregarPedidos();
  }, [carregarPedidos]);

  // Atualiza a lista periodicamente, pra pegar pedidos criados fora do
  // front-end (direto na API, por outro cliente, etc.) sem precisar recarregar.
  useEffect(() => {
    const intervalId = setInterval(() => carregarPedidos(false), INTERVALO_ATUALIZACAO_MS);
    return () => clearInterval(intervalId);
  }, [carregarPedidos]);

  const pedidosFiltrados = useMemo(() => {
    const termo = buscaId.trim();
    if (!termo) return pedidos;
    return pedidos.filter((p) => String(p.id).includes(termo));
  }, [pedidos, buscaId]);

  async function handleCriarPedido(dadosPedido) {
    try {
      const novoPedido = await criarPedido(dadosPedido, token);
      setPedidos((atuais) => [novoPedido, ...atuais]);
      setMensagem('Pedido criado com sucesso.');
    } catch (err) {
      if (tratarErroDeSessao(err)) return;
      throw err;
    }
  }

  async function handleExcluirPedido(id) {
    try {
      await excluirPedido(id, token);
      setPedidos((atuais) => atuais.filter((p) => p.id !== id));
      setMensagem(`Pedido #${id} excluído.`);
    } catch (err) {
      if (tratarErroDeSessao(err)) return;
      throw err;
    }
  }

  async function handleChangeStatus(id, novoStatus) {
    setIdsAtualizando((atuais) => new Set(atuais).add(id));
    try {
      const pedidoAtualizado = await atualizarStatusPedido(id, novoStatus, token);
      setPedidos((atuais) => atuais.map((p) => (p.id === id ? pedidoAtualizado : p)));
      setMensagem(`Status do pedido #${id} atualizado.`);
    } catch (err) {
      if (!tratarErroDeSessao(err)) setErro(err.message);
    } finally {
      setIdsAtualizando((atuais) => {
        const copia = new Set(atuais);
        copia.delete(id);
        return copia;
      });
    }
  }

  return (
    <Box>
      <Stack
        direction="row"
        sx={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Pedidos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Acompanhe e atualize o status dos pedidos em tempo real
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Tooltip title="Atualizar lista">
            <IconButton
              onClick={() => carregarPedidos(true)}
              disabled={carregando}
              size="small"
              sx={{ border: 1, borderColor: 'divider' }}
            >
              <RefreshRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setDialogAberto(true)}>
            Novo pedido
          </Button>
        </Stack>
      </Stack>

      <TextField
        value={buscaId}
        onChange={(e) => setBuscaId(e.target.value)}
        placeholder="Buscar pedido pelo ID..."
        size="small"
        sx={{ mb: 3, maxWidth: 320, width: '100%' }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
            endAdornment: buscaId && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setBuscaId('')} sx={{ p: 0.5 }}>
                  <CloseRoundedIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      {erro && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErro('')}>
          {erro}
        </Alert>
      )}

      {carregando ? (
        <Stack sx={{ alignItems: 'center', py: 8 }}>
          <CircularProgress />
        </Stack>
      ) : pedidos.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 6, textAlign: 'center' }}>
          <Inventory2RoundedIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
          <Typography variant="h6">Nenhum pedido ainda</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Crie o primeiro pedido para começar a acompanhar as entregas.
          </Typography>
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setDialogAberto(true)}>
            Novo pedido
          </Button>
        </Paper>
      ) : pedidosFiltrados.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 6, textAlign: 'center' }}>
          <SearchRoundedIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
          <Typography variant="h6">Nenhum pedido encontrado</Typography>
          <Typography variant="body2" color="text.secondary">
            Não existe pedido com ID contendo "{buscaId.trim()}".
          </Typography>
        </Paper>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            gap: 2,
          }}
        >
          {pedidosFiltrados.map((pedido) => (
            <PedidoCard
              key={pedido.id}
              pedido={pedido}
              onChangeStatus={handleChangeStatus}
              onExcluir={setPedidoParaExcluir}
              atualizando={idsAtualizando.has(pedido.id)}
            />
          ))}
        </Box>
      )}

      <NovoPedidoDialog open={dialogAberto} onClose={() => setDialogAberto(false)} onCriar={handleCriarPedido} />

      <ConfirmarExclusaoDialog
        pedido={pedidoParaExcluir}
        onClose={() => setPedidoParaExcluir(null)}
        onConfirmar={handleExcluirPedido}
      />

      <Snackbar
        open={Boolean(mensagem)}
        autoHideDuration={3000}
        onClose={() => setMensagem('')}
        message={mensagem}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </Box>
  );
}
