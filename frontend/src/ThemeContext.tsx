import { createContext, useContext, useState, useMemo, ReactNode, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, PaletteMode } from '@mui/material';
import { theme as baseTheme } from './theme';

interface ThemeContextType {
    mode: PaletteMode;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    mode: 'light',
    toggleTheme: () => { },
});

export const useThemeMode = () => useContext(ThemeContext);

interface ThemeProviderProps {
    children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const [mode, setMode] = useState<PaletteMode>(() => {
        // Primeiro, verifica se há uma preferência salva
        const savedMode = localStorage.getItem('themeMode');
        if (savedMode) {
            return savedMode as PaletteMode;
        }

        // Se não houver preferência salva, detecta o tema do sistema
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return prefersDark ? 'dark' : 'light';
    });

    useEffect(() => {
        // Salva a preferência do usuário
        localStorage.setItem('themeMode', mode);
    }, [mode]);

    useEffect(() => {
        // Listener para detectar mudanças no tema do sistema
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (e: MediaQueryListEvent) => {
            // Só atualiza se o usuário não tiver uma preferência manual salva
            const savedMode = localStorage.getItem('themeMode');
            if (!savedMode) {
                setMode(e.matches ? 'dark' : 'light');
            }
        };

        // Adiciona o listener (compatível com navegadores antigos e novos)
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange);
        } else {
            // Fallback para navegadores antigos
            mediaQuery.addListener(handleChange);
        }

        // Cleanup
        return () => {
            if (mediaQuery.removeEventListener) {
                mediaQuery.removeEventListener('change', handleChange);
            } else {
                mediaQuery.removeListener(handleChange);
            }
        };
    }, []);

    const toggleTheme = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    const theme = useMemo(
        () =>
            createTheme({
                ...baseTheme,
                palette: {
                    mode,
                    ...(mode === 'light'
                        ? {
                            // Modo Claro
                            primary: {
                                main: '#1976d2',
                                light: '#42a5f5',
                                dark: '#1565c0',
                                contrastText: '#fff',
                            },
                            secondary: {
                                main: '#dc004e',
                                light: '#f73378',
                                dark: '#9a0036',
                                contrastText: '#fff',
                            },
                            background: {
                                default: '#f5f5f5',
                                paper: '#ffffff',
                            },
                            text: {
                                primary: 'rgba(0, 0, 0, 0.87)',
                                secondary: 'rgba(0, 0, 0, 0.6)',
                                disabled: 'rgba(0, 0, 0, 0.38)',
                            },
                        }
                        : {
                            // Modo Escuro
                            primary: {
                                main: '#90caf9',
                                light: '#e3f2fd',
                                dark: '#42a5f5',
                                contrastText: '#000',
                            },
                            secondary: {
                                main: '#f48fb1',
                                light: '#ffc1e3',
                                dark: '#bf5f82',
                                contrastText: '#000',
                            },
                            background: {
                                default: '#121212',
                                paper: '#1e1e1e',
                            },
                            text: {
                                primary: '#ffffff',
                                secondary: 'rgba(255, 255, 255, 0.7)',
                                disabled: 'rgba(255, 255, 255, 0.5)',
                            },
                        }),
                },
                components: {
                    MuiTableContainer: {
                        styleOverrides: {
                            root: {
                                borderRadius: '12px',
                                overflow: 'hidden',
                                boxShadow: mode === 'light'
                                    ? '0 2px 8px rgba(0, 0, 0, 0.1)'
                                    : '0 2px 8px rgba(0, 0, 0, 0.3)',
                            },
                        },
                    },
                    MuiTable: {
                        styleOverrides: {
                            root: {
                                borderCollapse: 'separate',
                                borderSpacing: 0,
                            },
                        },
                    },
                    MuiTableCell: {
                        styleOverrides: {
                            head: {
                                fontWeight: 600,
                                backgroundColor: mode === 'light' ? '#f5f5f5' : '#2a2a2a',
                                borderBottom: `2px solid ${mode === 'light' ? '#e0e0e0' : '#404040'}`,
                                '&:first-of-type': {
                                    borderTopLeftRadius: '12px',
                                },
                                '&:last-of-type': {
                                    borderTopRightRadius: '12px',
                                },
                            },
                            root: {
                                borderBottom: `1px solid ${mode === 'light' ? '#e0e0e0' : '#404040'}`,
                            },
                        },
                    },
                    MuiPaper: {
                        styleOverrides: {
                            root: {
                                backgroundImage: 'none',
                            },
                        },
                    },
                },
            }),
        [mode]
    );

    return (
        <ThemeContext.Provider value={{ mode, toggleTheme }}>
            <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
        </ThemeContext.Provider>
    );
}
