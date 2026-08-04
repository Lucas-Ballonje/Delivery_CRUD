import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';

export default function ConfirmarExclusaoDialog({ pedido, onClose, onConfirmar }) {
  const [erro, setErro] = useState('');
  const [excluindo, setExcluindo] = useState(false);

  async function handleConfirmar() {
    setErro('');
    setExcluindo(true);
    try {
      await onConfirmar(pedido.id);
      onClose();
    } catch (err) {
      setErro(err.message);
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <Dialog open={Boolean(pedido)} onClose={excluindo ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle fontWeight={700}>Excluir pedido</DialogTitle>
      <DialogContent>
        {erro && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {erro}
          </Alert>
        )}
        <DialogContentText>
          Tem certeza que deseja excluir o pedido {pedido ? `#${pedido.id} (${pedido.cliente})` : ''}? Essa ação não
          pode ser desfeita.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={excluindo}>
          Cancelar
        </Button>
        <Button onClick={handleConfirmar} color="error" variant="contained" disabled={excluindo}>
          {excluindo ? 'Excluindo...' : 'Excluir'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
