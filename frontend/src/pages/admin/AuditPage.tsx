import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Search as SearchIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';

interface AuditLog {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  details: string;
  ip: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
}

const mockAuditLogs: AuditLog[] = [
  {
    id: 1,
    timestamp: '2025-12-24 14:35:22',
    user: 'Administrador Demo',
    action: 'LOGIN',
    module: 'Autenticação',
    details: 'Login realizado com sucesso',
    ip: '192.168.1.100',
    level: 'SUCCESS',
  },
  {
    id: 2,
    timestamp: '2025-12-24 14:30:15',
    user: 'Maria Silva',
    action: 'CADASTRO_IMOVEL',
    module: 'Cadastro',
    details: 'Novo imóvel cadastrado - Código: 12345',
    ip: '192.168.1.101',
    level: 'INFO',
  },
  {
    id: 3,
    timestamp: '2025-12-24 14:25:08',
    user: 'João Santos',
    action: 'ALTERACAO_ENDERECO',
    module: 'Endereçamento',
    details: 'Endereço SP-SAL-001-0001 atualizado',
    ip: '192.168.1.102',
    level: 'INFO',
  },
  {
    id: 4,
    timestamp: '2025-12-24 14:20:45',
    user: 'Sistema',
    action: 'BACKUP',
    module: 'Sistema',
    details: 'Backup automático realizado',
    ip: '127.0.0.1',
    level: 'SUCCESS',
  },
  {
    id: 5,
    timestamp: '2025-12-24 14:15:33',
    user: 'Carlos Oliveira',
    action: 'LOGIN_FAILED',
    module: 'Autenticação',
    details: 'Tentativa de login falhou - Senha incorreta',
    ip: '192.168.1.105',
    level: 'WARNING',
  },
  {
    id: 6,
    timestamp: '2025-12-24 14:10:20',
    user: 'Ana Costa',
    action: 'CONSULTA_DADOS',
    module: 'Privacidade',
    details: 'Consulta a dados públicos agregados',
    ip: '192.168.1.103',
    level: 'INFO',
  },
  {
    id: 7,
    timestamp: '2025-12-24 14:05:10',
    user: 'Sistema',
    action: 'INTEGRACAO_ERRO',
    module: 'Integração',
    details: 'Falha na sincronização com sistema externo',
    ip: '127.0.0.1',
    level: 'ERROR',
  },
];

export default function AuditPage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [filterModule, setFilterModule] = useState<string>('ALL');

  const filteredLogs = mockAuditLogs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = filterLevel === 'ALL' || log.level === filterLevel;
    const matchesModule = filterModule === 'ALL' || log.module === filterModule;

    return matchesSearch && matchesLevel && matchesModule;
  });

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getLevelIcon = (level: AuditLog['level']) => {
    switch (level) {
      case 'INFO':
        return <InfoIcon fontSize="small" color="info" />;
      case 'WARNING':
        return <WarningIcon fontSize="small" color="warning" />;
      case 'ERROR':
        return <ErrorIcon fontSize="small" color="error" />;
      case 'SUCCESS':
        return <SuccessIcon fontSize="small" color="success" />;
    }
  };

  const getLevelColor = (level: AuditLog['level']) => {
    switch (level) {
      case 'INFO':
        return 'info';
      case 'WARNING':
        return 'warning';
      case 'ERROR':
        return 'error';
      case 'SUCCESS':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Auditoria do Sistema
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Registro completo de todas as ações realizadas no sistema
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" gap={2}>
          <TextField
            fullWidth
            placeholder="Buscar por usuário, ação ou detalhes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Nível</InputLabel>
            <Select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              label="Nível"
            >
              <MenuItem value="ALL">Todos</MenuItem>
              <MenuItem value="INFO">Info</MenuItem>
              <MenuItem value="SUCCESS">Sucesso</MenuItem>
              <MenuItem value="WARNING">Aviso</MenuItem>
              <MenuItem value="ERROR">Erro</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Módulo</InputLabel>
            <Select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              label="Módulo"
            >
              <MenuItem value="ALL">Todos</MenuItem>
              <MenuItem value="Autenticação">Autenticação</MenuItem>
              <MenuItem value="Cadastro">Cadastro</MenuItem>
              <MenuItem value="Endereçamento">Endereçamento</MenuItem>
              <MenuItem value="Privacidade">Privacidade</MenuItem>
              <MenuItem value="Sistema">Sistema</MenuItem>
              <MenuItem value="Integração">Integração</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data/Hora</TableCell>
                <TableCell>Nível</TableCell>
                <TableCell>Usuário</TableCell>
                <TableCell>Ação</TableCell>
                <TableCell>Módulo</TableCell>
                <TableCell>Detalhes</TableCell>
                <TableCell>IP</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLogs
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {log.timestamp}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getLevelIcon(log.level)}
                        <Chip
                          label={log.level}
                          color={getLevelColor(log.level)}
                          size="small"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>{log.user}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {log.action}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={log.module} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{log.details}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {log.ip}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredLogs.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Linhas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Paper>
    </Box>
  );
}
