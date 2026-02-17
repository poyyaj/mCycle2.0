import DailyLogForm from '../components/forms/DailyLogForm';
import { useLogs } from '../hooks/useApi';
import { formatDate } from '../utils/dateHelpers';

const MOOD_EMOJIS = { happy: '😊', calm: '😌', anxious: '😰', sad: '😢', irritable: '😤' };

export default function DailyLog() {
    const { logs, loading, addLog } = useLogs();

    const handleSubmit = async (data) => {
        try { await addLog(data); } catch (err) { console.error('Add log error:', err); }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 fade-in">
            <h1 className="text-3xl font-bold gradient-text mb-6">📝 Daily Log</h1>

            <DailyLogForm onSubmit={handleSubmit} />

            <div className="glass-card p-6 mt-6">
                <h3 className="text-lg font-bold gradient-text mb-3">📋 Recent Logs</h3>
                {loading ? (
                    <div className="flex justify-center py-4"><div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
                ) : logs.length === 0 ? (
                    <p className="text-sm text-muted">No logs yet. Start logging your daily symptoms!</p>
                ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {logs.map(log => (
                            <div key={log.id} className="p-4 rounded-lg border border-primary/10 hover:border-primary/20 transition-all">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-sm">{formatDate(log.log_date)}</span>
                                    {log.mood && <span className="text-xl" title={log.mood}>{MOOD_EMOJIS[log.mood] || '🙂'}</span>}
                                </div>
                                <div className="flex flex-wrap gap-3 text-xs">
                                    {log.pain_level > 0 && (
                                        <span className="px-2 py-1 rounded-full bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300">
                                            Pain: {log.pain_level}/10
                                        </span>
                                    )}
                                    {log.acne_level > 0 && (
                                        <span className="px-2 py-1 rounded-full bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-300">
                                            Acne: {log.acne_level}/5
                                        </span>
                                    )}
                                    {log.hair_growth_level > 0 && (
                                        <span className="px-2 py-1 rounded-full bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-300">
                                            Hair: {log.hair_growth_level}/5
                                        </span>
                                    )}
                                    {log.exercise_type && (
                                        <span className="px-2 py-1 rounded-full bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-300">
                                            🏃 {log.exercise_type} {log.exercise_minutes ? `(${log.exercise_minutes}min)` : ''}
                                        </span>
                                    )}
                                    {log.medication && (
                                        <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300">
                                            💊 {log.medication}
                                        </span>
                                    )}
                                </div>
                                {log.notes && <p className="text-xs text-muted mt-2">{log.notes}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
