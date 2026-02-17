import { getConsistencyLabel } from '../../utils/calculations';

export default function PCOSInsights({ insights }) {
    if (!insights) return null;
    const { pcos_indicators, disclaimer } = insights;
    if (!pcos_indicators) return null;

    const { risk_score, max_score, warnings } = pcos_indicators;

    const getRiskColor = () => {
        if (risk_score <= 1) return 'text-success';
        if (risk_score <= 3) return 'text-warning';
        return 'text-danger';
    };

    const getRiskLabel = () => {
        if (risk_score === 0) return 'No indicators detected';
        if (risk_score <= 1) return 'Minimal indicators';
        if (risk_score <= 3) return 'Some indicators present';
        return 'Multiple indicators detected';
    };

    return (
        <div className="glass-card p-6 fade-in">
            <h3 className="text-lg font-bold gradient-text mb-4">🔍 PCOS Insights</h3>

            {/* Risk Score */}
            <div className="flex items-center gap-4 mb-4">
                <div className="relative w-20 h-20">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-200 dark:text-gray-700" />
                        <circle cx="50" cy="50" r="40" fill="none" strokeWidth="8"
                            className={getRiskColor()}
                            strokeDasharray={`${(risk_score / max_score) * 251.3} 251.3`}
                            strokeLinecap="round" />
                    </svg>
                    <span className={`absolute inset-0 flex items-center justify-center text-xl font-bold ${getRiskColor()}`}>
                        {risk_score}/{max_score}
                    </span>
                </div>
                <div>
                    <p className={`font-semibold ${getRiskColor()}`}>{getRiskLabel()}</p>
                    <p className="text-sm text-muted">Educational Risk Score (Rotterdam-inspired)</p>
                </div>
            </div>

            {/* Warnings */}
            {warnings && warnings.length > 0 && (
                <div className="space-y-3 mb-4">
                    {warnings.map((w, i) => (
                        <div key={i} className={`p-3 rounded-lg border-l-4 ${w.severity === 'warning' ? 'border-warning bg-warning/5' : 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                            }`}>
                            <p className="text-sm font-medium">{w.message}</p>
                            {w.detail && <p className="text-xs text-muted mt-1">{w.detail}</p>}
                        </div>
                    ))}
                </div>
            )}

            {warnings && warnings.length === 0 && (
                <div className="p-3 rounded-lg bg-success/10 border-l-4 border-success mb-4">
                    <p className="text-sm font-medium text-success">No warning indicators detected. Keep tracking! 🌟</p>
                </div>
            )}

            {/* Disclaimer */}
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-800 dark:text-amber-200 font-medium flex items-start gap-2">
                    <span className="text-lg">⚕️</span>
                    <span>{disclaimer}</span>
                </p>
            </div>
        </div>
    );
}
