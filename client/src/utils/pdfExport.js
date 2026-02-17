import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatDate } from './dateHelpers';
import { getBMICategory, getConsistencyLabel } from './calculations';

export function generateHealthReport(userData, cycles, metrics, insights) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(233, 30, 140);
    doc.text('mCycle Health Report', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${formatDate(new Date())}`, pageWidth / 2, 28, { align: 'center' });
    doc.text(`Patient: ${userData?.name || 'N/A'}`, pageWidth / 2, 34, { align: 'center' });

    // Disclaimer
    doc.setFontSize(8);
    doc.setTextColor(200, 50, 50);
    doc.text(
        'DISCLAIMER: This report is for informational purposes only and does not constitute medical advice.',
        pageWidth / 2, 42, { align: 'center', maxWidth: pageWidth - 40 }
    );

    let y = 55;

    // Cycle Summary
    if (insights?.cycle_analysis) {
        doc.setFontSize(14);
        doc.setTextColor(30, 30, 30);
        doc.text('Cycle Summary', 14, y);
        y += 8;

        const ca = insights.cycle_analysis;
        doc.autoTable({
            startY: y,
            head: [['Metric', 'Value']],
            body: [
                ['Total Cycles Recorded', String(ca.total_cycles || 0)],
                ['Average Cycle Length', ca.avg_cycle_length ? `${ca.avg_cycle_length} days` : 'N/A'],
                ['Std Deviation', ca.std_deviation != null ? `${ca.std_deviation} days` : 'N/A'],
                ['Consistency Score', ca.consistency_score != null ? `${ca.consistency_score}/100 (${getConsistencyLabel(ca.consistency_score)})` : 'N/A'],
                ['Predicted Next Period', ca.prediction?.predicted_next ? formatDate(ca.prediction.predicted_next) : 'N/A'],
                ['Prediction Confidence', ca.prediction?.confidence || 'N/A'],
            ],
            theme: 'grid',
            headStyles: { fillColor: [233, 30, 140] },
            margin: { left: 14. },
        });
        y = doc.lastAutoTable.finalY + 12;
    }

    // Latest Health Metrics
    if (insights?.latest_metrics) {
        const m = insights.latest_metrics;
        doc.setFontSize(14);
        doc.text('Latest Health Metrics', 14, y);
        y += 8;

        doc.autoTable({
            startY: y,
            head: [['Metric', 'Value']],
            body: [
                ['Date', formatDate(m.recorded_date)],
                ['Weight', m.weight_kg ? `${m.weight_kg} kg` : 'N/A'],
                ['Height', m.height_cm ? `${m.height_cm} cm` : 'N/A'],
                ['BMI', m.bmi ? `${m.bmi} (${getBMICategory(m.bmi)})` : 'N/A'],
                ['Waist', m.waist_cm ? `${m.waist_cm} cm` : 'N/A'],
                ['Hip', m.hip_cm ? `${m.hip_cm} cm` : 'N/A'],
                ['Waist-Hip Ratio', m.waist_hip_ratio ? String(m.waist_hip_ratio) : 'N/A'],
            ],
            theme: 'grid',
            headStyles: { fillColor: [139, 92, 246] },
            margin: { left: 14 },
        });
        y = doc.lastAutoTable.finalY + 12;
    }

    // PCOS Indicators
    if (insights?.pcos_indicators) {
        const pi = insights.pcos_indicators;
        doc.setFontSize(14);
        doc.text('PCOS Indicators', 14, y);
        y += 8;

        doc.setFontSize(10);
        doc.text(`Educational Risk Score: ${pi.risk_score}/${pi.max_score}`, 14, y);
        y += 8;

        if (pi.warnings?.length > 0) {
            doc.autoTable({
                startY: y,
                head: [['Type', 'Severity', 'Description']],
                body: pi.warnings.map(w => [w.type, w.severity, w.message]),
                theme: 'grid',
                headStyles: { fillColor: [245, 158, 11] },
                margin: { left: 14 },
                columnStyles: { 2: { cellWidth: 90 } },
            });
            y = doc.lastAutoTable.finalY + 12;
        }
    }

    // Recent Cycles
    if (cycles?.length > 0) {
        const recentCycles = cycles.slice(0, 12);
        doc.setFontSize(14);
        if (y > 240) { doc.addPage(); y = 20; }
        doc.text('Recent Cycles', 14, y);
        y += 8;

        doc.autoTable({
            startY: y,
            head: [['Start Date', 'End Date', 'Cycle Length', 'Bleeding Duration']],
            body: recentCycles.map(c => [
                formatDate(c.start_date),
                c.end_date ? formatDate(c.end_date) : 'Ongoing',
                c.cycle_length ? `${c.cycle_length} days` : '-',
                c.bleeding_duration ? `${c.bleeding_duration} days` : '-',
            ]),
            theme: 'grid',
            headStyles: { fillColor: [233, 30, 140] },
            margin: { left: 14 },
        });
    }

    doc.save('mCycle_Health_Report.pdf');
}
