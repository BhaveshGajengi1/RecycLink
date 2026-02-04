import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('recyclink_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error('Error parsing stored user:', error);
                localStorage.removeItem('recyclink_user');
            }
        }
        setLoading(false);
    }, []);

    // Save user to localStorage whenever it changes
    useEffect(() => {
        if (user) {
            localStorage.setItem('recyclink_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('recyclink_user');
        }
    }, [user]);

    const login = (userData) => {
        setUser(userData);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('recyclink_user');
        localStorage.removeItem('recyclink_token');
    };

    const isCustomer = () => user?.role === 'customer';
    const isAgent = () => user?.role === 'agent';
    const isAuthenticated = () => !!user;

    const value = {
        user,
        loading,
        login,
        logout,
        isCustomer,
        isAgent,
        isAuthenticated
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider, useAuth };
