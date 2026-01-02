import { ToastContainer } from 'react-toastify';
import { useThemeMode } from '@/ThemeContext';
import 'react-toastify/dist/ReactToastify.css';

export function ThemedToastContainer() {
    const { mode } = useThemeMode();

    return (
        <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme={mode === 'dark' ? 'dark' : 'light'}
            style={{
                zIndex: 9999,
            }}
            toastStyle={{
                borderRadius: '8px',
                boxShadow: mode === 'dark'
                    ? '0 4px 12px rgba(0, 0, 0, 0.5)'
                    : '0 4px 12px rgba(0, 0, 0, 0.15)',
            }}
        />
    );
}
