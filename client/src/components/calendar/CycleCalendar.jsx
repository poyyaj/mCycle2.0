import { useState, useMemo } from 'react';
import { generateMonthDays, isDateInRange } from '../../utils/dateHelpers';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CycleCalendar({ cycles, onSelectDate, selectedDate, insights }) {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());

    const days = useMemo(() => generateMonthDays(currentYear, currentMonth), [currentYear, currentMonth]);

    const getDayStatus = (dateStr) => {
        if (!dateStr) return null;
        const statuses = [];

        for (const cycle of (cycles || [])) {
            if (cycle.end_date && isDateInRange(dateStr, cycle.start_date, cycle.end_date)) {
                statuses.push('bleeding');
            }
            if (!cycle.end_date && dateStr === cycle.start_date) {
                statuses.push('bleeding');
            }
        }

        if (insights?.cycle_analysis?.fertile_window) {
            const fw = insights.cycle_analysis.fertile_window;
            if (isDateInRange(dateStr, fw.start, fw.end)) {
                statuses.push('fertile');
            }
            if (dateStr === fw.ovulation_date) {
                statuses.push('ovulation');
            }
        }

        if (insights?.cycle_analysis?.prediction?.predicted_next) {
            const pred = insights.cycle_analysis.prediction.predicted_next;
            const predEnd = new Date(pred);
            predEnd.setDate(predEnd.getDate() + 5);
            if (isDateInRange(dateStr, pred, predEnd.toISOString().split('T')[0])) {
                statuses.push('predicted');
            }
        }

        return statuses;
    };

    const getStatusColor = (statuses) => {
        if (!statuses || statuses.length === 0) return '';
        if (statuses.includes('bleeding')) return 'bg-bleeding/20 text-bleeding border-bleeding/30';
        if (statuses.includes('ovulation')) return 'bg-ovulation/20 text-ovulation border-ovulation/30';
        if (statuses.includes('fertile')) return 'bg-fertile/20 text-amber-700 border-fertile/30';
        if (statuses.includes('predicted')) return 'bg-predicted/30 text-primary border-predicted/50';
        return '';
    };

    const prevMonth = () => {
        if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
        else setCurrentMonth(m => m - 1);
    };

    const nextMonth = () => {
        if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
        else setCurrentMonth(m => m + 1);
    };

    const todayStr = today.toISOString().split('T')[0];

    return (
        <div className="glass-card p-6 fade-in">
            <div className="flex items-center justify-between mb-6">
                <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-primary/10 transition-all text-lg">←</button>
                <h3 className="text-lg font-bold gradient-text">{MONTHS[currentMonth]} {currentYear}</h3>
                <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-primary/10 transition-all text-lg">→</button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEKDAYS.map(day => (
                    <div key={day} className="text-center text-xs font-semibold text-muted py-1">{day}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {days.map((d, i) => {
                    if (!d.isCurrentMonth) return <div key={i} className="aspect-square" />;
                    const statuses = getDayStatus(d.date);
                    const statusClass = getStatusColor(statuses);
                    const isToday = d.date === todayStr;
                    const isSelected = d.date === selectedDate;

                    return (
                        <button
                            key={i}
                            onClick={() => onSelectDate && onSelectDate(d.date)}
                            className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-all hover:scale-105 border ${isSelected
                                    ? 'ring-2 ring-primary bg-primary/10 text-primary'
                                    : isToday
                                        ? 'ring-2 ring-secondary/50 font-bold'
                                        : statusClass || 'border-transparent hover:bg-primary/5'
                                }`}
                        >
                            <span>{d.day}</span>
                            {statuses && statuses.length > 0 && (
                                <div className="flex gap-0.5 mt-0.5">
                                    {statuses.includes('bleeding') && <span className="w-1.5 h-1.5 rounded-full bg-bleeding" />}
                                    {statuses.includes('fertile') && <span className="w-1.5 h-1.5 rounded-full bg-fertile" />}
                                    {statuses.includes('ovulation') && <span className="w-1.5 h-1.5 rounded-full bg-ovulation" />}
                                    {statuses.includes('predicted') && <span className="w-1.5 h-1.5 rounded-full bg-predicted" />}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-primary/10">
                <div className="flex items-center gap-1.5 text-xs"><span className="w-3 h-3 rounded-full bg-bleeding" /> Bleeding</div>
                <div className="flex items-center gap-1.5 text-xs"><span className="w-3 h-3 rounded-full bg-fertile" /> Fertile</div>
                <div className="flex items-center gap-1.5 text-xs"><span className="w-3 h-3 rounded-full bg-ovulation" /> Ovulation</div>
                <div className="flex items-center gap-1.5 text-xs"><span className="w-3 h-3 rounded-full bg-predicted" /> Predicted</div>
            </div>
        </div>
    );
}
