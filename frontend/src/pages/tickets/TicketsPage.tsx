import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

interface Ticket {
  id: string;
  protocolo: string;
  assunto: string;
  categoria: 'bug' | 'duvida' | 'tecnico' | 'melhoria';
  prioridade: 'Alta' | 'Média' | 'Baixa';
  status: 'Aberto' | 'Em Andamento' | 'Resolvido' | 'Fechado';
  data: string;
}

const mockTickets: Ticket[] = [
  {
    id: '1',
    protocolo: 'chamado-1709123456789',
    assunto: 'Erro ao exportar dados do mapa',
    categoria: 'bug',
    prioridade: 'Alta',
    status: 'Em Andamento',
    data: '20/04/2024',
  },
  {
    id: '2',
    protocolo: 'chamado-1709123456790',
    assunto: 'Dúvida sobre preenchimento de área construída',
    categoria: 'duvida',
    prioridade: 'Média',
    status: 'Resolvido',
    data: '18/04/2024',
  },
  {
    id: '3',
    protocolo: 'chamado-1709123456791',
    assunto: 'Solicitação de treinamento adicional',
    categoria: 'tecnico',
    prioridade: 'Baixa',
    status: 'Aberto',
    data: '20/04/2024',
  },
  {
    id: '4',
    protocolo: 'chamado-1709123456792',
    assunto: 'Problema na sincronização de dados cadastrais',
    categoria: 'bug',
    prioridade: 'Alta',
    status: 'Em Andamento',
    data: '22/04/2024',
  },
  {
    id: '5',
    protocolo: 'chamado-1709123456793',
    assunto: 'Como configurar permissões de usuário?',
    categoria: 'duvida',
    prioridade: 'Baixa',
    status: 'Resolvido',
    data: '21/04/2024',
  },
];

export default function TicketsPage() {
  const [tickets] = useState<Ticket[]>(mockTickets);

  const getStatusColor = (status: Ticket['status']) => {
    switch (status) {
      case 'Aberto':
        return 'info';
      case 'Em Andamento':
        return 'warning';
      case 'Resolvido':
        return 'success';
      case 'Fechado':
        return 'default';
      default:
        return 'default';
    }
  };

  const getPrioridadeColor = (prioridade: Ticket['prioridade']) => {
    switch (prioridade) {
      case 'Alta':
        return 'error';
      case 'Média':
        return 'warning';
      case 'Baixa':
        return 'info';
      default:
        return 'default';
    }
  };

  const getCategoriaLabel = (categoria: Ticket['categoria']) => {
    const labels: Record<string, string> = {
      bug: 'Bug/Erro',
      duvida: 'Dúvida',
      tecnico: 'Técnico',
      melhoria: 'Melhoria',
    };
    return labels[categoria] || categoria;
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Central de Suporte
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Atendimento e acompanhamento de solicitações
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} size="large">
          Novo Chamado
        </Button>
      </Box>

      <Grid container spacing={3} mb={3}>
        {/* Canais de Atendimento */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Canais de Atendimento
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box mb={2}>
                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                  <PhoneIcon fontSize="small" color="primary" />
                  <Typography variant="body1" fontWeight={500}>
                    (11) 4696-1234
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Seg a Sex, 8h às 17h
                </Typography>
              </Box>

              <Box>
                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                  <EmailIcon fontSize="small" color="primary" />
                  <Typography variant="body2" fontWeight={500}>
                    suporte@salesopolis.sp.gov.br
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Resposta em até 24h
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* SLA de Atendimento */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                SLA de Atendimento
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box display="flex" flexDirection="column" gap={1.5}>
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Typography variant="body2" fontWeight={500}>
                      Prioridade Alta:
                    </Typography>
                    <Chip label="4 horas" color="error" size="small" />
                  </Box>
                </Box>
                
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Typography variant="body2" fontWeight={500}>
                      Prioridade Média:
                    </Typography>
                    <Chip label="24 horas" color="warning" size="small" />
                  </Box>
                </Box>
                
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Typography variant="body2" fontWeight={500}>
                      Prioridade Baixa:
                    </Typography>
                    <Chip label="48 horas" color="info" size="small" />
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Disponibilidade */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Disponibilidade
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box textAlign="center" mb={2}>
                <Typography variant="h2" fontWeight={700} color="success.main">
                  99.7%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sistema operacional
                </Typography>
              </Box>
              
              <LinearProgress 
                variant="determinate" 
                value={99.7} 
                sx={{ 
                  height: 8, 
                  borderRadius: 1,
                  bgcolor: 'action.hover',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'success.main',
                  }
                }} 
              />
              
              <Box mt={2}>
                <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                  <CheckIcon fontSize="small" />
                  Última atualização: há 2 minutos
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabela de Chamados */}
      <Paper>
        <Box p={2}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Meus Chamados
          </Typography>
        </Box>
        <Divider />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Protocolo</TableCell>
                <TableCell>Assunto</TableCell>
                <TableCell>Categoria</TableCell>
                <TableCell>Prioridade</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Data</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id} hover sx={{ cursor: 'pointer' }}>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace" fontSize="0.85rem">
                      {ticket.protocolo}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {ticket.assunto}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getCategoriaLabel(ticket.categoria)} 
                      size="small" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={ticket.prioridade}
                      size="small"
                      color={getPrioridadeColor(ticket.prioridade)}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={ticket.status}
                      size="small"
                      color={getStatusColor(ticket.status)}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {ticket.data}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
