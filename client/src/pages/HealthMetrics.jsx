import MetricsForm from '../components/forms/MetricsForm';
import { useMetrics } from '../hooks/useApi';
import { formatDate } from '../utils/dateHelpers';
import { getBMICategory } from '../utils/calculations';

export default function HealthMetrics() {
    const { metrics, loading, addMetric } = useMetrics();

    const handleSubmit = async (data) => {
        try {
            await addMetric(data);
        } catch (err) {
            console.error('Add metric error:', err);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 fade-in">
            <h1 className="text-3xl font-bold gradient-text mb-6">💪 Health Metrics</h1>

            <MetricsForm onSubmit={handleSubmit} />

            {/* Metrics history */}
            <div className="glass-card p-6 mt-6">
                <h3 className="text-lg font-bold gradient-text mb-3">📊 History</h3>
                {loading ? (
                    <div className="flex justify-center py-4"><div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
                ) : metrics.length === 0 ? (
                    <p className="text-sm text-muted">No metrics recorded yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-primary/10">
                                    <th className="text-left py-2 font-medium text-muted">Date</th>
                                    <th className="text-left py-2 font-medium text-muted">Weight</th>
                                    <th className="text-left py-2 font-medium text-muted">Height</th>
                                    <th className="text-left py-2 font-medium text-muted">BMI</th>
                                    <th className="text-left py-2 font-medium text-muted">Waist</th>
                                    <th className="text-left py-2 font-medium text-muted">Hip</th>
                                    <th className="text-left py-2 font-medium text-muted">WHR</th>
                                </tr>
                            </thead>
                            <tbody>
                                {metrics.map(m => (
                                    <tr key={m.id} className="border-b border-primary/5">
                                        <td className="py-2">{formatDate(m.recorded_date)}</td>
                                        <td className="py-2">{m.weight_kg ? `${m.weight_kg} kg` : '—'}</td>
                                        <td className="py-2">{m.height_cm ? `${m.height_cm} cm` : '—'}</td>
                                        <td className="py-2">
                                            {m.bmi ? (
                                                <span className={`px-2 py-0.5 rounded-full text-xs ${m.bmi < 18.5 ? 'bg-blue-100 text-blue-700' :
                                                        m.bmi < 25 ? 'bg-green-100 text-green-700' :
                                                            m.bmi < 30 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                                    }`}>{m.bmi} ({getBMICategory(m.bmi)})</span>
                                            ) : '—'}
                                        </td>
                                        <td className="py-2">{m.waist_cm ? `${m.waist_cm} cm` : '—'}</td>
                                        <td className="py-2">{m.hip_cm ? `${m.hip_cm} cm` : '—'}</td>
                                        <td className="py-2">
                                            {m.waist_hip_ratio ? (
                                                <span className={`px-2 py-0.5 rounded-full text-xs ${m.waist_hip_ratio > 0.85 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                                    {m.waist_hip_ratio}
                                                </span>
                                            ) : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
