import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../../store/themeConfigSlice';
import IconPlus from '../../../../components/Icon/IconPlus';
import IconX from '../../../../components/Icon/IconX';
import IconChevronDown from '../../../../components/Icon/IconCaretDown';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchSpecializations, SpecializationDto } from '../../../../api/admin/specializationApi';
import {
    createQuestionSet,
    fetchQuestionSetById,
    updateQuestionSet,
} from '../../../../api/admin/questionSetApi';

const createId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

interface BuilderOption {
    id: string;
    label: string;
    correct: boolean;
}

interface BuilderQuestion {
    id: string;
    text: string;
    options: BuilderOption[];
}

const defaultOption = (): BuilderOption => ({ id: createId(), label: '', correct: false });
const defaultQuestion = (): BuilderQuestion => ({ id: createId(), text: '', options: [defaultOption(), defaultOption()] });

const QuestionSetBuilder = () => {
    const { id } = useParams<{ id: string }>();
    const isEditMode = Boolean(id);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [questions, setQuestions] = useState<BuilderQuestion[]>([defaultQuestion()]);
    const [specializations, setSpecializations] = useState<SpecializationDto[]>([]);
    const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
    const [specializationOpen, setSpecializationOpen] = useState(false);

    const [loadingSpecializations, setLoadingSpecializations] = useState(false);
    const [loadingQuestionSet, setLoadingQuestionSet] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        dispatch(setPageTitle(isEditMode ? 'Edit Question Set' : 'Question Set Builder'));
    }, [dispatch, isEditMode]);

    useEffect(() => {
        const loadSpecializations = async () => {
            setLoadingSpecializations(true);
            try {
                const data = await fetchSpecializations('Active');
                setSpecializations(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error(err);
                setError('Failed to load specializations.');
            } finally {
                setLoadingSpecializations(false);
            }
        };
        loadSpecializations();
    }, []);

    useEffect(() => {
        if (!isEditMode || !id) return;
        const loadQuestionSet = async () => {
            setLoadingQuestionSet(true);
            try {
                const questionSet = await fetchQuestionSetById(id);
                if (!questionSet) {
                    setError('Question set not found.');
                    return;
                }
                setSelectedSpecializations(
                    Array.isArray(questionSet.specializationIds)
                        ? questionSet.specializationIds.map((spec) => spec._id)
                        : [],
                );
                const mappedQuestions: BuilderQuestion[] = Array.isArray(questionSet.questions)
                    ? questionSet.questions.map((q) => ({
                          id: createId(),
                          text: q.text ?? '',
                          options:
                              Array.isArray(q.options) && q.options.length
                                  ? q.options.map((option) => ({
                                        id: createId(),
                                        label: option.text ?? '',
                                        correct: Boolean(option.isCorrect),
                                    }))
                                  : [defaultOption(), defaultOption()],
                      }))
                    : [defaultQuestion()];
                setQuestions(mappedQuestions.length ? mappedQuestions : [defaultQuestion()]);
            } catch (err) {
                console.error(err);
                setError('Failed to load question set.');
            } finally {
                setLoadingQuestionSet(false);
            }
        };
        loadQuestionSet();
    }, [id, isEditMode]);

    const questionCount = useMemo(() => questions.length, [questions]);

    const toggleSpecialization = useCallback(
        (specId: string) => {
            setSelectedSpecializations((prev) =>
                prev.includes(specId) ? prev.filter((item) => item !== specId) : [...prev, specId],
            );
        },
        [],
    );

    const handleQuestionTextChange = useCallback((questionId: string, value: string) => {
        setQuestions((prev) =>
            prev.map((question) => (question.id === questionId ? { ...question, text: value } : question)),
        );
    }, []);

    const handleOptionLabelChange = useCallback((questionId: string, optionId: string, value: string) => {
        setQuestions((prev) =>
            prev.map((question) =>
                question.id === questionId
                    ? {
                          ...question,
                          options: question.options.map((option) =>
                              option.id === optionId ? { ...option, label: value } : option,
                          ),
                      }
                    : question,
            ),
        );
    }, []);

    const toggleCorrect = useCallback((questionId: string, optionId: string) => {
        setQuestions((prev) =>
            prev.map((question) =>
                question.id === questionId
                    ? {
                          ...question,
                          options: question.options.map((option) =>
                              option.id === optionId ? { ...option, correct: !option.correct } : option,
                          ),
                      }
                    : question,
            ),
        );
    }, []);

    const addQuestion = useCallback(() => {
        setQuestions((prev) => [...prev, defaultQuestion()]);
    }, []);

    const removeQuestion = useCallback((questionId: string) => {
        setQuestions((prev) => (prev.length > 1 ? prev.filter((question) => question.id !== questionId) : prev));
    }, []);

    const addOption = useCallback((questionId: string) => {
        setQuestions((prev) =>
            prev.map((question) =>
                question.id === questionId
                    ? { ...question, options: [...question.options, defaultOption()] }
                    : question,
            ),
        );
    }, []);

    const removeOption = useCallback((questionId: string, optionId: string) => {
        setQuestions((prev) =>
            prev.map((question) =>
                question.id === questionId && question.options.length > 2
                    ? {
                          ...question,
                          options: question.options.filter((option) => option.id !== optionId),
                      }
                    : question,
            ),
        );
    }, []);

    const validateQuestions = useCallback(() => {
        if (!questions.length) {
            return 'At least one question is required.';
        }
        for (const [index, question] of questions.entries()) {
            const trimmedText = question.text.trim();
            if (!trimmedText) {
                return `Question ${index + 1} cannot be empty.`;
            }
            const validOptions = question.options.filter((option) => option.label.trim());
            if (validOptions.length < 2) {
                return `Question ${index + 1} must have at least two options.`;
            }
            if (!validOptions.some((option) => option.correct)) {
                return `Question ${index + 1} must have at least one correct option.`;
            }
        }
        return null;
    }, [questions]);

    const handleSave = async () => {
        if (!selectedSpecializations.length) {
            setError('Please select at least one specialization.');
            return;
        }
        const questionValidationError = validateQuestions();
        if (questionValidationError) {
            setError(questionValidationError);
            return;
        }

        const payload = {
            specializationIds: selectedSpecializations,
            questions: questions.map((question) => ({
                text: question.text.trim(),
                options: question.options
                    .filter((option) => option.label.trim())
                    .map((option) => ({ text: option.label.trim(), isCorrect: option.correct })),
            })),
        };

        setSaving(true);
        setError(null);
        setSuccess(null);
        try {
            if (isEditMode && id) {
                await updateQuestionSet(id, payload);
                setSuccess('Question set updated successfully!');
            } else {
                await createQuestionSet(payload);
                setSuccess('Question set created successfully!');
            }
            setTimeout(() => navigate('/question-sets'), 700);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save question set. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const selectedLabels = useMemo(() => {
        const map = new Map(specializations.map((spec) => [spec._id, spec.name]));
        return selectedSpecializations.map((id) => map.get(id)).filter(Boolean) as string[];
    }, [selectedSpecializations, specializations]);

    if (loadingQuestionSet) {
        return (
            <div className="flex min-h-[240px] items-center justify-center text-sm text-slate-500 dark:text-slate-300">
                Loading question set...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header className="space-y-1">
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
                    {isEditMode ? 'Edit Question Set' : 'Question Set Builder'}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Craft custom assessments tailored to each specialization.
                </p>
            </header>

            <section className="panel space-y-6">
                {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
                {success && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">{success}</div>}

                <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Question Set Metadata</h2>
                    <div className="mt-4 space-y-4">
                        <div className="grid gap-4 md:grid-cols-1">
                        <div>
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Assign to Specializations</label>
                            <div className="relative mt-2">
                                <button
                                    type="button"
                                    onClick={() => setSpecializationOpen((open) => !open)}
                                    className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                >
                                        <span>
                                            {selectedLabels.length
                                                ? selectedLabels.join(', ')
                                                : loadingSpecializations
                                                ? 'Loading specializations...'
                                                : 'Select specializations'}
                                        </span>
                                    <IconChevronDown className={`h-4 w-4 transition ${specializationOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {specializationOpen && (
                                        <div className="absolute z-20 mt-2 max-h-56 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
                                            <ul className="text-sm">
                                                {specializations.map((spec) => (
                                                    <li key={spec._id}>
                                                    <label className="flex cursor-pointer items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                                                        <input
                                                            type="checkbox"
                                                            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                                                                checked={selectedSpecializations.includes(spec._id)}
                                                                onChange={() => toggleSpecialization(spec._id)}
                                                        />
                                                            <span>{spec.name}</span>
                                                    </label>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                                <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                                    Select one or more specializations for this question set.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-200 pt-6 dark:border-slate-700">
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Question Builder</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{questionCount} questions in this set</p>
                    </div>

                    <div className="space-y-5">
                        {questions.map((question, index) => (
                            <article
                                key={question.id}
                                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                            >
                                <div className="mb-4 flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                                            Question {index + 1}
                                        </h3>
                                        <label className="mt-3 block text-sm font-medium text-slate-600 dark:text-slate-300">
                                            Question Text
                                        </label>
                                        <textarea
                                            value={question.text}
                                            onChange={(event) => handleQuestionTextChange(question.id, event.target.value)}
                                            className="mt-2 block w-full min-h-[112px] resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeQuestion(question.id)}
                                        className="rounded-full bg-slate-100 p-2 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
                                    >
                                        <IconX className="h-4 w-4" />
                                    </button>
                                </div>

                                <div>
                                    <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300">Options</h4>
                                    <div className="mt-3 space-y-3">
                                        {question.options.map((option) => (
                                            <div key={option.id} className="flex items-center gap-3">
                                                <label className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={option.correct}
                                                        onChange={() => toggleCorrect(question.id, option.id)}
                                                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                                                    />
                                                    <span className="sr-only">Correct</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={option.label}
                                                    onChange={(event) => handleOptionLabelChange(question.id, option.id, event.target.value)}
                                                    className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeOption(question.id, option.id)}
                                                    className="rounded-full bg-slate-100 p-2 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
                                                >
                                                    <IconX className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => addOption(question.id)}
                                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                                    >
                                        <IconPlus className="h-4 w-4" />
                                        <span>Add Option</span>
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            type="button"
                            onClick={addQuestion}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
                        >
                            <IconPlus className="h-4 w-4" />
                            <span>Add Question</span>
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 dark:border-slate-700 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={() => navigate('/question-sets')}
                        className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/60"
                    >
                        {saving ? 'Saving...' : isEditMode ? 'Update Question Set' : 'Save Question Set'}
                    </button>
                </div>
            </section>
        </div>
    );
};

export default QuestionSetBuilder;

