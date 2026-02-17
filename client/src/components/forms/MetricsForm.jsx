import { useState } from 'react';
import { calculateBMI, calculateWHR, getBMICategory } from '../../utils/calculations';

export default function MetricsForm({ onSubmit }) {
    const [form, setForm] = useState({
        recorded_date: new Date().toISOString().split('T')[0],
        weight_kg: '', height_cm: '', waist_cm: '', hip_cm: '', wrist_cm: ''
    });

    const bmi = calculateBMI(Number(form.weight_kg), Number(form.height_cm));
    const whr = calculateWHR(Number(form.waist_cm), Number(form.hip_cm));

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...form,
            weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
            height_cm: form.height_cm ? Number(form.height_cm) : null,
            waist_cm: form.waist_cm ? Number(form.waist_cm) : null,
            hip_cm: form.hip_cm ? Number(form.hip_cm) : null,
            wrist_cm: form.wrist_cm ? Number(form.wrist_cm) : null,
        });
        setForm({ recorded_date: new Date().toISOString().split('T')[0], weight_kg: '', height_cm: '', waist_cm: '', hip_cm: '', wrist_cm: '' });
    };

    const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }));

    return (
        <form onSubmit={handleSubmit} className="glass-card p-6 fade-in">
            <h3 className="text-lg font-bold gradient-text mb-4">📏 Log Health Metrics</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-muted mb-1">Date</label>
                    <input type="date" value={form.recorded_date} onChange={e => handleChange('recorded_date', e.target.value)} className="input-field" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-muted mb-1">Weight (kg)</label>
                    <input type="number" step="0.1" value={form.weight_kg} onChange={e => handleChange('weight_kg', e.target.value)} className="input-field" placeholder="e.g. 65.5" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-muted mb-1">Height (cm)</label>
                    <input type="number" step="0.1" value={form.height_cm} onChange={e => handleChange('height_cm', e.target.value)} className="input-field" placeholder="e.g. 165" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-muted mb-1">Waist (cm)</label>
                    <input type="number" step="0.1" value={form.waist_cm} onChange={e => handleChange('waist_cm', e.target.value)} className="input-field" placeholder="e.g. 72" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-muted mb-1">Hip (cm)</label>
                    <input type="number" step="0.1" value={form.hip_cm} onChange={e => handleChange('hip_cm', e.target.value)} className="input-field" placeholder="e.g. 98" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-muted mb-1">Wrist (cm)</label>
                    <input type="number" step="0.1" value={form.wrist_cm} onChange={e => handleChange('wrist_cm', e.target.value)} className="input-field" placeholder="e.g. 16" />
                </div>
            </div>

            {/* Auto-calculated values */}
            {(bmi || whr) && (
                <div className="mt-4 flex flex-wrap gap-4">
                    {bmi && (
                        <div className="glass-card px-4 py-2 flex items-center gap-2">
                            <span className="text-sm font-medium">BMI:</span>
                            <span className="text-lg font-bold gradient-text">{bmi}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${bmi < 18.5 ? 'bg-blue-100 text-blue-700' :
                                    bmi < 25 ? 'bg-green-100 text-green-700' :
                                        bmi < 30 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                }`}>{getBMICategory(bmi)}</span>
                        </div>
                    )}
                    {whr && (
                        <div className="glass-card px-4 py-2 flex items-center gap-2">
                            <span className="text-sm font-medium">WHR:</span>
                            <span className="text-lg font-bold gradient-text">{whr}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${whr > 0.85 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                {whr > 0.85 ? 'Elevated' : 'Normal'}
                            </span>
                        </div>
                    )}
                </div>
            )}

            <button type="submit" className="btn-primary mt-4">Save Metrics</button>
        </form>
    );
}
