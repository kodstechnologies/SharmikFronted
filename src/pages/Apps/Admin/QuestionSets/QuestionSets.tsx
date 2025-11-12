import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setPageTitle } from '../../../../store/themeConfigSlice';
import {
    QuestionSetDto,
    deleteQuestionSet,
    fetchQuestionSets,
} from '../../../../api/admin/questionSetApi';

const QuestionSets = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [questionSets, setQuestionSets] = useState<QuestionSetDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(setPageTitle('Question Sets'));
    }, [dispatch]);

    const loadQuestionSets = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchQuestionSets();
            setQuestionSets(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load question sets.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadQuestionSets();
    }, []);

    const summaryCards = useMemo(() => {
        const totalSets = questionSets.length;
        const totalQuestions = questionSets.reduce(
            (sum, set) => sum + (set.totalQuestions ?? set.questions.length ?? 0),
            0,
        );
        const uniqueSpecializations = new Set(
            questionSets.flatMap((set) =>
                Array.isArray(set.specializationIds)
                    ? set.specializationIds.map((spec) => spec.name)
                    : [],
            ),
        ).size;
        const latestUpdate = questionSets
            .map((set) => new Date(set.updatedAt))
            .sort((a, b) => b.getTime() - a.getTime())[0];

        return [
            { label: 'Total Question Sets', value: totalSets.toString() },
            { label: 'Total Questions', value: totalQuestions.toString() },
            { label: 'Specializations Covered', value: uniqueSpecializations.toString() },
            {
                label: 'Last Updated',
                value: latestUpdate
                    ? new Intl.DateTimeFormat('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                      }).format(latestUpdate)
                    : '—',
            },
        ];
    }, [questionSets]);

    const filteredQuestionSets = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return questionSets;
        return questionSets.filter((set) => set.name.toLowerCase().includes(term));
    }, [questionSets, searchTerm]);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this question set?')) return;
        setDeletingId(id);
        try {
            await deleteQuestionSet(id);
            await loadQuestionSets();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete question set.');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-8">
            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Question Sets</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Manage and organize question sets used across assessments.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => navigate('/question-sets/new')}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
                >
                    Create Question Set
                </button>
            </header>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {summaryCards.map((card) => (
                    <article
                        key={card.label}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                    >
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                            {card.label}
                        </p>
                        <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{card.value}</p>
                    </article>
                ))}
            </section>

            <section className="panel space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex w-full flex-col gap-3 sm:flex-row">
                        <label className="flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500 shadow-sm focus-within:ring-2 focus-within:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Search by name..."
                                className="w-full bg-transparent text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none dark:text-slate-200"
                            />
                        </label>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="flex min-h-[200px] items-center justify-center text-sm text-slate-500 dark:text-slate-300">
                                Loading question sets...
                            </div>
                        ) : error ? (
                            <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 text-center text-sm text-red-500">
                                <p>{error}</p>
                                <button
                                    type="button"
                                    onClick={loadQuestionSets}
                                    className="rounded-lg border border-red-300 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : filteredQuestionSets.length === 0 ? (
                            <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 text-center text-sm text-slate-500 dark:text-slate-300">
                                <p>No question sets found.</p>
                                <button
                                    type="button"
                                    onClick={() => navigate('/question-sets/new')}
                                    className="font-semibold text-primary hover:underline"
                                >
                                    Create the first question set
                                </button>
                            </div>
                        ) : (
                            <table className="min-w-[960px] divide-y divide-slate-200 text-left text-sm dark:divide-slate-700">
                                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800/60 dark:text-slate-300">
                                    <tr>
                                        <th className="px-6 py-3">Specializations</th>
                                        <th className="px-6 py-3">Skills</th>
                                        <th className="px-6 py-3">Questions</th>
                                        <th className="px-6 py-3">Last Updated</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white text-sm dark:divide-slate-700 dark:bg-slate-900">
                                    {filteredQuestionSets.map((set) => {
                                        const specializationChips = Array.isArray(set.specializationIds)
                                            ? set.specializationIds
                                            : [];
                                        const skillChips = specializationChips
                                            .flatMap((spec) => (Array.isArray(spec.skills) ? spec.skills : []))
                                            .filter(Boolean);
                                        const uniqueSkills = [...new Set(skillChips)];
                                        return (
                                            <tr
                                                key={set._id}
                                                className="text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/70"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-2">
                                                        {specializationChips.map((spec) => (
                                                            <span
                                                                key={`${set._id}-${spec._id}`}
                                                                className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                                                            >
                                                                {spec.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-2">
                                                        {uniqueSkills.length ? (
                                                            uniqueSkills.map((skill) => (
                                                                <span
                                                                    key={`${set._id}-skill-${skill}`}
                                                                    className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-200"
                                                                >
                                                                    {skill}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-xs text-slate-400 dark:text-slate-500">No skills mapped</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 dark:text-slate-300">
                                                    {set.totalQuestions ?? set.questions.length ?? 0}
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 dark:text-slate-300">
                                                    {new Intl.DateTimeFormat('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    }).format(new Date(set.updatedAt))}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => navigate(`/question-sets/${set._id}/edit`)}
                                                            className="text-sm font-semibold text-primary transition hover:text-primary/80"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(set._id)}
                                                            disabled={deletingId === set._id}
                                                            className="text-sm font-semibold text-red-500 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-70"
                                                        >
                                                            {deletingId === set._id ? 'Deleting...' : 'Delete'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default QuestionSets;