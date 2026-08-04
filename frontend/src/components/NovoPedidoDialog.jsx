import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import AddRoundedIcon from '@mui/icons-material/AddRounded';

const ESTADO_INICIAL = { cliente: '', enderecoEntrega: '', itemAtual: '', itens: [] };

export default function NovoPedidoDialog({ open, onClose, onCriar }) {
  const [form, setForm] = useState(ESTADO_INICIAL);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  function fechar() {
    setForm(ESTADO_INICIAL);
    setErro('');
    onClose();
  }

  function adicionarItem() {
    const item = form.itemAtual.trim();
    if (!item) return;
    setForm((f) => ({ ...f, itens: [...f.itens, item], itemAtual: '' }));
  }

  function removerItem(index) {
    setForm((f) => ({ ...f, itens: f.itens.filter((_, i) => i !== index) }));
  }

  function handleItemKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      adicionarItem();
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErro('');

    if (!form.cliente.trim() || !form.enderecoEntrega.trim()) {
      setErro('Preencha cliente e endereço de entrega.');
      return;
    }
    if (form.itens.length === 0) {
      setErro('Adicione ao menos um item ao pedido.');
      return;
    }

    setSalvando(true);
    try {
      await onCriar({
        cliente: form.cliente.trim(),
        enderecoEntrega: form.enderecoEntrega.trim(),
        itens: form.itens,
      });
      fechar();
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Dialog open={open} onClose={fechar} fullWidth maxWidth="sm">
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogTitle fontWeight={700}>Novo pedido</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            {erro && <Alert severity="error">{erro}</Alert>}
            <TextField
              label="Cliente"
              value={form.cliente}
              onChange={(e) => setForm((f) => ({ ...f, cliente: e.target.value }))}
              required
              autoFocus
              fullWidth
            />
            <TextField
              label="Endereço de entrega"
              value={form.enderecoEntrega}
              onChange={(e) => setForm((f) => ({ ...f, enderecoEntrega: e.target.value }))}
              required
              fullWidth
            />

            <Box>
              <Stack direction="row" spacing={1}>
                <TextField
                  label="Adicionar item"
                  value={form.itemAtual}
                  onChange={(e) => setForm((f) => ({ ...f, itemAtual: e.target.value }))}
                  onKeyDown={handleItemKeyDown}
                  placeholder="ex: Pizza"
                  fullWidth
                  size="small"
                />
                <Button
                  onClick={adicionarItem}
                  variant="outlined"
                  size="small"
                  startIcon={<AddRoundedIcon />}
                  sx={{ whiteSpace: 'nowrap', px: 2 }}
                >
                  Adicionar
                </Button>
              </Stack>

              <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1, minHeight: 32 }}>
                {form.itens.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Nenhum item adicionado ainda.
                  </Typography>
                ) : (
                  form.itens.map((item, index) => (
                    <Chip key={`${item}-${index}`} label={item} onDelete={() => removerItem(index)} />
                  ))
                )}
              </Box>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={fechar} disabled={salvando}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={salvando}>
            {salvando ? 'Criando...' : 'Criar pedido'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
