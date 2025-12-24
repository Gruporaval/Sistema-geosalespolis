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
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';

interface Address {
  id: number;
  digitalCode: string;
  street: string;
  number: string;
  district: string;
  cep: string;
  coordinates: string;
  status: 'Ativo' | 'Pendente' | 'Inativo';
}

// Dados mockados para demonstração
const mockAddresses: Address[] = [
  {
    id: 1,
    digitalCode: 'SP-SAL-001-0001',
    street: 'Rua Pedro Rodrigues de Camargo',
    number: '215',
    district: 'Centro',
    cep: '08970-000',
    coordinates: '-23.5321, -45.8467',
    status: 'Ativo',
  },
  {
    id: 2,
    digitalCode: 'SP-SAL-002-0045',
    street: 'Avenida Presidente Vargas',
    number: '1250',
    district: 'Zona Norte',
    cep: '08970-100',
    coordinates: '-23.5298, -45.8512',
    status: 'Ativo',
  },
  {
    id: 3,
    digitalCode: 'SP-SAL-003-0123',
    street: 'Rua das Flores',
    number: '456',
    district: 'Zona Sul',
    cep: '08970-200',
    coordinates: '-23.5402, -45.8434',
    status: 'Pendente',
  },
  {
    id: 4,
    digitalCode: 'SP-SAL-001-0089',
    street: 'Rua São Paulo',
    number: '789',
    district: 'Centro',
    cep: '08970-010',
    coordinates: '-23.5334, -45.8445',
    status: 'Ativo',
  },
  {
    id: 5,
    digitalCode: 'SP-SAL-004-0234',
    street: 'Estrada Municipal',
    number: 'S/N',
    district: 'Zona Rural',
    cep: '08970-300',
    coordinates: '-23.5567, -45.8723',
    status: 'Ativo',
  },
];

export default function AddressesPage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAddresses = mockAddresses.filter(
    (addr) =>
      addr.digitalCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      addr.street.toLowerCase().includes(searchTerm.toLowerCase()) ||
      addr.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      addr.cep.includes(searchTerm)
  );

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status: Address['status']) => {
    switch (status) {
      case 'Ativo':
        return 'success';
      case 'Pendente':
        return 'warning';
      case 'Inativo':
        return 'error';
      default:
        return 'default';
    }
  };

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
        <Button variant="contained" startIcon={<AddIcon />} size="large">
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
                <TableCell>Coordenadas</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAddresses
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((address) => (
                  <TableRow key={address.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LocationIcon color="primary" fontSize="small" />
                        <Typography variant="body2" fontWeight={500}>
                          {address.digitalCode}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{address.street}</TableCell>
                    <TableCell>{address.number}</TableCell>
                    <TableCell>{address.district}</TableCell>
                    <TableCell>{address.cep}</TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {address.coordinates}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={address.status}
                        color={getStatusColor(address.status)}
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
                        <IconButton size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Ver no Mapa">
                        <IconButton size="small" color="primary">
                          <LocationIcon fontSize="small" />
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
          count={filteredAddresses.length}
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
