const express = require('express');
const router = express.Router();
const { pool } = require('../db/database');
const { authenticate } = require('../middleware/auth');

// GET /api/insights/summary — PCOS insights & cycle analysis
router.get('/summary', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;

        // Get all cycles
        const cyclesResult = await pool.query(
            'SELECT * FROM cycles WHERE user_id = $1 ORDER BY start_date ASC',
            [userId]
        );
        const cycles = cyclesResult.rows;

        // Get latest metrics
        const metricsResult = await pool.query(
            'SELECT * FROM health_metrics WHERE user_id = $1 ORDER BY recorded_date DESC LIMIT 1',
            [userId]
        );
        const latestMetrics = metricsResult.rows[0] || null;

        // Get recent symptoms
        const logsResult = await pool.query(
            'SELECT * FROM daily_logs WHERE user_id = $1 ORDER BY log_date DESC LIMIT 90',
            [userId]
        );
        const recentLogs = logsResult.rows;

        // --- Cycle Analysis ---
        const cycleLengths = cycles.filter(c => c.cycle_length).map(c => c.cycle_length);
        const avgCycleLength = cycleLengths.length > 0
            ? Math.round(cycleLengths.reduce((s, l) => s + l, 0) / cycleLengths.length)
            : null;

        // Standard deviation
        let stdDev = null;
        if (cycleLengths.length >= 2) {
            const mean = cycleLengths.reduce((s, l) => s + l, 0) / cycleLengths.length;
            const variance = cycleLengths.reduce((s, l) => s + Math.pow(l - mean, 2), 0) / cycleLengths.length;
            stdDev = Math.round(Math.sqrt(variance) * 10) / 10;
        }

        // Consistency Score (0-100)
        let consistencyScore = null;
        if (stdDev !== null) {
            if (stdDev < 2) consistencyScore = 95 + Math.round((2 - stdDev) * 2.5);
            else if (stdDev < 4) consistencyScore = 80 + Math.round((4 - stdDev) * 7);
            else if (stdDev < 7) consistencyScore = 60 + Math.round((7 - stdDev) * 6.67);
            else consistencyScore = Math.max(10, 60 - Math.round((stdDev - 7) * 5));
            consistencyScore = Math.min(100, Math.max(0, consistencyScore));
        }

        // --- PCOS Warning Indicators ---
        const warnings = [];
        let riskScore = 0;

        // 1. Oligomenorrhea (cycle > 35 days)
        const longCycles = cycleLengths.filter(l => l > 35);
        if (longCycles.length > 0) {
            warnings.push({
                type: 'long_cycles',
                severity: 'warning',
                message: `${longCycles.length} cycle(s) longer than 35 days detected (oligomenorrhea pattern).`,
                detail: `Affected cycles: ${longCycles.join(', ')} days`
            });
            riskScore += 1;
        }

        // 2. Missed cycles (gap > 90 days)
        for (let i = 1; i < cycles.length; i++) {
            const gap = (new Date(cycles[i].start_date) - new Date(cycles[i - 1].start_date)) / (1000 * 60 * 60 * 24);
            if (gap > 90) {
                warnings.push({
                    type: 'missed_cycle',
                    severity: 'warning',
                    message: `Gap of ${Math.round(gap)} days detected between cycles (possible missed period).`
                });
                riskScore += 1;
                break;
            }
        }

        // 3. High waist-to-hip ratio
        if (latestMetrics && latestMetrics.waist_hip_ratio > 0.85) {
            warnings.push({
                type: 'high_whr',
                severity: 'info',
                message: `Waist-to-hip ratio is ${latestMetrics.waist_hip_ratio} (above 0.85 threshold).`,
                detail: 'Elevated WHR can be associated with metabolic risk factors.'
            });
            riskScore += 1;
        }

        // 4. BMI > 25 with irregular cycles
        if (latestMetrics && latestMetrics.bmi > 25 && stdDev && stdDev > 4) {
            warnings.push({
                type: 'bmi_irregular',
                severity: 'info',
                message: `BMI of ${latestMetrics.bmi} combined with irregular cycles.`,
                detail: 'Weight management may help regulate cycles.'
            });
            riskScore += 1;
        }

        // 5. High symptom scores (acne + hair growth)
        const highSymptomLogs = recentLogs.filter(l => (l.acne_level >= 3 || l.hair_growth_level >= 3));
        if (highSymptomLogs.length >= 3) {
            warnings.push({
                type: 'high_symptoms',
                severity: 'info',
                message: `${highSymptomLogs.length} days with elevated acne/hair growth symptoms in past 90 days.`,
                detail: 'Persistent symptoms may indicate hormonal imbalance.'
            });
            riskScore += 1;
        }

        riskScore = Math.min(5, riskScore);

        // Cycle length trend data (for charts)
        const cycleTrend = cycles.filter(c => c.cycle_length).map(c => ({
            start_date: c.start_date,
            cycle_length: c.cycle_length,
            bleeding_duration: c.bleeding_duration
        }));

        // Predicted next period
        const lastCycle = cycles[cycles.length - 1];
        const prediction = lastCycle ? {
            predicted_next: lastCycle.predicted_next,
            confidence: cycleLengths.length >= 3 ? 'high' : cycleLengths.length >= 1 ? 'medium' : 'low',
            avg_cycle_length: avgCycleLength
        } : null;

        // Fertile window estimate
        let fertileWindow = null;
        if (prediction && prediction.predicted_next && avgCycleLength) {
            const ovulationDay = avgCycleLength - 14;
            const ovDate = new Date(lastCycle.start_date);
            ovDate.setDate(ovDate.getDate() + ovulationDay);
            const fertileStart = new Date(ovDate);
            fertileStart.setDate(fertileStart.getDate() - 2);
            const fertileEnd = new Date(ovDate);
            fertileEnd.setDate(fertileEnd.getDate() + 2);
            fertileWindow = {
                ovulation_date: ovDate.toISOString().split('T')[0],
                start: fertileStart.toISOString().split('T')[0],
                end: fertileEnd.toISOString().split('T')[0]
            };
        }

        res.json({
            cycle_analysis: {
                total_cycles: cycles.length,
                avg_cycle_length: avgCycleLength,
                std_deviation: stdDev,
                consistency_score: consistencyScore,
                cycle_trend: cycleTrend,
                prediction,
                fertile_window: fertileWindow
            },
            pcos_indicators: {
                risk_score: riskScore,
                max_score: 5,
                warnings
            },
            latest_metrics: latestMetrics,
            disclaimer: 'This information is for educational purposes only and does not constitute medical advice. The PCOS indicators shown are based on self-reported data and simple pattern analysis. They are NOT a diagnosis. Please consult a qualified healthcare professional for proper evaluation and diagnosis.'
        });
    } catch (err) {
        console.error('Insights error:', err);
        res.status(500).json({ error: 'Failed to generate insights.' });
    }
});

module.exports = router;
