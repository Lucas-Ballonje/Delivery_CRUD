import Chip from '@mui/material/Chip';
import { STATUS_INFO } from '../status';

export default function StatusChip({ status }) {
  const info = STATUS_INFO[status] ?? { label: status, cor: 'default' };
  return <Chip label={info.label} color={info.cor} size="small" sx={{ fontWeight: 600 }} />;
}
