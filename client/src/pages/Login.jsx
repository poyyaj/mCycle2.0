import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please try again.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{
            background: 'linear-gradient(135deg, #fdf2f8, #faf5ff, #f0fdf4)'
        }}>
            <div className="glass-card p-8 w-full max-w-md slide-up">
                <div className="text-center mb-8">
                    <span className="text-5xl mb-3 block">🌸</span>
                    <h1 className="text-3xl font-bold gradient-text">Welcome Back</h1>
                    <p className="text-muted mt-1">Log in to your mCycle account</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-danger/10 text-danger text-sm text-center">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-muted mb-1">Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted mb-1">Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" placeholder="••••••••" required />
                    </div>
                    <button type="submit" className="btn-primary w-full" disabled={loading}>
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>

                <p className="text-center text-sm text-muted mt-6">
                    Don't have an account? <Link to="/signup" className="text-primary font-semibold hover:underline">Sign up</Link>
                </p>
            </div>
        </div>
    );
}
