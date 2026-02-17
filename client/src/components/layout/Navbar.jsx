import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const navLinks = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/tracker', label: 'Cycle Tracker', icon: '📅' },
    { path: '/health', label: 'Health Metrics', icon: '💪' },
    { path: '/daily-log', label: 'Daily Log', icon: '📝' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Navbar() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();

    return (
        <nav className="sticky top-0 z-50 glass-card rounded-none border-x-0 border-t-0 px-6 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 no-underline">
                    <span className="text-2xl">🌸</span>
                    <span className="text-xl font-bold gradient-text">mCycle</span>
                </Link>

                <div className="hidden md:flex items-center gap-1">
                    {navLinks.map(link => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`px-3 py-2 rounded-lg text-sm font-medium no-underline transition-all ${location.pathname === link.path
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted hover:text-text dark:hover:text-text-dark hover:bg-primary/5'
                                }`}
                        >
                            <span className="mr-1">{link.icon}</span>
                            {link.label}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg hover:bg-primary/10 transition-all text-lg"
                        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                    >
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>

                    {user && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium hidden sm:inline">{user.name}</span>
                            <button
                                onClick={logout}
                                className="text-sm text-muted hover:text-danger transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile nav */}
            <div className="md:hidden flex overflow-x-auto gap-1 mt-2 pb-1 -mx-2 px-2">
                {navLinks.map(link => (
                    <Link
                        key={link.path}
                        to={link.path}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium no-underline whitespace-nowrap ${location.pathname === link.path
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted'
                            }`}
                    >
                        {link.icon} {link.label}
                    </Link>
                ))}
            </div>
        </nav>
    );
}
