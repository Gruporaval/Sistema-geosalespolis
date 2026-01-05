import { useState, useEffect } from 'react';
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
    Avatar,
    IconButton,
    Tooltip,
    Modal,
    TextField,
    MenuItem,
    Grid,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    InputAdornment,
    Chip,
    Checkbox,
    FormControlLabel,
    TablePagination,
    Autocomplete,
    Alert
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    Close as CloseIcon,
    Home as HomeIcon,
    LocationOn as LocationIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

interface Property {
    id: string;
    digital_code: string;
    street: string;
    number?: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zip_code?: string;
    area_total?: number;
    area_built?: number;
    property_type?: string;
    status: 'active' | 'inactive' | 'pending';
    owner_name?: string;
    owner_document?: string;
    owner_phone?: string;
    owner_email?: string;
    lat?: number;
    lng?: number; // Adicionado para Geo
}

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
}

// ... Tipos de imóvel e status (simplificado para economia de tokens, mas mantendo funcionalidade)
const propertyTypes = ['Residencial', 'Comercial', 'Industrial', 'Rural', 'Público', 'Misto'];

export default function PropertiesPage() {
    const [loading, setLoading] = useState(true);
    const [properties, setProperties] = useState<Property[]>([]);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);
    const [saving, setSaving] = useState(false);
    const [loadingCep, setLoadingCep] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        digital_code: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: 'Salesópolis',
        state: 'SP',
        zip_code: '',
        area_total: '',
        area_built: '',
        property_type: 'Residencial',
        owner_name: '',
        owner_document: '',
        owner_phone: '',
        owner_email: '',
    });

    useEffect(() => {
        loadProperties();
        loadAddresses();
    }, []);

    useEffect(() => {
        const term = searchTerm.toLowerCase();
        const filtered = properties.filter(
            (prop) =>
                prop.digital_code?.toLowerCase().includes(term) ||
                prop.street?.toLowerCase().includes(term) ||
                prop.neighborhood?.toLowerCase().includes(term) ||
                prop.owner_name?.toLowerCase().includes(term)
        );
        setFilteredProperties(filtered);
        setPage(0);
    }, [searchTerm, properties]);

    async function loadProperties() {
        try {
            setLoading(true);
            const { supabase } = await import('@/lib/supabase');
            const { data, error } = await supabase
                .from('properties')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProperties(data || []);
            setFilteredProperties(data || []);
        } catch (error) {
            console.error('Erro ao carregar imóveis:', error);
            toast.error('Erro ao carregar lista de imóveis');
        } finally {
            setLoading(false);
        }
    }

    async function loadAddresses() {
        try {
            const { supabase } = await import('@/lib/supabase');
            const { data, error } = await supabase
                .from('addresses')
                .select('*')
                .eq('status', 'active')
                .order('street', { ascending: true });

            if (error) throw error;
            setAddresses(data || []);
        } catch (error) {
            console.error('Erro ao carregar endereços:', error);
        }
    }

    const handleAddressSelect = (address: Address | null) => {
        if (!address) {
            setSelectedAddress(null);
            return;
        }

        setSelectedAddress(address);
        setFormData(prev => ({
            ...prev,
            street: address.street,
            number: address.number || '',
            complement: address.complement || '',
            neighborhood: address.neighborhood,
            city: address.city,
            state: address.state,
            zip_code: address.zip_code,
        }));
        toast.success('✅ Endereço preenchido automaticamente!');
    };

    const handleCepBlur = async () => {
        const cep = formData.zip_code?.replace(/\D/g, '');
        if (cep?.length !== 8) return;

        try {
            setLoadingCep(true);
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();

            if (!data.erro) {
                setFormData((prev) => ({
                    ...prev,
                    street: data.logradouro,
                    neighborhood: data.bairro,
                    city: data.localidade,
                    state: data.uf,
                }));
                toast.info('Endereço preenchido!');
            } else {
                toast.warning('CEP não encontrado');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingCep(false);
        }
    };

    async function handleSaveProperty() {
        try {
            setSaving(true);
            const { supabase } = await import('@/lib/supabase');

            if (!formData.digital_code || !formData.street || !formData.neighborhood) {
                toast.error('Preencha os campos obrigatórios (*)');
                return;
            }

            // Dados do imóvel para salvar
            const propertyData = {
                digital_code: formData.digital_code,
                street: formData.street,
                number: formData.number || null,
                complement: formData.complement || null,
                neighborhood: formData.neighborhood,
                city: formData.city,
                state: formData.state,
                zip_code: formData.zip_code || null,
                area_total: formData.area_total ? parseFloat(formData.area_total) : null,
                area_built: formData.area_built ? parseFloat(formData.area_built) : null,
                property_type: formData.property_type || null,
                status: 'active',
                // Nota: coordinates (geometry PostGIS) será calculado automaticamente
                // pelo trigger do banco ou pode ser adicionado depois via geocoding
            };

            const { error } = editingProperty
                ? await supabase.from('properties').update(propertyData).eq('id', editingProperty.id)
                : await supabase.from('properties').insert(propertyData);

            if (error) {
                console.error('Erro Supabase:', error);
                if (error.code === '23505') {
                    toast.error('Código já existe!');
                } else {
                    toast.error(`Erro: ${error.message || 'Verifique os dados'}`);
                }
                return;
            }

            toast.success('Salvo com sucesso!');
            setOpenDialog(false);
            setSelectedAddress(null); // Limpa seleção
            loadProperties();
        } catch (error: any) {
            console.error('Erro completo:', error);
            toast.error(`Erro ao salvar: ${error.message || 'Desconhecido'}`);
        } finally {
            setSaving(false);
        }
    }

    // Handle Edit/Delete/Open wrappers...
    const handleEdit = (prop: Property) => {
        setEditingProperty(prop);
        setFormData({
            digital_code: prop.digital_code,
            street: prop.street,
            number: prop.number || '',
            complement: prop.complement || '',
            neighborhood: prop.neighborhood,
            city: prop.city,
            state: prop.state,
            zip_code: prop.zip_code || '',
            area_total: prop.area_total?.toString() || '',
            area_built: prop.area_built?.toString() || '',
            property_type: prop.property_type || 'Residencial',
            owner_name: prop.owner_name || '',
            owner_document: prop.owner_document || '',
            owner_phone: prop.owner_phone || '',
            owner_email: prop.owner_email || '',
        });
        setOpenDialog(true);
    };

    const handleOpenNew = () => {
        setEditingProperty(null);
        setSelectedAddress(null); // Limpa endereço selecionado
        setFormData({
            digital_code: '', street: '', number: '', complement: '', neighborhood: '',
            city: 'Salesópolis', state: 'SP', zip_code: '', area_total: '', area_built: '',
            property_type: 'Residencial', owner_name: '', owner_document: '', owner_phone: '', owner_email: ''
        });
        setOpenDialog(true);
    }

    const handleDelete = async (prop: Property) => {
        if (!window.confirm('Excluir este imóvel?')) return;
        try {
            const { supabase } = await import('@/lib/supabase');
            await supabase.from('properties').delete().eq('id', prop.id);
            toast.success('Excluído.');
            loadProperties();
        } catch (e) { toast.error('Erro ao excluir'); }
    }

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" mb={3}>
                <Typography variant="h5" fontWeight={700}>Imóveis</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenNew}>
                    Novo Imóvel
                </Button>
            </Box>

            <Paper sx={{ mb: 3, p: 2 }}>
                <TextField
                    fullWidth
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
                />
            </Paper>

            <Paper>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Código</TableCell>
                                <TableCell>Endereço</TableCell>
                                <TableCell>Bairro</TableCell>
                                <TableCell>Tipo</TableCell>
                                <TableCell align="right">Ações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredProperties.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(prop => (
                                <TableRow key={prop.id} hover>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <HomeIcon fontSize="small" color="primary" />
                                            <Typography fontWeight={600}>{prop.digital_code}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{prop.street}, {prop.number}</TableCell>
                                    <TableCell>{prop.neighborhood}</TableCell>
                                    <TableCell><Chip label={prop.property_type || '-'} size="small" variant="outlined" /></TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small" onClick={() => handleEdit(prop)}><EditIcon fontSize="small" /></IconButton>
                                        <IconButton size="small" color="error" onClick={() => handleDelete(prop)}><DeleteIcon fontSize="small" /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={filteredProperties.length}
                    page={page}
                    onPageChange={(_, p) => setPage(p)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={e => setRowsPerPage(parseInt(e.target.value, 10))}
                />
            </Paper>

            {/* Modal Simplificado */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>{editingProperty ? 'Editar' : 'Novo'} Imóvel</DialogTitle>
                <DialogContent dividers>
                    {/* SELETOR DE ENDEREÇO EXISTENTE */}
                    {!editingProperty && (
                        <Box mb={3}>
                            <Alert severity="info" icon={<LocationIcon />} sx={{ mb: 2 }}>
                                <strong>Facilite o cadastro!</strong> Selecione um endereço já cadastrado no sistema para preencher automaticamente os campos.
                            </Alert>
                            <Autocomplete
                                value={selectedAddress}
                                onChange={(_, newValue) => handleAddressSelect(newValue)}
                                options={addresses}
                                getOptionLabel={(option) =>
                                    `${option.street}, ${option.number || 'S/N'} - ${option.neighborhood} (${option.zip_code})`
                                }
                                // Comparação correta de objetos
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                // FILTRO CUSTOMIZADO - Busca em todos os campos
                                filterOptions={(options, state) => {
                                    const inputValue = state.inputValue.toLowerCase().trim();
                                    if (!inputValue) return options;

                                    return options.filter(option => {
                                        // Busca em: rua, número, bairro, cidade, CEP
                                        const searchText = `
                                            ${option.street} 
                                            ${option.number || ''} 
                                            ${option.neighborhood} 
                                            ${option.city} 
                                            ${option.zip_code}
                                        `.toLowerCase();

                                        return searchText.includes(inputValue);
                                    });
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="🔍 Buscar Endereço Existente"
                                        placeholder="Digite rua, número, bairro ou CEP..."
                                        helperText="Opcional: Selecione um endereço da base ou preencha manualmente abaixo"
                                    />
                                )}
                                renderOption={(props, option) => (
                                    <li {...props}>
                                        <Box>
                                            <Typography variant="body2" fontWeight={600}>
                                                {option.street}, {option.number || 'S/N'}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {option.neighborhood} - {option.city}/{option.state} - CEP: {option.zip_code}
                                            </Typography>
                                        </Box>
                                    </li>
                                )}
                                noOptionsText="Nenhum endereço encontrado"
                                fullWidth
                            />
                        </Box>
                    )}

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth label="Código Digital *" value={formData.digital_code} onChange={e => setFormData({ ...formData, digital_code: e.target.value })} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth label="CEP" value={formData.zip_code} onChange={e => setFormData({ ...formData, zip_code: e.target.value })} onBlur={handleCepBlur}
                                InputProps={{ endAdornment: loadingCep && <CircularProgress size={20} /> }} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth select label="Tipo" value={formData.property_type} onChange={e => setFormData({ ...formData, property_type: e.target.value })}>
                                {propertyTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={8}>
                            <TextField fullWidth label="Logradouro *" value={formData.street} onChange={e => setFormData({ ...formData, street: e.target.value })} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth label="Número" value={formData.number} onChange={e => setFormData({ ...formData, number: e.target.value })} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Bairro *" value={formData.neighborhood} onChange={e => setFormData({ ...formData, neighborhood: e.target.value })} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Cidade" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
                    <Button variant="contained" onClick={handleSaveProperty} disabled={saving}>Salvar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
