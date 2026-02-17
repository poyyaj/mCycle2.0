export function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateShort(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function toISODate(date) {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
}

export function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
}

export function generateMonthDays(year, month) {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    // Previous month filling
    for (let i = 0; i < firstDay; i++) {
        days.push({ day: null, date: null, isCurrentMonth: false });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        days.push({ day: d, date: dateStr, isCurrentMonth: true });
    }

    return days;
}

export function daysBetween(date1, date2) {
    return Math.round((new Date(date2) - new Date(date1)) / (1000 * 60 * 60 * 24));
}

export function isDateInRange(date, start, end) {
    const d = new Date(date);
    return d >= new Date(start) && d <= new Date(end);
}

export function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
}
