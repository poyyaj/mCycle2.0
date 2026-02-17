import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            return setError('Passwords do not match.');
        }
        if (password.length < 6) {
            return setError('Password must be at least 6 characters.');
        }
        setLoading(true);
        try {
            await signup(name, email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Signup failed. Please try again.');
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
                    <h1 className="text-3xl font-bold gradient-text">Create Account</h1>
                    <p className="text-muted mt-1">Start tracking your health journey</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-danger/10 text-danger text-sm text-center">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-muted mb-1">Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="Your name" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted mb-1">Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted mb-1">Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" placeholder="Min 6 characters" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted mb-1">Confirm Password</label>
                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="input-field" placeholder="••••••••" required />
                    </div>
                    <button type="submit" className="btn-primary w-full" disabled={loading}>
                        {loading ? 'Creating account...' : 'Sign Up'}
                    </button>
                </form>

                <p className="text-center text-sm text-muted mt-6">
                    Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Log in</Link>
                </p>
            </div>
        </div>
    );
}
