import { useState } from 'react';

const MOODS = [
    { value: 'happy', emoji: '😊', label: 'Happy' },
    { value: 'calm', emoji: '😌', label: 'Calm' },
    { value: 'anxious', emoji: '😰', label: 'Anxious' },
    { value: 'sad', emoji: '😢', label: 'Sad' },
    { value: 'irritable', emoji: '😤', label: 'Irritable' },
];

const EXERCISE_TYPES = ['Walking', 'Running', 'Yoga', 'Gym', 'Swimming', 'Cycling', 'Dance', 'Other'];

export default function DailyLogForm({ onSubmit, selectedDate }) {
    const [form, setForm] = useState({
        log_date: selectedDate || new Date().toISOString().split('T')[0],
        mood: '', pain_level: 0, acne_level: 0, hair_growth_level: 0,
        exercise_minutes: '', exercise_type: '', medication: '', notes: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...form,
            pain_level: Number(form.pain_level),
            acne_level: Number(form.acne_level),
            hair_growth_level: Number(form.hair_growth_level),
            exercise_minutes: form.exercise_minutes ? Number(form.exercise_minutes) : null,
        });
        setForm(f => ({ ...f, mood: '', pain_level: 0, acne_level: 0, hair_growth_level: 0, exercise_minutes: '', exercise_type: '', medication: '', notes: '' }));
    };

    const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }));

    return (
        <form onSubmit={handleSubmit} className="glass-card p-6 fade-in">
            <h3 className="text-lg font-bold gradient-text mb-4">📝 Daily Log</h3>

            <div className="mb-4">
                <label className="block text-sm font-medium text-muted mb-1">Date</label>
                <input type="date" value={form.log_date} onChange={e => handleChange('log_date', e.target.value)} className="input-field max-w-xs" required />
            </div>

            {/* Mood Selector */}
            <div className="mb-5">
                <label className="block text-sm font-medium text-muted mb-2">Mood</label>
                <div className="flex flex-wrap gap-2">
                    {MOODS.map(m => (
                        <button
                            key={m.value} type="button"
                            onClick={() => handleChange('mood', m.value)}
                            className={`px-3 py-2 rounded-xl border-2 transition-all flex items-center gap-1.5 text-sm ${form.mood === m.value
                                    ? 'border-primary bg-primary/10 scale-105'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                                }`}
                        >
                            <span className="text-lg">{m.emoji}</span> {m.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                <div>
                    <label className="flex justify-between text-sm font-medium text-muted mb-1">
                        <span>Pain Level</span> <span className="text-primary font-bold">{form.pain_level}/10</span>
                    </label>
                    <input type="range" min="0" max="10" value={form.pain_level} onChange={e => handleChange('pain_level', e.target.value)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary" />
                </div>
                <div>
                    <label className="flex justify-between text-sm font-medium text-muted mb-1">
                        <span>Acne Level</span> <span className="text-primary font-bold">{form.acne_level}/5</span>
                    </label>
                    <input type="range" min="0" max="5" value={form.acne_level} onChange={e => handleChange('acne_level', e.target.value)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary" />
                </div>
                <div>
                    <label className="flex justify-between text-sm font-medium text-muted mb-1">
                        <span>Hair Growth</span> <span className="text-primary font-bold">{form.hair_growth_level}/5</span>
                    </label>
                    <input type="range" min="0" max="5" value={form.hair_growth_level} onChange={e => handleChange('hair_growth_level', e.target.value)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary" />
                </div>
            </div>

            {/* Exercise */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-muted mb-1">Exercise Type</label>
                    <select value={form.exercise_type} onChange={e => handleChange('exercise_type', e.target.value)} className="input-field">
                        <option value="">Select...</option>
                        {EXERCISE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-muted mb-1">Exercise Duration (min)</label>
                    <input type="number" value={form.exercise_minutes} onChange={e => handleChange('exercise_minutes', e.target.value)} className="input-field" placeholder="e.g. 30" />
                </div>
            </div>

            {/* Medication */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-muted mb-1">Medication</label>
                <input type="text" value={form.medication} onChange={e => handleChange('medication', e.target.value)} className="input-field" placeholder="Any medication today?" />
            </div>

            {/* Notes */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-muted mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => handleChange('notes', e.target.value)} className="input-field" rows="2" placeholder="How are you feeling today?" />
            </div>

            <button type="submit" className="btn-primary">Save Log</button>
        </form>
    );
}
