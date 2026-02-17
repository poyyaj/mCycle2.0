import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('mcycle_token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            axios.get('/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => { setUser(res.data.user); setLoading(false); })
                .catch(() => { localStorage.removeItem('mcycle_token'); setToken(null); setUser(null); setLoading(false); });
        } else {
            setLoading(false);
        }
    }, [token]);

    const login = async (email, password) => {
        const res = await axios.post('/api/auth/login', { email, password });
        localStorage.setItem('mcycle_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const signup = async (name, email, password) => {
        const res = await axios.post('/api/auth/signup', { name, email, password });
        localStorage.setItem('mcycle_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('mcycle_token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
