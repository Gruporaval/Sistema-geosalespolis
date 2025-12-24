import { useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, Paper, CircularProgress } from '@mui/material';
import {
  Home as HomeIcon,
  Place as PlaceIcon,
  Map as MapIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchDashboardData } from '@/features/dashboard/dashboardSlice';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface KPICardProps {
  title: string;
  value: number | string;
  icon: JSX.Element;
  color: string;
}

function KPICard({ title, value, icon, color }: KPICardProps) {
  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={600}>
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              backgroundColor: `${color}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: color,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { kpis, propertiesByType, propertiesByDistrict, isLoading } = useAppSelector(
    (state) => state.dashboard,
  );

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  if (isLoading || !kpis) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const typeChartData = {
    labels: propertiesByType.map((item) => item.type),
    datasets: [
      {
        data: propertiesByType.map((item) => item.count),
        backgroundColor: [
          '#1976d2',
          '#dc004e',
          '#2e7d32',
          '#ed6c02',
          '#9c27b0',
          '#00acc1',
        ],
      },
    ],
  };

  const districtChartData = {
    labels: propertiesByDistrict.map((item) => item.district),
    datasets: [
      {
        label: 'Propriedades',
        data: propertiesByDistrict.map((item) => item.count),
        backgroundColor: '#1976d2',
      },
    ],
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Visão geral do sistema de cadastro
      </Typography>

      {/* KPIs */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Total de Imóveis"
            value={kpis.totalProperties.toLocaleString('pt-BR')}
            icon={<HomeIcon fontSize="large" />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Com Endereço"
            value={kpis.propertiesWithAddress.toLocaleString('pt-BR')}
            icon={<PlaceIcon fontSize="large" />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Com Geometria"
            value={kpis.propertiesWithGeometry.toLocaleString('pt-BR')}
            icon={<MapIcon fontSize="large" />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Progresso Recadastro"
            value={`${kpis.recadastrationProgress.toFixed(1)}%`}
            icon={<TrendingUpIcon fontSize="large" />}
            color="#9c27b0"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Imóveis por Tipo
            </Typography>
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
              <Pie data={typeChartData} options={{ maintainAspectRatio: false }} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Imóveis por Bairro
            </Typography>
            <Box sx={{ height: 300 }}>
              <Bar
                data={districtChartData}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
