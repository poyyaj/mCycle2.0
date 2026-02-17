import { useInsights, useCycles } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/dateHelpers';
import ConsistencyScore from '../components/insights/ConsistencyScore';

export default function Dashboard() {
    const { user } = useAuth();
    const { cycles, loading: cyclesLoading } = useCycles();
    const { insights, loading: insightsLoading } = useInsights();

    const loading = cyclesLoading || insightsLoading;
    const ca = insights?.cycle_analysis;
    const latestCycle = cycles?.[0];

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 fade-in">
            {/* Welcome header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold">
                    Hello, <span className="gradient-text">{user?.name || 'there'}</span> 🌸
                </h1>
                <p className="text-muted mt-1">Here's your health overview</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
            ) : (
                <>
                    {/* Quick stats row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <StatCard icon="📅" title="Last Period" value={latestCycle ? formatDate(latestCycle.start_date) : 'No data'} subtitle={latestCycle?.bleeding_duration ? `${latestCycle.bleeding_duration} days` : ''} />
                        <StatCard icon="🔮" title="Next Predicted" value={ca?.prediction?.predicted_next ? formatDate(ca.prediction.predicted_next) : 'N/A'} subtitle={ca?.prediction?.confidence ? `${ca.prediction.confidence} confidence` : ''} />
                        <StatCard icon="📏" title="Avg Cycle" value={ca?.avg_cycle_length ? `${ca.avg_cycle_length} days` : 'N/A'} subtitle={`${cycles.length} cycles tracked`} />
                        <StatCard icon="🌡️" title="PCOS Score" value={insights?.pcos_indicators ? `${insights.pcos_indicators.risk_score}/${insights.pcos_indicators.max_score}` : 'N/A'} subtitle="Educational indicator" />
                    </div>

                    {/* Second row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        <div className="lg:col-span-2">
                            {/* Fertile window & prediction */}
                            {ca?.fertile_window && (
                                <div className="glass-card p-6 mb-6">
                                    <h3 className="text-lg font-bold gradient-text mb-3">🌺 Fertile Window</h3>
                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full bg-fertile" />
                                            <span className="text-sm">{formatDate(ca.fertile_window.start)} — {formatDate(ca.fertile_window.end)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full bg-ovulation" />
                                            <span className="text-sm">Ovulation: {formatDate(ca.fertile_window.ovulation_date)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Recent cycles */}
                            <div className="glass-card p-6">
                                <h3 className="text-lg font-bold gradient-text mb-3">📋 Recent Cycles</h3>
                                {cycles.length === 0 ? (
                                    <p className="text-muted text-sm">No cycles recorded yet. Start tracking!</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-primary/10">
                                                    <th className="text-left py-2 font-medium text-muted">Start</th>
                                                    <th className="text-left py-2 font-medium text-muted">End</th>
                                                    <th className="text-left py-2 font-medium text-muted">Length</th>
                                                    <th className="text-left py-2 font-medium text-muted">Bleeding</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {cycles.slice(0, 5).map(c => (
                                                    <tr key={c.id} className="border-b border-primary/5">
                                                        <td className="py-2">{formatDate(c.start_date)}</td>
                                                        <td className="py-2">{c.end_date ? formatDate(c.end_date) : '—'}</td>
                                                        <td className="py-2">{c.cycle_length ? `${c.cycle_length}d` : '—'}</td>
                                                        <td className="py-2">{c.bleeding_duration ? `${c.bleeding_duration}d` : '—'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Consistency + metrics */}
                        <div className="space-y-6">
                            <ConsistencyScore score={ca?.consistency_score ?? null} />

                            {insights?.latest_metrics && (
                                <div className="glass-card p-6">
                                    <h3 className="text-lg font-bold gradient-text mb-3">💪 Latest Metrics</h3>
                                    <div className="space-y-2 text-sm">
                                        {insights.latest_metrics.bmi && (
                                            <div className="flex justify-between"><span className="text-muted">BMI</span><span className="font-semibold">{insights.latest_metrics.bmi}</span></div>
                                        )}
                                        {insights.latest_metrics.weight_kg && (
                                            <div className="flex justify-between"><span className="text-muted">Weight</span><span className="font-semibold">{insights.latest_metrics.weight_kg} kg</span></div>
                                        )}
                                        {insights.latest_metrics.waist_hip_ratio && (
                                            <div className="flex justify-between"><span className="text-muted">WHR</span><span className="font-semibold">{insights.latest_metrics.waist_hip_ratio}</span></div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function StatCard({ icon, title, value, subtitle }) {
    return (
        <div className="glass-card p-5 slide-up">
            <div className="flex items-center gap-3">
                <span className="text-2xl">{icon}</span>
                <div>
                    <p className="text-xs font-medium text-muted uppercase tracking-wide">{title}</p>
                    <p className="text-xl font-bold gradient-text">{value}</p>
                    {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
                </div>
            </div>
        </div>
    );
}
