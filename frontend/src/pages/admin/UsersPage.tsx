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
  Button,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
} from '@mui/icons-material';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'Ativo' | 'Inativo' | 'Bloqueado';
  lastAccess: string;
}

const mockUsers: User[] = [
  {
    id: 1,
    name: 'Administrador Demo',
    email: 'admin@salesopolis.sp.gov.br',
    role: 'ADMIN',
    status: 'Ativo',
    lastAccess: '2025-12-24 14:30',
  },
  {
    id: 2,
    name: 'Maria Silva',
    email: 'maria.silva@salesopolis.sp.gov.br',
    role: 'GESTOR',
    status: 'Ativo',
    lastAccess: '2025-12-24 10:15',
  },
  {
    id: 3,
    name: 'João Santos',
    email: 'joao.santos@salesopolis.sp.gov.br',
    role: 'OPERADOR',
    status: 'Ativo',
    lastAccess: '2025-12-23 16:45',
  },
  {
    id: 4,
    name: 'Ana Costa',
    email: 'ana.costa@salesopolis.sp.gov.br',
    role: 'CONSULTA',
    status: 'Ativo',
    lastAccess: '2025-12-24 09:20',
  },
  {
    id: 5,
    name: 'Carlos Oliveira',
    email: 'carlos.oliveira@salesopolis.sp.gov.br',
    role: 'OPERADOR',
    status: 'Inativo',
    lastAccess: '2025-12-10 11:30',
  },
];

export default function UsersPage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = mockUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'Ativo':
        return 'success';
      case 'Inativo':
        return 'default';
      case 'Bloqueado':
        return 'error';
      default:
        return 'default';
    }
  };

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      ADMIN: 'Administrador',
      GESTOR: 'Gestor',
      OPERADOR: 'Operador',
      CONSULTA: 'Consulta',
    };
    return roles[role] || role;
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Gestão de Usuários
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Controle de acesso e permissões dos usuários do sistema
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} size="large">
          Novo Usuário
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar por nome, email ou perfil..."
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
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Usuário</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Perfil</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Último Acesso</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {user.name.charAt(0)}
                        </Avatar>
                        <Typography variant="body2" fontWeight={500}>
                          {user.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip label={getRoleLabel(user.role)} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status}
                        color={getStatusColor(user.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {user.lastAccess}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Editar">
                        <IconButton size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={user.status === 'Ativo' ? 'Bloquear' : 'Desbloquear'}>
                        <IconButton size="small" color={user.status === 'Ativo' ? 'warning' : 'success'}>
                          {user.status === 'Ativo' ? <LockIcon fontSize="small" /> : <LockOpenIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton size="small" color="error">
                          <DeleteIcon fontSize="small" />
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
          count={filteredUsers.length}
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
