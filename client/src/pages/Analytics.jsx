import { useInsights, useMetrics, useLogs } from '../hooks/useApi';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import PCOSInsights from '../components/insights/PCOSInsights';
import ConsistencyScore from '../components/insights/ConsistencyScore';

export default function Analytics() {
    const { insights, loading: insightsLoading } = useInsights();
    const { metrics } = useMetrics();
    const { logs } = useLogs();

    const ca = insights?.cycle_analysis;
    const cycleTrend = ca?.cycle_trend || [];

    // Weight trend data from metrics
    const weightTrend = (metrics || [])
        .filter(m => m.weight_kg)
        .map(m => ({ date: m.recorded_date, weight: m.weight_kg, bmi: m.bmi }))
        .reverse();

    // WHR trend
    const whrTrend = (metrics || [])
        .filter(m => m.waist_hip_ratio)
        .map(m => ({ date: m.recorded_date, whr: m.waist_hip_ratio }))
        .reverse();

    // Symptom aggregate (last 30 logs)
    const symptomData = (logs || []).slice(0, 30).map(l => ({
        date: l.log_date,
        pain: l.pain_level || 0,
        acne: l.acne_level || 0,
        hair: l.hair_growth_level || 0,
    })).reverse();

    const loading = insightsLoading;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 fade-in">
            <h1 className="text-3xl font-bold gradient-text mb-6">📈 Analytics</h1>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
            ) : (
                <>
                    {/* Top row: Consistency + PCOS */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        <ConsistencyScore score={ca?.consistency_score ?? null} />
                        <div className="lg:col-span-2">
                            <PCOSInsights insights={insights} />
                        </div>
                    </div>

                    {/* Cycle Length Trend */}
                    <div className="glass-card p-6 mb-6">
                        <h3 className="text-lg font-bold gradient-text mb-4">📏 Cycle Length Trend</h3>
                        {cycleTrend.length < 2 ? (
                            <p className="text-sm text-muted">Track at least 2 cycles to see trends</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={280}>
                                <LineChart data={cycleTrend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0e7f4" />
                                    <XAxis dataKey="start_date" tick={{ fontSize: 11 }} />
                                    <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fontSize: 11 }} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }} />
                                    <Legend />
                                    <Line type="monotone" dataKey="cycle_length" name="Cycle Length" stroke="#e91e8c" strokeWidth={3} dot={{ r: 5, fill: '#e91e8c' }} activeDot={{ r: 7 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Bleeding Duration */}
                    <div className="glass-card p-6 mb-6">
                        <h3 className="text-lg font-bold gradient-text mb-4">🩸 Bleeding Duration</h3>
                        {cycleTrend.length < 2 ? (
                            <p className="text-sm text-muted">Track at least 2 cycles to see trends</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={cycleTrend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0e7f4" />
                                    <XAxis dataKey="start_date" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="bleeding_duration" name="Bleeding Days" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Weight & BMI Trend */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-bold gradient-text mb-4">⚖️ Weight Trend</h3>
                            {weightTrend.length < 2 ? (
                                <p className="text-sm text-muted">Log at least 2 weight entries</p>
                            ) : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <AreaChart data={weightTrend}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0e7f4" />
                                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                        <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 11 }} />
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                        <Area type="monotone" dataKey="weight" name="Weight (kg)" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        <div className="glass-card p-6">
                            <h3 className="text-lg font-bold gradient-text mb-4">📊 WHR Over Time</h3>
                            {whrTrend.length < 2 ? (
                                <p className="text-sm text-muted">Log at least 2 waist/hip entries</p>
                            ) : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <LineChart data={whrTrend}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0e7f4" />
                                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                        <YAxis domain={[0.6, 1.0]} tick={{ fontSize: 11 }} />
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                        <Line type="monotone" dataKey="whr" name="WHR" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                                        {/* Reference line at 0.85 */}
                                        <Line type="monotone" dataKey={() => 0.85} name="Threshold (0.85)" stroke="#ef4444" strokeDasharray="5 5" dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* Symptom Trends */}
                    <div className="glass-card p-6 mb-6">
                        <h3 className="text-lg font-bold gradient-text mb-4">🌡️ Symptom Trends</h3>
                        {symptomData.length < 2 ? (
                            <p className="text-sm text-muted">Log daily symptoms to see trends</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={280}>
                                <AreaChart data={symptomData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0e7f4" />
                                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                    <Legend />
                                    <Area type="monotone" dataKey="pain" name="Pain" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} strokeWidth={2} />
                                    <Area type="monotone" dataKey="acne" name="Acne" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={2} />
                                    <Area type="monotone" dataKey="hair" name="Hair Growth" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
