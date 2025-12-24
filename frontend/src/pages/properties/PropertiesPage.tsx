import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
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
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchProperties, setFilters } from '@/features/properties/propertiesSlice';
import { format } from 'date-fns';

const typeColors: Record<string, string> = {
  RESIDENTIAL: 'primary',
  COMMERCIAL: 'secondary',
  INDUSTRIAL: 'warning',
  RURAL: 'success',
  MIXED: 'info',
  VACANT: 'default',
};

const statusColors: Record<string, string> = {
  ACTIVE: 'success',
  INACTIVE: 'default',
  PENDING: 'warning',
  ARCHIVED: 'error',
};

export default function PropertiesPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items, isLoading: _isLoading, pagination, filters } = useAppSelector((state) => state.properties);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  useEffect(() => {
    dispatch(
      fetchProperties({
        page: page + 1,
        pageSize: rowsPerPage,
        filters: { ...filters, search },
      }),
    );
  }, [dispatch, page, rowsPerPage, filters, search]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={600}>
            Imóveis
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gestão de cadastro imobiliário
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/cadastro/properties/new')}
        >
          Novo Imóvel
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            placeholder="Buscar por código, proprietário ou CPF..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={filters.type || ''}
              label="Tipo"
              onChange={(e) =>
                dispatch(setFilters({ ...filters, type: e.target.value as any }))
              }
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="RESIDENTIAL">Residencial</MenuItem>
              <MenuItem value="COMMERCIAL">Comercial</MenuItem>
              <MenuItem value="INDUSTRIAL">Industrial</MenuItem>
              <MenuItem value="RURAL">Rural</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Situação</InputLabel>
            <Select
              value={filters.status || ''}
              label="Situação"
              onChange={(e) =>
                dispatch(setFilters({ ...filters, status: e.target.value as any }))
              }
            >
              <MenuItem value="">Todas</MenuItem>
              <MenuItem value="ACTIVE">Ativo</MenuItem>
              <MenuItem value="INACTIVE">Inativo</MenuItem>
              <MenuItem value="PENDING">Pendente</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>Proprietário</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Área Terreno (m²)</TableCell>
              <TableCell>Endereço</TableCell>
              <TableCell>Situação</TableCell>
              <TableCell>Atualizado</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((property) => (
              <TableRow key={property.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {property.code}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{property.ownerName}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {property.ownerDocument}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={property.type}
                    size="small"
                    color={typeColors[property.type] as any}
                  />
                </TableCell>
                <TableCell>{property.landArea.toLocaleString('pt-BR')}</TableCell>
                <TableCell>
                  {property.digitalAddress ? (
                    <Typography variant="body2">
                      {property.digitalAddress.street}, {property.digitalAddress.number}
                    </Typography>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      Sem endereço
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={property.status}
                    size="small"
                    color={statusColors[property.status] as any}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="caption">
                    {format(new Date(property.updatedAt), 'dd/MM/yyyy HH:mm')}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/cadastro/properties/${property.id}`)}
                  >
                    <ViewIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/cadastro/properties/${property.id}/edit`)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 20, 50, 100]}
          component="div"
          count={pagination.total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Linhas por página:"
        />
      </TableContainer>
    </Box>
  );
}
