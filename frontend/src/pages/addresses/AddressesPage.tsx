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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  LocationOn as LocationIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

interface Address {
  id: string;
  digital_code: string;
  street: string;
  number?: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  coordinates?: any;
  status: string;
  verified: boolean;
  created_at: string;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);

  const [formData, setFormData] = useState({
    digital_code: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: 'Salesópolis',
    state: 'SP',
    zip_code: '',
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  async function loadAddresses() {
    try {
      setLoading(true);
      const { supabase } = await import('@/lib/supabase');

      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAddresses(data || []);
      console.log(`✅ ${data?.length || 0} endereços carregados`);
    } catch (error) {
      console.error('Erro ao carregar endereços:', error);
      toast.error('Erro ao carregar endereços');
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(address: Address) {
    setEditingAddress(address);
    setFormData({
      digital_code: address.digital_code,
      street: address.street,
      number: address.number || '',
      complement: address.complement || '',
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      zip_code: address.zip_code,
    });
    setOpenDialog(true);
  }

  function handleDeleteClick(address: Address) {
    setAddressToDelete(address);
    setOpenDeleteDialog(true);
  }

  async function handleDelete() {
    if (!addressToDelete) return;

    try {
      const { supabase } = await import('@/lib/supabase');

      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressToDelete.id);

      if (error) throw error;

      toast.success('Endereço excluído com sucesso!');
      setOpenDeleteDialog(false);
      setAddressToDelete(null);
      loadAddresses();
    } catch (error) {
      console.error('Erro ao excluir endereço:', error);
      toast.error('Erro ao excluir endereço');
    }
  }

  async function handleCepBlur() {
    const cep = formData.zip_code.replace(/\D/g, '');

    if (cep.length !== 8) return;

    try {
      setLoadingCep(true);
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast.error('CEP não encontrado');
        return;
      }

      setFormData({
        ...formData,
        street: data.logradouro || formData.street,
        neighborhood: data.bairro || formData.neighborhood,
        city: data.localidade || formData.city,
        state: data.uf || formData.state,
      });

      toast.success('CEP encontrado!');
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      toast.error('Erro ao buscar CEP');
    } finally {
      setLoadingCep(false);
    }
  }

  async function handleSaveAddress() {
    try {
      setSaving(true);
      const { supabase } = await import('@/lib/supabase');

      if (!formData.digital_code || !formData.street || !formData.neighborhood || !formData.zip_code) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      const addressData = {
        digital_code: formData.digital_code,
        street: formData.street,
        number: formData.number || null,
        complement: formData.complement || null,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code,
        status: 'active',
        verified: false,
      };

      const { error } = editingAddress
        ? await supabase.from('addresses').update(addressData).eq('id', editingAddress.id)
        : await supabase.from('addresses').insert(addressData);

      if (error) {
        if (error.code === '23505') {
          toast.error('Código digital já existe');
        } else {
          throw error;
        }
        return;
      }

      toast.success(editingAddress ? 'Endereço atualizado com sucesso!' : 'Endereço cadastrado com sucesso!');
      setOpenDialog(false);
      resetForm();
      loadAddresses();
    } catch (error: any) {
      console.error('Erro ao salvar endereço:', error);

      if (error?.code === '42501' || error?.message?.includes('row-level security')) {
        toast.error(
          '🔒 Erro de Permissão: Execute o SQL de correção no Supabase! Veja database/FIX_401_ERROR.md',
          { autoClose: 8000 }
        );
      } else {
        toast.error('Erro ao salvar endereço');
      }
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setFormData({
      digital_code: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: 'Salesópolis',
      state: 'SP',
      zip_code: '',
    });
    setEditingAddress(null);
  }

  const filteredAddresses = addresses.filter(
    (addr) =>
      addr.digital_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      addr.street.toLowerCase().includes(searchTerm.toLowerCase()) ||
      addr.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()) ||
      addr.zip_code.includes(searchTerm)
  );

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (verified: boolean) => {
    return verified ? 'success' : 'warning';
  };

  const getStatusLabel = (verified: boolean) => {
    return verified ? 'Verificado' : 'Pendente';
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Endereços Digitais
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sistema de endereçamento digital único para Salesópolis
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="large"
          onClick={() => {
            resetForm();
            setOpenDialog(true);
          }}
        >
          Novo Endereço
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar por código digital, logradouro, bairro ou CEP..."
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
                <TableCell>Código Digital</TableCell>
                <TableCell>Logradouro</TableCell>
                <TableCell>Número</TableCell>
                <TableCell>Bairro</TableCell>
                <TableCell>CEP</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAddresses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography variant="body2" color="text.secondary">
                      Nenhum endereço encontrado
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAddresses
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((address) => (
                    <TableRow key={address.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <LocationIcon color="primary" fontSize="small" />
                          <Typography variant="body2" fontWeight={500}>
                            {address.digital_code}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{address.street}</TableCell>
                      <TableCell>{address.number || 'S/N'}</TableCell>
                      <TableCell>{address.neighborhood}</TableCell>
                      <TableCell>{address.zip_code}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(address.verified)}
                          color={getStatusColor(address.verified)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Visualizar">
                          <IconButton size="small">
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => handleEdit(address)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton size="small" color="error" onClick={() => handleDeleteClick(address)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredAddresses.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Linhas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Paper>

      {/* Modal de Novo/Editar Endereço */}
      <Dialog
        open={openDialog}
        onClose={() => !saving && setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={600}>
              {editingAddress ? 'Editar Endereço Digital' : 'Novo Endereço Digital'}
            </Typography>
            <IconButton
              onClick={() => setOpenDialog(false)}
              disabled={saving}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Código Digital"
                placeholder="Ex: SP-SAL-001-0001"
                value={formData.digital_code}
                onChange={(e) => setFormData({ ...formData, digital_code: e.target.value })}
                required
                disabled={!!editingAddress}
                helperText="Código único do endereço"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="CEP"
                placeholder="Ex: 08970-000"
                value={formData.zip_code}
                onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                onBlur={handleCepBlur}
                required
                helperText="Digite o CEP e pressione Tab para buscar automaticamente"
                InputProps={{
                  endAdornment: loadingCep && (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              {/* Espaço vazio para alinhamento */}
            </Grid>

            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Logradouro"
                placeholder="Ex: Rua das Flores"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Número"
                placeholder="Ex: 123"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Complemento"
                placeholder="Ex: Apto 101, Bloco A"
                value={formData.complement}
                onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bairro"
                placeholder="Ex: Centro"
                value={formData.neighborhood}
                onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Cidade"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Estado"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                required
                inputProps={{ maxLength: 2 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setOpenDialog(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveAddress}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : <AddIcon />}
          >
            {saving ? 'Salvando...' : (editingAddress ? 'Atualizar Endereço' : 'Salvar Endereço')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir o endereço <strong>{addressToDelete?.digital_code}</strong>?
            <br />
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
