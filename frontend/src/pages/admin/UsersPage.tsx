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
  Button,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  VpnKey as VpnKeyIcon,
} from '@mui/icons-material';
import { usersService, rolesService, type User, type Role } from '../../lib/supabase';

export default function UsersPage() {
  // Estados
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados do diálogo
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'password'>('create');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Estados do formulário
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role_id: '',
    is_active: true,
  });

  // Estados de feedback
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, rolesData] = await Promise.all([
        usersService.getAll(),
        rolesService.getAll(),
      ]);
      setUsers(usersData || []);
      setRoles(rolesData || []);
    } catch (error: any) {
      showSnackbar(error.message || 'Erro ao carregar dados', 'error');
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

  // Filtrar usuários
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginação
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Diálogos
  const handleOpenCreate = () => {
    setDialogMode('create');
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role_id: roles[0]?.id || '',
      is_active: true,
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setDialogMode('edit');
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Senha nunca é carregada por segurança
      role_id: user.role_id,
      is_active: user.is_active,
    });
    setDialogOpen(true);
  };

  const handleOpenPassword = (user: User) => {
    setDialogMode('password');
    setSelectedUser(user);
    setFormData({
      name: '',
      email: '',
      password: '',
      role_id: '',
      is_active: true,
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
  };

  // CRUD Operations
  const handleSave = async () => {
    try {
      if (dialogMode === 'create') {
        // Criar novo usuário
        if (!formData.password) {
          showSnackbar('Senha é obrigatória', 'error');
          return;
        }
        await usersService.create({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role_id: formData.role_id,
          is_active: formData.is_active,
        });
        showSnackbar('Usuário criado com sucesso!', 'success');
      } else if (dialogMode === 'edit' && selectedUser) {
        // Atualizar usuário
        await usersService.update(selectedUser.id, {
          email: formData.email,
          name: formData.name,
          role_id: formData.role_id,
          is_active: formData.is_active,
        });

        // Se a senha foi preenchida, atualizar também
        if (formData.password.trim()) {
          await usersService.updatePassword(selectedUser.id, formData.password);
          showSnackbar('Usuário e senha atualizados com sucesso!', 'success');
        } else {
          showSnackbar('Usuário atualizado com sucesso!', 'success');
        }
      } else if (dialogMode === 'password' && selectedUser) {
        // Atualizar senha
        if (!formData.password) {
          showSnackbar('Nova senha é obrigatória', 'error');
          return;
        }
        await usersService.updatePassword(selectedUser.id, formData.password);
        showSnackbar('Senha atualizada com sucesso!', 'success');
      }

      handleCloseDialog();
      loadData();
    } catch (error: any) {
      showSnackbar(error.message || 'Erro ao salvar', 'error');
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await usersService.toggleActive(user.id, !user.is_active);
      showSnackbar(
        `Usuário ${!user.is_active ? 'ativado' : 'desativado'} com sucesso!`,
        'success'
      );
      loadData();
    } catch (error: any) {
      showSnackbar(error.message || 'Erro ao alterar status', 'error');
    }
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário ${user.name}?`)) {
      return;
    }

    try {
      await usersService.delete(user.id);
      showSnackbar('Usuário excluído com sucesso!', 'success');
      loadData();
    } catch (error: any) {
      showSnackbar(error.message || 'Erro ao excluir usuário', 'error');
    }
  };

  const getRoleName = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    return role?.description || role?.name || 'N/A';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Nunca';
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
  };

  const getInitials = (name: string) => {
    const words = name.split(' ');
    if (words.length >= 2) {
      return words[0][0] + words[1][0];
    }
    return name.substring(0, 2);
  };

  if (loading) {
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
            Gestão de Usuários
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Controle de acesso e permissões dos usuários do sistema
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="large"
          onClick={handleOpenCreate}
        >
          Novo Usuário
        </Button>
      </Box>

      {/* Search */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar por nome ou email..."
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

      {/* Table */}
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
                          {getInitials(user.name)}
                        </Avatar>
                        <Typography variant="body2" fontWeight={500}>
                          {user.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={getRoleName(user.role_id)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.is_active ? 'Ativo' : 'Inativo'}
                        color={user.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(user.last_login || '')}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => handleOpenEdit(user)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Alterar Senha">
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => handleOpenPassword(user)}
                        >
                          <VpnKeyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={user.is_active ? 'Desativar' : 'Ativar'}>
                        <IconButton
                          size="small"
                          color={user.is_active ? 'warning' : 'success'}
                          onClick={() => handleToggleActive(user)}
                        >
                          {user.is_active ? (
                            <LockIcon fontSize="small" />
                          ) : (
                            <LockOpenIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(user)}
                        >
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

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' && 'Novo Usuário'}
          {dialogMode === 'edit' && 'Editar Usuário'}
          {dialogMode === 'password' && 'Alterar Senha'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {dialogMode === 'password' ? (
              <>
                <Alert severity="info">
                  Alterando senha de: <strong>{selectedUser?.name}</strong>
                </Alert>
                <TextField
                  fullWidth
                  label="Nova Senha"
                  type="text"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  helperText="Digite a nova senha para este usuário"
                  required
                />
              </>
            ) : (
              <>
                <TextField
                  fullWidth
                  label="Nome Completo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                {/* Campo de senha */}
                <TextField
                  fullWidth
                  label={dialogMode === 'create' ? 'Senha' : 'Nova Senha (opcional)'}
                  type="text"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required={dialogMode === 'create'}
                  helperText={
                    dialogMode === 'create'
                      ? 'Digite uma senha forte'
                      : 'Deixe em branco para manter a senha atual'
                  }
                />
                <FormControl fullWidth>
                  <InputLabel>Perfil</InputLabel>
                  <Select
                    value={formData.role_id}
                    label="Perfil"
                    onChange={(e) =>
                      setFormData({ ...formData, role_id: e.target.value })
                    }
                  >
                    {roles.map((role) => (
                      <MenuItem key={role.id} value={role.id}>
                        {role.description || role.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.is_active ? 'active' : 'inactive'}
                    label="Status"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_active: e.target.value === 'active',
                      })
                    }
                  >
                    <MenuItem value="active">Ativo</MenuItem>
                    <MenuItem value="inactive">Inativo</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">
            Salvar
          </Button>
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
