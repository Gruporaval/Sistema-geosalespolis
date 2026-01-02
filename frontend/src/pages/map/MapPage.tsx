import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Switch,
  Chip,
  Card,
  CardActionArea,
  Avatar,
  Tab,
  Tabs,
  Skeleton,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  useTheme,
  Alert,
  Divider
} from '@mui/material';
import {
  Layers as LayersIcon,
  Search as SearchIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
  Factory as FactoryIcon,
  Agriculture as RuralIcon,
  Domain as PublicIcon,
  Place as PlaceIcon,
  Map as MapIcon,
  GpsFixed as GpsIcon,
  ChevronRight,
  ChevronLeft,
  MyLocation as MyLocationIcon,
  SatelliteAlt as SatelliteIcon,
  MapOutlined as StreetIcon,
} from '@mui/icons-material';

interface CamadaGIS {
  id: string;
  name: string;
  type: 'vector' | 'raster';
  is_active: boolean;
  style: {
    color: string;
    fillColor: string;
  };
}

interface Property {
  id: string;
  digital_code: string;
  street: string;
  number?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code?: string;
  property_type: string;
  owner_name?: string;
  lat?: number;
  lng?: number;
  geocoded?: boolean;
}

const getPropertyIcon = (type: string) => {
  switch (type) {
    case 'Comercial': return <BusinessIcon fontSize="small" />;
    case 'Industrial': return <FactoryIcon fontSize="small" />;
    case 'Rural': return <RuralIcon fontSize="small" />;
    case 'Público': return <PublicIcon fontSize="small" />;
    default: return <HomeIcon fontSize="small" />;
  }
};

const getPropertyColor = (type: string) => {
  switch (type) {
    case 'Comercial': return 'info.main';
    case 'Industrial': return 'warning.main';
    case 'Rural': return 'success.main';
    case 'Público': return 'secondary.main';
    default: return 'primary.main';
  }
};

export default function MapPage() {
  const theme = useTheme();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layersRef = useRef<any>({});
  const markersRef = useRef<{ [key: string]: any }>({});

  const [camadas, setCamadas] = useState<CamadaGIS[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [loadingProperties, setLoadingProperties] = useState(true);

  // Estado do layout
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  // Tipo de Mapa: 'streets' | 'satellite'
  const [mapType, setMapType] = useState('streets');

  // Geo padrão: Salesópolis
  const DEFAULT_CENTER = [-23.5323, -45.8466];

  useEffect(() => {
    // Carregar Leaflet Styles
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const init = async () => {
      if (!(window as any).L) {
        await new Promise<void>((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.async = true;
          script.onload = () => resolve();
          document.head.appendChild(script);
        });
      }
      initMap();
    };
    init();
    loadLayers();
    loadProperties();
  }, []);

  // Troca de Camada Base (Satélite vs Rua)
  useEffect(() => {
    if (!mapInstanceRef.current || !layersRef.current) return;
    const map = mapInstanceRef.current;

    // Remove todas
    if (map.hasLayer(layersRef.current.streets)) map.removeLayer(layersRef.current.streets);
    if (map.hasLayer(layersRef.current.satellite)) map.removeLayer(layersRef.current.satellite);
    if (map.hasLayer(layersRef.current.hybrid)) map.removeLayer(layersRef.current.hybrid);

    // Adiciona a selecionada
    if (mapType === 'streets') {
      layersRef.current.streets.addTo(map);
    } else {
      layersRef.current.satellite.addTo(map);
      layersRef.current.hybrid.addTo(map); // Labels sobre o satélite
    }
  }, [mapType]);

  function initMap() {
    const L = (window as any).L;
    if (!mapRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
      return;
    }

    const map = L.map(mapRef.current, { zoomControl: false })
      .setView(DEFAULT_CENTER, 15);

    mapInstanceRef.current = map;

    // DEFINIÇÃO DAS CAMADAS BASE (ESRI - Gratuito e Top de Linha)
    // 1. Ruas (Estilo Clean/Profissional)
    const esriStreets = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Esri, HERE, Garmin, Intermap, inclement P Corp., GEBCO, USGS, FAO, NPS, NRCAN, GeoBase, IGN, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), swisstopo, © OpenStreetMap contributors, and the GIS User Community',
      maxZoom: 19
    });

    // 2. Satélite Rápido (Google Hybrid - Satélite + Ruas)
    // Hack popular para usar tiles do Google no Leaflet (Super rápido)
    const googleSatellite = L.tileLayer('http://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: 'Google Maps'
    });

    // 3. (Removido labels separados pois o Google Hybrid já traz junto)

    layersRef.current = {
      streets: esriStreets,
      satellite: googleSatellite,
      hybrid: googleSatellite, // Google já é hibrido
    };

    // Inicia com Streets
    esriStreets.addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);
  }

  async function loadLayers() {
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data } = await supabase.from('gis_layers').select('*');
      if (data) setCamadas(data);
    } catch (e) { console.error(e); }
  }

  async function loadProperties() {
    try {
      setLoadingProperties(true);
      const { supabase } = await import('@/lib/supabase');
      const { data } = await supabase.from('properties').select('*');

      if (data) {
        const initialProps = data.map((p: any) => ({
          ...p,
          lat: p.lat || null,
          lng: p.lng || null,
          geocoded: false
        }));

        setProperties(initialProps);
        setLoadingProperties(false);
        // Tenta achar os sem coord
        processGeocodingQueue(initialProps);
      }
    } catch (e) { console.error(e); }
  }

  async function processGeocodingQueue(props: Property[]) {
    const updatedProps = [...props];
    let changed = false;

    for (let i = 0; i < updatedProps.length; i++) {
      const prop = updatedProps[i];
      if (prop.lat && prop.lng && prop.lat !== 0) continue;

      if (i < 50 && !prop.geocoded) {
        try {
          let foundLat = null;
          let foundLng = null;

          // 1. Tentar endereço exato
          if (!foundLat) {
            const query = `${prop.street}, ${prop.number || ''}, Salesópolis, São Paulo, Brazil`;
            // Usar Nominatim (Free)
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
            try {
              const res = await fetch(url);
              const d = await res.json();
              if (d && d.length > 0) {
                foundLat = parseFloat(d[0].lat);
                foundLng = parseFloat(d[0].lon);
              }
            } catch (e) { }
          }

          // 2. Tentar CEP
          if (!foundLat && prop.zip_code) {
            const cleanCep = prop.zip_code.replace(/\D/g, '');
            const urlCep = `https://nominatim.openstreetmap.org/search?format=json&postalcode=${cleanCep}&country=Brazil&limit=1`;
            try {
              const res = await fetch(urlCep);
              const d = await res.json();
              if (d && d.length > 0) {
                foundLat = parseFloat(d[0].lat);
                foundLng = parseFloat(d[0].lon);
              }
            } catch (e) { }
          }

          // 3. Fallback Cidade
          if (!foundLat) {
            const queryF = `${prop.street}, Salesópolis, São Paulo`;
            const urlF = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryF)}&limit=1`;
            try {
              const res = await fetch(urlF);
              const d = await res.json();
              if (d && d.length > 0) {
                foundLat = parseFloat(d[0].lat);
                foundLng = parseFloat(d[0].lon);
              }
            } catch (e) { }
          }

          if (foundLat) {
            updatedProps[i].lat = foundLat;
            updatedProps[i].lng = foundLng;
            updatedProps[i].geocoded = true;
            changed = true;
            setProperties([...updatedProps]);
          }
        } catch (e) { }

        await new Promise(r => setTimeout(r, 1200));
      }
    }
  }

  useEffect(() => {
    if (!mapInstanceRef.current || properties.length === 0) return;
    const L = (window as any).L;
    const map = mapInstanceRef.current;

    Object.values(markersRef.current).forEach((m: any) => m.remove());
    markersRef.current = {};

    properties.forEach(prop => {
      if (!prop.lat || !prop.lng) return;

      const marker = L.marker([prop.lat, prop.lng], {
        icon: L.divIcon({
          className: 'custom-pin',
          html: `
            <div style="
              background-color: ${prop.property_type === 'Comercial' ? '#0288d1' : prop.property_type === 'Industrial' ? '#ed6c02' : '#1976d2'}; 
              width: 14px; height: 14px; 
              border-radius: 50%; 
              border: 2px solid white; 
              box-shadow: 0 2px 5px rgba(0,0,0,0.5);
            "></div>
          `,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        })
      }).addTo(map);

      marker.on('click', () => {
        setIsPanelOpen(true);
        handleMarkerClick(prop);
      });

      markersRef.current[prop.id] = marker;
    });
  }, [properties]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const L = (window as any).L;

    Object.entries(markersRef.current).forEach(([id, marker]: any) => {
      const isSelected = id === selectedPropertyId;
      if (isSelected) {
        marker.setZIndexOffset(1000);
        marker.setIcon(L.divIcon({
          className: 'selected-pin',
          html: `
              <div style="
                background-color: #d81b60; 
                width: 40px; height: 40px; 
                border-radius: 50% 50% 50% 0; 
                transform: rotate(-45deg); 
                border: 3px solid white; 
                box-shadow: 0 5px 15px rgba(0,0,0,0.5); 
                display: flex; align-items: center; justify-content: center;
              ">
                 <div style="width: 14px; height: 14px; background: white; border-radius: 50%;"></div>
              </div>
            `,
          iconSize: [40, 40],
          iconAnchor: [20, 40],
          popupAnchor: [0, -35]
        }));
        mapInstanceRef.current.flyTo(marker.getLatLng(), 18, { animate: true, duration: 1.2 });
      }
    });
  }, [selectedPropertyId]);

  const handleMarkerClick = (prop: Property) => {
    setSelectedPropertyId(prop.id);
    setActiveTab(0);
    setTimeout(() => {
      document.getElementById(`card-${prop.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const filtered = properties.filter(p =>
    p.street.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.digital_code.includes(searchTerm)
  );

  return (
    <Box sx={{ position: 'relative', width: '100%', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>

      {/* MAPA FULLSCREEN */}
      <div ref={mapRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }} />

      {/* CONTROLES FLUTUANTES (SUPERIOR ESQUERDO/DIREITO) */}
      <Box sx={{ position: 'absolute', top: 20, left: 20, zIndex: 1100, display: 'flex', gap: 1 }}>
        <Paper sx={{ borderRadius: 2, overflow: 'hidden', display: 'flex' }}>
          <Tooltip title="Seu Local">
            <IconButton onClick={() => mapInstanceRef.current?.setView([-23.5323, -45.8466], 15)}>
              <MyLocationIcon color="primary" />
            </IconButton>
          </Tooltip>
        </Paper>

        <Paper sx={{ borderRadius: 2, overflow: 'hidden', display: 'flex' }}>
          <Tooltip title="Mapa de Ruas">
            <IconButton
              color={mapType === 'streets' ? 'primary' : 'default'}
              onClick={() => setMapType('streets')}
            >
              <StreetIcon />
            </IconButton>
          </Tooltip>
          <Divider orientation="vertical" flexItem />
          <Tooltip title="Satélite">
            <IconButton
              color={mapType === 'satellite' ? 'primary' : 'default'}
              onClick={() => setMapType('satellite')}
            >
              <SatelliteIcon />
            </IconButton>
          </Tooltip>
        </Paper>
      </Box>

      {/* MENU LATERAL FLUTUANTE */}
      <Paper
        elevation={8}
        sx={{
          position: 'absolute', top: 20, right: 20, bottom: 20,
          width: 380, zIndex: 1200, borderRadius: 3,
          display: 'flex', flexDirection: 'column',
          transform: isPanelOpen ? 'translateX(0)' : 'translateX(calc(100% + 40px))',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          bgcolor: 'background.paper',
        }}
      >
        {/* Toggle para Abrir */}
        {!isPanelOpen && (
          <Box onClick={() => setIsPanelOpen(true)}
            sx={{
              position: 'absolute', left: -50, top: 20, width: 40, height: 40,
              bgcolor: 'background.paper', borderRadius: 2, boxShadow: 3,
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
            }}
          >
            <ChevronLeft />
          </Box>
        )}

        {/* Header */}
        <Box sx={{ p: 0, borderBottom: 1, borderColor: 'divider' }}>
          <Box display="flex" alignItems="center" p={1} pr={2}>
            <IconButton onClick={() => setIsPanelOpen(false)}><ChevronRight /></IconButton>
            <Typography variant="h6" fontWeight={700} sx={{ flex: 1, ml: 1 }}>Imóveis</Typography>
          </Box>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="fullWidth">
            <Tab icon={<PlaceIcon />} label="Lista" />
            <Tab icon={<LayersIcon />} label="Camadas" />
          </Tabs>
          {activeTab === 0 && (
            <Box p={2}>
              <TextField
                fullWidth size="small" placeholder="Filtrar..."
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
                  sx: { borderRadius: 3 }
                }}
              />
            </Box>
          )}
        </Box>

        {/* Lista */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: theme.palette.mode === 'dark' ? '#121212' : '#f8f9fa' }}>
          {activeTab === 0 && filtered.map(prop => (
            <Card
              key={prop.id} id={`card-${prop.id}`}
              onClick={() => setSelectedPropertyId(prop.id)}
              elevation={selectedPropertyId === prop.id ? 4 : 0}
              sx={{
                mb: 2, borderRadius: 3,
                border: '1px solid', borderColor: selectedPropertyId === prop.id ? 'primary.main' : 'divider',
                bgcolor: 'background.paper', cursor: 'pointer',
              }}
            >
              <CardActionArea sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: getPropertyColor(prop.property_type), width: 40, height: 40 }}>
                    {getPropertyIcon(prop.property_type)}
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ maxWidth: 190 }}>
                      {prop.street}, {prop.number || 'S/N'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">{prop.neighborhood}</Typography>
                    <Box display="flex" gap={1} mt={0.5} alignItems="center">
                      <Chip
                        label={prop.digital_code}
                        size="small"
                        sx={{ height: 18, fontSize: '0.6rem', fontWeight: 600 }}
                      />
                      {prop.geocoded && (
                        <Tooltip title="Localização Verificada">
                          <GpsIcon color="success" sx={{ fontSize: 14 }} />
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                </Box>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}
