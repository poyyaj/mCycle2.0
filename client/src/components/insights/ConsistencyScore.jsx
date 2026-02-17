import { getConsistencyLabel } from '../../utils/calculations';

export default function ConsistencyScore({ score }) {
    if (score === null || score === undefined) {
        return (
            <div className="glass-card p-6 fade-in text-center">
                <h3 className="text-lg font-bold gradient-text mb-2">🎯 Consistency Score</h3>
                <p className="text-muted text-sm">Not enough data yet. Track at least 2 cycles.</p>
            </div>
        );
    }

    const getColor = () => {
        if (score >= 90) return '#10b981';
        if (score >= 75) return '#f59e0b';
        if (score >= 60) return '#f97316';
        return '#ef4444';
    };

    const circumference = 2 * Math.PI * 45;
    const dashOffset = circumference - (score / 100) * circumference;

    return (
        <div className="glass-card p-6 fade-in text-center">
            <h3 className="text-lg font-bold gradient-text mb-4">🎯 Cycle Consistency</h3>

            <div className="relative w-32 h-32 mx-auto mb-3">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" className="text-gray-200 dark:text-gray-700" />
                    <circle cx="50" cy="50" r="45" fill="none" strokeWidth="6"
                        stroke={getColor()}
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 1s ease' }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold" style={{ color: getColor() }}>{score}</span>
                    <span className="text-xs text-muted">/100</span>
                </div>
            </div>

            <p className="font-semibold text-sm" style={{ color: getColor() }}>{getConsistencyLabel(score)}</p>
        </div>
    );
}
