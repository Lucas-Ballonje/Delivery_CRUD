import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import StatusChip from './StatusChip';
import { STATUS_INFO, STATUS_ORDEM } from '../status';

const formatadorData = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function formatarData(iso) {
  try {
    return formatadorData.format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function PedidoCard({ pedido, onChangeStatus, onExcluir, atualizando }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="overline" color="text.secondary">
              Pedido #{pedido.id}
            </Typography>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
              <PersonRoundedIcon fontSize="small" color="action" />
              <Typography variant="h6" fontWeight={700}>
                {pedido.cliente}
              </Typography>
            </Stack>
          </Box>
          <Stack direction="row" spacing={0.25} sx={{ alignItems: 'center' }}>
            <StatusChip status={pedido.status} />
            <Tooltip title="Excluir pedido">
              <IconButton
                size="small"
                color="error"
                onClick={() => onExcluir(pedido)}
                disabled={atualizando}
                sx={{ p: 0.5 }}
              >
                <DeleteOutlineRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'flex-start', mt: 1.5 }}>
          <PlaceRoundedIcon fontSize="small" color="action" sx={{ mt: '2px' }} />
          <Typography variant="body2" color="text.secondary">
            {pedido.enderecoEntrega}
          </Typography>
        </Stack>

        <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {pedido.itens.map((item, index) => (
            <Chip key={`${item}-${index}`} label={item} size="small" variant="outlined" />
          ))}
        </Box>

        <Stack
          direction="row"
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 2,
            pt: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Criado em {formatarData(pedido.criadoEm)}
          </Typography>

          <FormControl size="small" sx={{ minWidth: 190 }}>
            <Select
              value={pedido.status}
              disabled={atualizando}
              onChange={(e) => onChangeStatus(pedido.id, e.target.value)}
            >
              {STATUS_ORDEM.map((status) => (
                <MenuItem key={status} value={status}>
                  {STATUS_INFO[status].label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </CardContent>
    </Card>
  );
}
