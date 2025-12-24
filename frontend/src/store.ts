import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import mapReducer from './features/map/mapSlice';
import propertiesReducer from './features/properties/propertiesSlice';
import addressesReducer from './features/addresses/addressesSlice';
import dashboardReducer from './features/dashboard/dashboardSlice';
import ticketsReducer from './features/tickets/ticketsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    map: mapReducer,
    properties: propertiesReducer,
    addresses: addressesReducer,
    dashboard: dashboardReducer,
    tickets: ticketsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable values in map state (Leaflet objects)
        ignoredActions: ['map/setMap', 'map/addLayer', 'map/removeLayer'],
        ignoredPaths: ['map.instance', 'map.layers'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
