import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../../store/themeConfigSlice';
import { Link, useNavigate } from 'react-router-dom';
import {
    SpecializationDto,
    fetchSpecializations,
    deleteSpecialization as deleteSpecializationApi,
} from '../../../../api/admin/specializationApi';

const statusStyles: Record<string, string> = {
    Active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200',
    Inactive: 'bg-slate-200 text-slate-700 dark:bg-slate-500/10 dark:text-slate-200',
};

const summaryPlaceholders = [
    { label: 'Total Specializations', getValue: (items: SpecializationDto[]) => items.length.toString() },
    {
        label: 'Active Specializations',
        getValue: (items: SpecializationDto[]) => items.filter((item) => item.status === 'Active').length.toString(),
    },
    {
        label: 'Last Updated',
        getValue: (items: SpecializationDto[]) => {
            if (!items.length) return '—';
            const latest = [...items].sort(
                (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            )[0];
            return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(
                new Date(latest.updatedAt)
            );
        },
    },
];

const Specializations = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [specializations, setSpecializations] = useState<SpecializationDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const loadSpecializations = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchSpecializations();
            setSpecializations(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load specializations.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        dispatch(setPageTitle('Specializations'));
    }, [dispatch]);

    useEffect(() => {
        loadSpecializations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshKey]);

    const cards = useMemo(
        () =>
            summaryPlaceholders.map((card) => ({
                label: card.label,
                value: card.getValue(specializations),
            })),
        [specializations]
    );

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this specialization?')) return;
        setDeletingId(id);
        try {
            await deleteSpecializationApi(id);
            setRefreshKey((prev) => prev + 1);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete specialization.');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-8">
            <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-3">
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Specializations</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Manage specialization categories, certifications, and assessments across your platform.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => navigate('/specializations/create')}
                    className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
                >
                    Create Specialization
                </button>
            </header>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {cards.map((card) => (
                    <article
                        key={card.label}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                    >
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{card.label}</p>
                        <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{card.value}</p>
                    </article>
                ))}
            </section>

            <section className="panel space-y-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Specialization Catalog</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Overview of specialization clusters, associated certifications, and assessment availability.
                        </p>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="flex min-h-[200px] items-center justify-center text-sm text-slate-500 dark:text-slate-300">
                                Loading specializations...
                            </div>
                        ) : error ? (
                            <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 text-center text-sm text-red-500">
                                <p>{error}</p>
                                <button
                                    type="button"
                                    onClick={loadSpecializations}
                                    className="rounded-lg border border-red-300 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : specializations.length === 0 ? (
                            <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 text-center text-sm text-slate-500 dark:text-slate-300">
                                <p>No specializations found.</p>
                                <Link to="/specializations/create" className="font-semibold text-primary hover:underline">
                                    Create the first specialization
                                </Link>
                            </div>
                        ) : (
                            <table className="min-w-[760px] divide-y divide-slate-200 text-left text-sm dark:divide-slate-700">
                                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800/60 dark:text-slate-300">
                                    <tr>
                                        <th className="px-6 py-3">Specialization</th>
                                        <th className="px-6 py-3">Skills</th>
                                        <th className="px-6 py-3">Last Updated</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white text-sm dark:divide-slate-700 dark:bg-slate-900">
                                    {specializations.map((item) => (
                                        <tr key={item._id} className="text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/70">
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{item.name}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {Array.isArray(item.skills) && item.skills.length > 0 ? (
                                                        item.skills.map((skill) => (
                                                            <span
                                                                key={`${item._id}-${skill}`}
                                                                className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                                                            >
                                                                {skill}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-slate-400 dark:text-slate-500">No skills added</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-300">
                                                {new Intl.DateTimeFormat('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                }).format(new Date(item.updatedAt))}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                                        statusStyles[item.status] ??
                                                        'bg-slate-200 text-slate-700 dark:bg-slate-500/10 dark:text-slate-200'
                                                    }`}
                                                >
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => navigate(`/specializations/${item._id}/edit`)}
                                                        className="text-sm font-semibold text-primary transition hover:text-primary/80"
                                                    >
                                                        Edit
                                                    </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(item._id)}
                                                    disabled={deletingId === item._id}
                                                    className="text-sm font-semibold text-red-500 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-70"
                                                >
                                                    {deletingId === item._id ? 'Deleting...' : 'Delete'}
                                                </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                    <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4 text-sm dark:border-slate-700 dark:bg-slate-900/40">
                        <Link to="/specializations/create" className="font-semibold text-primary hover:underline">
                            Add New Specialization
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Specializations;

