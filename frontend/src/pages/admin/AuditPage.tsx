import { useState, useEffect } from 'react';
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
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { auditService, type AuditLog } from '../../lib/supabase';

export default function AuditPage() {
  // Estados
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEntityType, setFilterEntityType] = useState<string>('ALL');

  // Estados do diálogo de detalhes
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Estados de feedback
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  // Carregar dados
  useEffect(() => {
    loadLogs();
  }, [page, rowsPerPage, filterEntityType]);

  const loadLogs = async () => {
    try {
      setLoading(true);

      // Buscar logs com filtros e paginação
      const [logsData, count] = await Promise.all([
        auditService.getAll({
          limit: rowsPerPage,
          offset: page * rowsPerPage,
          entity_type: filterEntityType !== 'ALL' ? filterEntityType : undefined,
          action: searchTerm || undefined,
        }),
        auditService.count({
          entity_type: filterEntityType !== 'ALL' ? filterEntityType : undefined,
          action: searchTerm || undefined,
        }),
      ]);

      setLogs(logsData || []);
      setTotalCount(count);
    } catch (error: any) {
      showSnackbar(error.message || 'Erro ao carregar logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: typeof snackbar.severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Paginação
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Detalhes
  const handleOpenDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setDetailsDialogOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsDialogOpen(false);
    setSelectedLog(null);
  };

  // Busca
  const handleSearch = () => {
    setPage(0);
    loadLogs();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Helpers
  const getActionColor = (action: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('create') || actionLower.includes('insert') || actionLower.includes('cadastro')) return 'success';
    if (actionLower.includes('update') || actionLower.includes('edit') || actionLower.includes('alteracao')) return 'info';
    if (actionLower.includes('delete') || actionLower.includes('remove') || actionLower.includes('exclusao')) return 'error';
    if (actionLower.includes('login') || actionLower.includes('logout')) return 'primary';
    if (actionLower.includes('error') || actionLower.includes('fail')) return 'error';
    return 'default';
  };

  const getActionIcon = (action: string) => {
    const color = getActionColor(action);
    switch (color) {
      case 'success':
        return <SuccessIcon fontSize="small" color={color} />;
      case 'error':
        return <ErrorIcon fontSize="small" color={color} />;
      case 'warning':
        return <WarningIcon fontSize="small" color={color} />;
      default:
        return <InfoIcon fontSize="small" color="info" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
  };

  const getUserName = (log: any) => {
    if (log.user?.name) return log.user.name;
    if (log.user_id) return `ID: ${log.user_id}`;
    return 'Sistema';
  };

  if (loading && logs.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Auditoria do Sistema
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Registro completo de todas as ações realizadas no sistema
          </Typography>
        </Box>
        <Tooltip title="Atualizar">
          <IconButton onClick={loadLogs} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Filtros */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" gap={2}>
          <TextField
            fullWidth
            placeholder="Buscar por ação..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <Button onClick={handleSearch} variant="contained" size="small">
                  Buscar
                </Button>
              ),
            }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Tipo de Entidade</InputLabel>
            <Select
              value={filterEntityType}
              onChange={(e) => setFilterEntityType(e.target.value)}
              label="Tipo de Entidade"
            >
              <MenuItem value="ALL">Todos</MenuItem>
              <MenuItem value="users">Usuários</MenuItem>
              <MenuItem value="properties">Imóveis</MenuItem>
              <MenuItem value="addresses">Endereços</MenuItem>
              <MenuItem value="support_tickets">Tickets</MenuItem>
              <MenuItem value="roles">Perfis</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Tabela */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data/Hora</TableCell>
                <TableCell>Usuário</TableCell>
                <TableCell>Ação</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>IP</TableCell>
                <TableCell align="right">Detalhes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(log.created_at)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {getUserName(log)}
                    </Typography>
                    {(log as any).user?.email && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {(log as any).user.email}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getActionIcon(log.action)}
                      <Chip
                        label={log.action}
                        color={getActionColor(log.action)}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    {log.entity_type ? (
                      <Chip label={log.entity_type} size="small" variant="outlined" />
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {log.ip_address || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Ver Detalhes">
                      <IconButton size="small" onClick={() => handleOpenDetails(log)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Linhas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Paper>

      {/* Dialog de Detalhes */}
      <Dialog open={detailsDialogOpen} onClose={handleCloseDetails} maxWidth="md" fullWidth>
        <DialogTitle>Detalhes do Log de Auditoria</DialogTitle>
        <DialogContent>
          {selectedLog && (
            <Box sx={{ pt: 2 }}>
              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Data/Hora
                </Typography>
                <Typography variant="body1">{formatDate(selectedLog.created_at)}</Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Usuário
                </Typography>
                <Typography variant="body1">{getUserName(selectedLog)}</Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Ação
                </Typography>
                <Chip
                  label={selectedLog.action}
                  color={getActionColor(selectedLog.action)}
                  size="small"
                />
              </Box>

              {selectedLog.entity_type && (
                <Box mb={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tipo de Entidade
                  </Typography>
                  <Typography variant="body1">{selectedLog.entity_type}</Typography>
                </Box>
              )}

              {selectedLog.entity_id && (
                <Box mb={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    ID da Entidade
                  </Typography>
                  <Typography variant="body1" fontFamily="monospace">
                    {selectedLog.entity_id}
                  </Typography>
                </Box>
              )}

              {selectedLog.old_values && (
                <Box mb={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Valores Anteriores
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{ p: 2, bgcolor: 'grey.50', overflow: 'auto' }}
                  >
                    <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                      {JSON.stringify(selectedLog.old_values, null, 2)}
                    </pre>
                  </Paper>
                </Box>
              )}

              {selectedLog.new_values && (
                <Box mb={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Novos Valores
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{ p: 2, bgcolor: 'grey.50', overflow: 'auto' }}
                  >
                    <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                      {JSON.stringify(selectedLog.new_values, null, 2)}
                    </pre>
                  </Paper>
                </Box>
              )}

              {selectedLog.ip_address && (
                <Box mb={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Endereço IP
                  </Typography>
                  <Typography variant="body1" fontFamily="monospace">
                    {selectedLog.ip_address}
                  </Typography>
                </Box>
              )}

              {selectedLog.user_agent && (
                <Box mb={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    User Agent
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedLog.user_agent}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
