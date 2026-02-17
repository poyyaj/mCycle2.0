export function calculateBMI(weightKg, heightCm) {
    if (!weightKg || !heightCm) return null;
    const heightM = heightCm / 100;
    return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export function calculateWHR(waistCm, hipCm) {
    if (!waistCm || !hipCm) return null;
    return Math.round((waistCm / hipCm) * 100) / 100;
}

export function calculateConsistencyScore(cycleLengths) {
    if (!cycleLengths || cycleLengths.length < 2) return null;
    const mean = cycleLengths.reduce((s, l) => s + l, 0) / cycleLengths.length;
    const variance = cycleLengths.reduce((s, l) => s + Math.pow(l - mean, 2), 0) / cycleLengths.length;
    const stdDev = Math.sqrt(variance);

    let score;
    if (stdDev < 2) score = 95 + Math.round((2 - stdDev) * 2.5);
    else if (stdDev < 4) score = 80 + Math.round((4 - stdDev) * 7);
    else if (stdDev < 7) score = 60 + Math.round((7 - stdDev) * 6.67);
    else score = Math.max(10, 60 - Math.round((stdDev - 7) * 5));

    return Math.min(100, Math.max(0, score));
}

export function predictNextPeriod(cycles) {
    if (!cycles || cycles.length === 0) return null;
    const sorted = [...cycles].sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
    const latest = sorted[0];

    const lengths = sorted.filter(c => c.cycle_length).map(c => c.cycle_length).slice(0, 6);
    const avgLength = lengths.length > 0
        ? Math.round(lengths.reduce((s, l) => s + l, 0) / lengths.length)
        : 28;

    const nextDate = new Date(latest.start_date);
    nextDate.setDate(nextDate.getDate() + avgLength);
    return nextDate.toISOString().split('T')[0];
}

export function calculateFertileWindow(startDate, cycleLength) {
    if (!startDate || !cycleLength) return null;
    const ovDay = cycleLength - 14;
    const ovDate = new Date(startDate);
    ovDate.setDate(ovDate.getDate() + ovDay);

    const fertileStart = new Date(ovDate);
    fertileStart.setDate(fertileStart.getDate() - 2);
    const fertileEnd = new Date(ovDate);
    fertileEnd.setDate(fertileEnd.getDate() + 2);

    return {
        ovulation: ovDate.toISOString().split('T')[0],
        start: fertileStart.toISOString().split('T')[0],
        end: fertileEnd.toISOString().split('T')[0]
    };
}

export function getBMICategory(bmi) {
    if (!bmi) return '';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
}

export function getConsistencyLabel(score) {
    if (score === null) return 'Not enough data';
    if (score >= 90) return 'Very Regular';
    if (score >= 75) return 'Regular';
    if (score >= 60) return 'Slightly Irregular';
    return 'Irregular';
}
