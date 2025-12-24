import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Switch,
  Chip,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
} from '@mui/material';
import {
  Layers as LayersIcon,
  LocationOn as LocationIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  GetApp as ExportIcon,
  Edit as EditIcon,
  Straighten as MeasureIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

interface CamadaGIS {
  id: string;
  nome: string;
  tipo: 'vector' | 'raster';
  visibilidade: 'publica' | 'interna';
  ativa: boolean;
  estilo: {
    color: string;
    fillColor: string;
    weight: number;
    opacity: number;
    fillOpacity: number;
  };
}

const camadasIniciais: CamadaGIS[] = [
  {
    id: 'camada-1',
    nome: 'Imóveis Urbanos',
    tipo: 'vector',
    visibilidade: 'interna',
    ativa: true,
    estilo: { color: '#3b82f6', fillColor: '#3b82f6', weight: 2, opacity: 0.8, fillOpacity: 0.2 },
  },
  {
    id: 'camada-2',
    nome: 'PGV - Planta Genérica de Valores',
    tipo: 'vector',
    visibilidade: 'interna',
    ativa: false,
    estilo: { color: '#10b981', fillColor: '#10b981', weight: 1, opacity: 0.6, fillOpacity: 0.1 },
  },
  {
    id: 'camada-3',
    nome: 'Loteamentos',
    tipo: 'vector',
    visibilidade: 'publica',
    ativa: false,
    estilo: { color: '#f59e0b', fillColor: '#f59e0b', weight: 1, opacity: 0.5, fillOpacity: 0.05 },
  },
  {
    id: 'camada-4',
    nome: 'Zoneamento Urbano',
    tipo: 'vector',
    visibilidade: 'publica',
    ativa: false,
    estilo: { color: '#8b5cf6', fillColor: '#8b5cf6', weight: 1, opacity: 0.6, fillOpacity: 0.15 },
  },
  {
    id: 'camada-5',
    nome: 'Áreas de Preservação',
    tipo: 'vector',
    visibilidade: 'publica',
    ativa: false,
    estilo: { color: '#22c55e', fillColor: '#22c55e', weight: 2, opacity: 0.7, fillOpacity: 0.25 },
  },
];

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [camadas, setCamadas] = useState<CamadaGIS[]>(camadasIniciais);
  const [initialized, setInitialized] = useState(false);
  const [mapInfo, setMapInfo] = useState({
    zoom: 14,
    lat: -23.5291,
    lng: -45.8468,
  });

  useEffect(() => {
    if (!mapRef.current || initialized) return;

    // Adiciona CSS do Leaflet
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const L = (window as any).L;
    if (!L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => initMap();
      document.head.appendChild(script);
    } else {
      initMap();
    }

    function initMap() {
      const L = (window as any).L;
      if (!mapRef.current) return;
      
      // Limpa o container se já tiver conteúdo
      if (mapRef.current.innerHTML) {
        mapRef.current.innerHTML = '';
      }
      
      // Remove _leaflet_id se existir
      if ((mapRef.current as any)._leaflet_id) {
        delete (mapRef.current as any)._leaflet_id;
      }
      
      const map = L.map(mapRef.current).setView([-23.5291, -45.8468], 14);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Marker da prefeitura
      const marker = L.marker([-23.5291, -45.8468]).addTo(map);
      marker
        .bindPopup(
          '<b>Prefeitura de Salesópolis</b><br>Rua Pedro Rodrigues de Camargo, 215<br>Centro - Salesópolis/SP'
        )
        .openPopup();

      // Atualiza info ao mover o mapa
      map.on('zoomend moveend', () => {
        const center = map.getCenter();
        setMapInfo({
          zoom: map.getZoom(),
          lat: Number(center.lat.toFixed(4)),
          lng: Number(center.lng.toFixed(4)),
        });
      });

      setInitialized(true);
    }

    // Cleanup: remove o mapa ao desmontar
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      setInitialized(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleCamada = (id: string) => {
    setCamadas((prev) =>
      prev.map((camada) =>
        camada.id === id ? { ...camada, ativa: !camada.ativa } : camada
      )
    );
  };

  return (
    <Box sx={{ height: 'calc(100vh - 140px)', display: 'flex', gap: 0 }}>
      {/* Painel de Camadas */}
      <Paper
        sx={{
          width: 320,
          borderRight: 1,
          borderColor: 'divider',
          overflowY: 'auto',
          p: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <LayersIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Camadas do Mapa
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {camadas.map((camada) => (
            <Card key={camada.id} variant="outlined">
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle2" fontWeight={600} noWrap>
                        {camada.nome}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Chip
                        label={camada.visibilidade}
                        size="small"
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                      <Chip
                        label={camada.tipo}
                        size="small"
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        height: 8,
                        borderRadius: 1,
                        bgcolor: camada.estilo.fillColor,
                        opacity: camada.ativa ? 0.8 : 0.3,
                        border: `2px solid ${camada.estilo.color}`,
                      }}
                    />
                  </Box>
                  <Switch
                    checked={camada.ativa}
                    onChange={() => toggleCamada(camada.id)}
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Divider sx={{ my: 3 }} />

        <Paper
          sx={{
            p: 2,
            bgcolor: 'action.hover',
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <LocationIcon fontSize="small" color="primary" />
            <Typography variant="body2" fontWeight={600}>
              Centro: Salesópolis, SP
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" display="block">
            Sistema: SIRGAS 2000 / UTM 23S
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
            Projeção: WGS84 / EPSG:4326
          </Typography>
        </Paper>
      </Paper>

      {/* Mapa */}
      <Box sx={{ flex: 1, position: 'relative' }}>
        <div
          ref={mapRef}
          style={{
            width: '100%',
            height: '100%',
            background: '#f0f0f0',
          }}
        />

        {/* Ferramentas GIS - Card Flutuante */}
        <Paper
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            p: 2,
            minWidth: 280,
            bgcolor: 'background.paper',
            backdropFilter: 'blur(10px)',
            boxShadow: 3,
          }}
        >
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Ferramentas GIS
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip icon={<SearchIcon />} label="Consultar" size="small" clickable />
            <Chip icon={<MeasureIcon />} label="Medir" size="small" clickable />
            <Chip icon={<ExportIcon />} label="Exportar" size="small" clickable />
            <Chip icon={<EditIcon />} label="Editar" size="small" clickable />
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              color: 'text.secondary',
              fontFamily: 'monospace',
            }}
          >
            <span>Zoom: {mapInfo.zoom}</span>
            <span>
              {mapInfo.lat}, {mapInfo.lng}
            </span>
          </Box>
        </Paper>

        {/* Legenda de Camadas Ativas */}
        {camadas.filter((c) => c.ativa).length > 0 && (
          <Paper
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              p: 1.5,
              maxWidth: 220,
            }}
          >
            <Typography variant="caption" fontWeight={600} display="block" gutterBottom>
              Camadas Ativas
            </Typography>
            {camadas
              .filter((c) => c.ativa)
              .map((camada) => (
                <Box
                  key={camada.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: 0.5,
                      bgcolor: camada.estilo.fillColor,
                      border: `2px solid ${camada.estilo.color}`,
                      flexShrink: 0,
                    }}
                  />
                  <Typography variant="caption" noWrap>
                    {camada.nome}
                  </Typography>
                </Box>
              ))}
          </Paper>
        )}
      </Box>
    </Box>
  );
}
