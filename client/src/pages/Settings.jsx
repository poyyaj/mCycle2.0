import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useInsights, useCycles } from '../hooks/useApi';
import { generateHealthReport } from '../utils/pdfExport';

export default function Settings() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { insights } = useInsights();
    const { cycles } = useCycles();

    const handleExportPDF = () => {
        generateHealthReport(user, cycles, null, insights);
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 fade-in">
            <h1 className="text-3xl font-bold gradient-text mb-6">⚙️ Settings</h1>

            {/* Profile */}
            <div className="glass-card p-6 mb-6">
                <h3 className="text-lg font-bold gradient-text mb-4">👤 Profile</h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted">Name</span>
                        <span className="font-medium">{user?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted">Email</span>
                        <span className="font-medium">{user?.email || 'N/A'}</span>
                    </div>
                </div>
            </div>

            {/* Appearance */}
            <div className="glass-card p-6 mb-6">
                <h3 className="text-lg font-bold gradient-text mb-4">🎨 Appearance</h3>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium">Dark Mode</p>
                        <p className="text-sm text-muted">Switch between light and dark theme</p>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className={`relative w-14 h-7 rounded-full transition-all duration-300 ${theme === 'dark' ? 'bg-secondary' : 'bg-gray-300'
                            }`}
                    >
                        <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all duration-300 ${theme === 'dark' ? 'left-7' : 'left-0.5'
                            }`} />
                    </button>
                </div>
            </div>

            {/* Export */}
            <div className="glass-card p-6 mb-6">
                <h3 className="text-lg font-bold gradient-text mb-4">📄 Export</h3>
                <p className="text-sm text-muted mb-3">Generate a comprehensive health report PDF that you can share with your doctor.</p>
                <button onClick={handleExportPDF} className="btn-primary">
                    📥 Download Health Report (PDF)
                </button>
            </div>

            {/* Logout */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-bold gradient-text mb-4">🚪 Account</h3>
                <button onClick={logout} className="btn-secondary text-danger border-danger hover:bg-danger/5">
                    Log Out
                </button>
            </div>
        </div>
    );
}
