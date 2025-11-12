import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setPageTitle } from '../../../../store/themeConfigSlice';
import { createSpecialization } from '../../../../api/admin/specializationApi';

const CreateSpecialization = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
    const [skills, setSkills] = useState<string[]>([]);
    const [skillInput, setSkillInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        dispatch(setPageTitle('Create Specialization'));
    }, [dispatch]);

    const addSkill = (value: string) => {
        const trimmed = value.trim();
        if (!trimmed) return;
        setSkills((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
        setSkillInput('');
    };

    const handleSkillKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault();
            addSkill(skillInput);
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            await createSpecialization({
                name,
                status,
                skills,
            });
            setSuccess('Specialization created successfully!');
            setTimeout(() => navigate('/specializations'), 600);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create specialization. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <header className="space-y-3">
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Create Specialization</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Define a new specialization to organize related certifications and assessments.</p>
            </header>

            <section className="panel space-y-6">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
                    {success && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">{success}</div>}

                    <div className="grid gap-6 lg:grid-cols-1">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Specialization Name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                placeholder="E.g., Cloud Architecture"
                                className="form-input"
                            />
                        </div>
                    </div>

                        <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Skills</label>
                        <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                            {skills.map((skill) => (
                                <span
                                    key={skill}
                                    className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                                >
                                    {skill}
                                    <button
                                        type="button"
                                        onClick={() => setSkills((prev) => prev.filter((item) => item !== skill))}
                                        className="text-primary/70 hover:text-primary"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                            <input
                                type="text"
                                value={skillInput}
                                onChange={(event) => setSkillInput(event.target.value)}
                                onKeyDown={handleSkillKeyDown}
                                onBlur={() => addSkill(skillInput)}
                                placeholder="Type a skill and press Enter or comma"
                                className="flex-1 min-w-[160px] border-0 bg-transparent text-sm text-slate-700 focus:outline-none dark:text-slate-200"
                            />
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500">Separate skills by pressing Enter or comma. Click × to remove.</p>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
                            <select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="form-select">
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
                        <button type="button" onClick={() => navigate('/specializations')} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/60"
                        >
                            {loading ? 'Saving...' : 'Save Specialization'}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
};

export default CreateSpecialization;
