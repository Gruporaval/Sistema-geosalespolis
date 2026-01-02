import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Button,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Tab,
    Tabs,
    Chip,
    Card,
    CardContent,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    LocationCity as NeighborhoodIcon,
    Home as PropertyTypeIcon,
    Close as CloseIcon,
    Category as CategoryIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

interface CategoryItem {
    id: string;
    name: string;
    usage_count?: number; // Contagem de imóveis que usam
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

export default function CategoriesPage() {
    const [tabValue, setTabValue] = useState(0);
    const [items, setItems] = useState<CategoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [saving, setSaving] = useState(false);
    const [itemName, setItemName] = useState('');
    const [editingItem, setEditingItem] = useState<CategoryItem | null>(null);
    const [deletingItem, setDeletingItem] = useState<CategoryItem | null>(null);

    // Determinar qual tabela usar baseado na aba
    const currentTable = tabValue === 0 ? 'neighborhoods' : 'property_types';
    const currentLabel = tabValue === 0 ? 'Bairro' : 'Tipo de Imóvel';

    useEffect(() => {
        loadData();
    }, [tabValue]);

    async function loadData() {
        try {
            setLoading(true);
            const { supabase } = await import('@/lib/supabase');

            // 1. Carregar itens da tabela de categorias
            const { data: categoryData, error: categoryError } = await supabase
                .from(currentTable)
                .select('*')
                .order('name');

            if (categoryError) throw categoryError;

            // 2. Carregar contagem de uso na tabela properties
            const columnToCheck = tabValue === 0 ? 'neighborhood' : 'property_type';
            const { data: properties, error: propError } = await supabase
                .from('properties')
                .select(columnToCheck);

            if (propError) throw propError;

            // Calcular contagem
            const usageMap: { [key: string]: number } = {};
            properties?.forEach((prop: any) => {
                const val = prop[columnToCheck];
                if (val) usageMap[val] = (usageMap[val] || 0) + 1;
            });

            // Combinar dados
            const itemsWithUsage = categoryData?.map((item) => ({
                ...item,
                usage_count: usageMap[item.name] || 0,
            })) || [];

            setItems(itemsWithUsage);
        } catch (error: any) {
            console.error('Erro ao carregar dados:', error);

            // Se der erro de tabela não existente, avisa o usuário
            if (error?.code === '42P01') {
                toast.error('⚠️ Tabelas não encontradas! Execute o SQL_CATEGORIAS.md');
            } else {
                toast.error('Erro ao carregar categorias');
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        if (!itemName.trim()) {
            toast.warning('O nome não pode estar vazio');
            return;
        }

        try {
            setSaving(true);
            const { supabase } = await import('@/lib/supabase');

            const payload = { name: itemName.trim() };

            const { error } = editingItem
                ? await supabase.from(currentTable).update(payload).eq('id', editingItem.id)
                : await supabase.from(currentTable).insert(payload);

            if (error) {
                if (error.code === '23505') {
                    toast.error(`${currentLabel} já existe!`);
                } else if (error.code === '42501') {
                    toast.error('🔒 Erro de permissão. Execute SQL_CATEGORIAS.md no Supabase.');
                } else {
                    throw error;
                }
                return;
            }

            toast.success(`${currentLabel} ${editingItem ? 'atualizado' : 'criado'} com sucesso!`);
            setOpenDialog(false);
            setItemName('');
            setEditingItem(null);
            loadData();
        } catch (error) {
            console.error('Erro ao salvar:', error);
            toast.error('Erro ao salvar. Verifique se as tabelas existem.');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (!deletingItem) return;

        try {
            setSaving(true);
            const { supabase } = await import('@/lib/supabase');

            const { error } = await supabase
                .from(currentTable)
                .delete()
                .eq('id', deletingItem.id);

            if (error) throw error;

            toast.success(`${currentLabel} excluído com sucesso!`);
            setOpenDeleteDialog(false);
            setDeletingItem(null);
            loadData();
        } catch (error) {
            console.error('Erro ao excluir:', error);
            toast.error('Erro ao excluir. Tente novamente.');
        } finally {
            setSaving(false);
        }
    }

    function openEdit(item: CategoryItem) {
        setEditingItem(item);
        setItemName(item.name);
        setOpenDialog(true);
    }

    function openDelete(item: CategoryItem) {
        setDeletingItem(item);
        setOpenDeleteDialog(true);
    }

    return (
        <Box>
            <Box mb={3}>
                <Typography variant="h4" fontWeight={600} gutterBottom>
                    Categorias
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Gerenciamento de Bairros e Tipos de Imóveis do sistema
                </Typography>
            </Box>

            <Paper sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 2 }}>
                    <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
                        <Tab
                            icon={<NeighborhoodIcon />}
                            iconPosition="start"
                            label="Bairros"
                        />
                        <Tab
                            icon={<PropertyTypeIcon />}
                            iconPosition="start"
                            label="Tipos de Imóvel"
                        />
                    </Tabs>
                </Box>

                <Box p={3}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Box>
                            <Typography variant="h6">
                                Gerenciar {tabValue === 0 ? 'Bairros' : 'Tipos de Imóvel'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {items.length} cadastrados
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => {
                                setItemName('');
                                setEditingItem(null);
                                setOpenDialog(true);
                            }}
                        >
                            Adicionar Novo
                        </Button>
                    </Box>

                    {loading ? (
                        <Box display="flex" justifyContent="center" py={4}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Grid container spacing={2}>
                            {items.length === 0 ? (
                                <Grid item xs={12}>
                                    <Typography align="center" color="text.secondary" py={4}>
                                        Nenhum item cadastrado. <br />
                                        <strong>Se você ver erros, execute o script SQL_CATEGORIAS.md</strong>
                                    </Typography>
                                </Grid>
                            ) : (
                                items.map((item) => (
                                    <Grid item xs={12} sm={6} md={4} key={item.id}>
                                        <Card variant="outlined">
                                            <CardContent sx={{ pb: '16px !important' }}>
                                                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                                    <Box>
                                                        <Typography variant="subtitle1" fontWeight={600}>
                                                            {item.name}
                                                        </Typography>
                                                        <Chip
                                                            label={`${item.usage_count} imóveis`}
                                                            size="small"
                                                            color={item.usage_count ? "primary" : "default"}
                                                            variant={item.usage_count ? "filled" : "outlined"}
                                                            sx={{ mt: 1, height: 20, fontSize: '0.7rem' }}
                                                        />
                                                    </Box>
                                                    <Box>
                                                        <Tooltip title="Editar">
                                                            <IconButton size="small" onClick={() => openEdit(item)}>
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Excluir">
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                onClick={() => openDelete(item)}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))
                            )}
                        </Grid>
                    )}
                </Box>
            </Paper>

            {/* Modal Criar/Editar */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {editingItem ? `Editar ${currentLabel}` : `Novo ${currentLabel}`}
                </DialogTitle>
                <DialogContent>
                    <Box pt={1}>
                        <TextField
                            autoFocus
                            fullWidth
                            label="Nome"
                            variant="outlined"
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value)}
                            placeholder={`Ex: ${tabValue === 0 ? 'Centro' : 'Residencial'}`}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={saving}
                    >
                        {saving ? 'Salvando...' : 'Salvar'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal Confirmar Exclusão */}
            <Dialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
            >
                <DialogTitle>Confirmar Exclusão</DialogTitle>
                <DialogContent>
                    <Typography>
                        Tem certeza que deseja excluir <strong>{deletingItem?.name}</strong>?
                        <br /><br />
                        <Typography component="span" variant="caption" color="error">
                            Nota: Isso remove apenas da lista de opções. Imóveis que usam este nome não serão alterados, mas podem ficar com categorias inválidas no futuro.
                        </Typography>
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
                    <Button
                        onClick={handleDelete}
                        color="error"
                        variant="contained"
                        disabled={saving}
                    >
                        {saving ? 'Excluindo...' : 'Excluir'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
