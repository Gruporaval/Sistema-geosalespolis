import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Map as LeafletMap, Layer } from 'leaflet';

export interface MapLayer {
  id: string;
  name: string;
  type: 'properties' | 'addresses' | 'pgv' | 'districts' | 'custom';
  visible: boolean;
  data: any;
  layer?: Layer;
}

interface MapState {
  instance: LeafletMap | null;
  center: [number, number];
  zoom: number;
  layers: MapLayer[];
  selectedFeature: any | null;
  drawMode: boolean;
  measureMode: 'distance' | 'area' | null;
  filters: {
    district?: string;
    propertyType?: string;
    dateRange?: [string, string];
  };
}

const initialState: MapState = {
  instance: null,
  center: [-23.5505, -45.8473], // Salesópolis, SP
  zoom: 13,
  layers: [
    { id: 'properties', name: 'Imóveis', type: 'properties', visible: true, data: null },
    { id: 'addresses', name: 'Endereços', type: 'addresses', visible: true, data: null },
    { id: 'pgv', name: 'PGV', type: 'pgv', visible: false, data: null },
    { id: 'districts', name: 'Bairros', type: 'districts', visible: true, data: null },
  ],
  selectedFeature: null,
  drawMode: false,
  measureMode: null,
  filters: {},
};

const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setMap: (state, action: PayloadAction<LeafletMap | null>) => {
      state.instance = action.payload;
    },
    setCenter: (state, action: PayloadAction<[number, number]>) => {
      state.center = action.payload;
    },
    setZoom: (state, action: PayloadAction<number>) => {
      state.zoom = action.payload;
    },
    addLayer: (state, action: PayloadAction<MapLayer>) => {
      state.layers.push(action.payload);
    },
    removeLayer: (state, action: PayloadAction<string>) => {
      state.layers = state.layers.filter((layer) => layer.id !== action.payload);
    },
    toggleLayerVisibility: (state, action: PayloadAction<string>) => {
      const layer = state.layers.find((l) => l.id === action.payload);
      if (layer) {
        layer.visible = !layer.visible;
      }
    },
    updateLayerData: (state, action: PayloadAction<{ id: string; data: any }>) => {
      const layer = state.layers.find((l) => l.id === action.payload.id);
      if (layer) {
        layer.data = action.payload.data;
      }
    },
    setSelectedFeature: (state, action: PayloadAction<any | null>) => {
      state.selectedFeature = action.payload;
    },
    setDrawMode: (state, action: PayloadAction<boolean>) => {
      state.drawMode = action.payload;
      if (action.payload) {
        state.measureMode = null;
      }
    },
    setMeasureMode: (state, action: PayloadAction<'distance' | 'area' | null>) => {
      state.measureMode = action.payload;
      if (action.payload) {
        state.drawMode = false;
      }
    },
    setFilters: (state, action: PayloadAction<MapState['filters']>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
  },
});

export const {
  setMap,
  setCenter,
  setZoom,
  addLayer,
  removeLayer,
  toggleLayerVisibility,
  updateLayerData,
  setSelectedFeature,
  setDrawMode,
  setMeasureMode,
  setFilters,
  clearFilters,
} = mapSlice.actions;

export default mapSlice.reducer;
