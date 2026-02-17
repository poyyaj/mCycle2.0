import { useState } from 'react';
import CycleCalendar from '../components/calendar/CycleCalendar';
import { useCycles, useInsights } from '../hooks/useApi';
import { formatDate } from '../utils/dateHelpers';

export default function CycleTracker() {
    const { cycles, loading, addCycle, deleteCycle } = useCycles();
    const { insights } = useInsights();
    const [selectedDate, setSelectedDate] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSelectDate = (date) => {
        setSelectedDate(date);
        if (!startDate) {
            setStartDate(date);
            setShowAddForm(true);
        } else if (!endDate && date > startDate) {
            setEndDate(date);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!startDate) return;
        setSubmitting(true);
        try {
            await addCycle({ start_date: startDate, end_date: endDate || null, notes: notes || null });
            setStartDate('');
            setEndDate('');
            setNotes('');
            setShowAddForm(false);
        } catch (err) {
            console.error('Add cycle error:', err);
        }
        setSubmitting(false);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 fade-in">
            <h1 className="text-3xl font-bold gradient-text mb-6">📅 Cycle Tracker</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <CycleCalendar
                        cycles={cycles}
                        insights={insights}
                        selectedDate={selectedDate}
                        onSelectDate={handleSelectDate}
                    />
                </div>

                <div className="space-y-4">
                    {/* Add period form */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-bold gradient-text mb-3">🩸 Log Period</h3>
                        <p className="text-xs text-muted mb-3">Click dates on the calendar or enter manually below</p>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-muted mb-1">Start Date *</label>
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input-field" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted mb-1">End Date</label>
                                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input-field" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted mb-1">Notes</label>
                                <textarea value={notes} onChange={e => setNotes(e.target.value)} className="input-field" rows="2" placeholder="Optional notes..." />
                            </div>
                            <button type="submit" className="btn-primary w-full" disabled={submitting || !startDate}>
                                {submitting ? 'Saving...' : 'Log Period'}
                            </button>
                            {startDate && (
                                <button type="button" onClick={() => { setStartDate(''); setEndDate(''); setNotes(''); }} className="btn-secondary w-full text-sm">
                                    Clear
                                </button>
                            )}
                        </form>
                    </div>

                    {/* Logged cycles list */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-bold gradient-text mb-3">📋 Logged Cycles</h3>
                        {loading ? (
                            <div className="flex justify-center py-4"><div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
                        ) : cycles.length === 0 ? (
                            <p className="text-sm text-muted">No cycles logged yet.</p>
                        ) : (
                            <div className="space-y-2 max-h-80 overflow-y-auto">
                                {cycles.map(c => (
                                    <div key={c.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-primary/5 transition-all">
                                        <div>
                                            <p className="text-sm font-medium">{formatDate(c.start_date)} {c.end_date ? `→ ${formatDate(c.end_date)}` : '(ongoing)'}</p>
                                            <p className="text-xs text-muted">
                                                {c.cycle_length && `${c.cycle_length}d cycle`}
                                                {c.bleeding_duration && ` · ${c.bleeding_duration}d bleeding`}
                                            </p>
                                        </div>
                                        <button onClick={() => deleteCycle(c.id)} className="text-muted hover:text-danger text-sm transition-colors">✕</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
