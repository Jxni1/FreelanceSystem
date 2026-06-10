import { useEffect, useState } from 'react';
import { freelancerService } from '../../lib/freelancerService';
import { useAuth } from '../../context/AuthContext';


export default function RecommendedProjectsTestPage() {
  const { accessToken } = useAuth();
  const [freelancers, setFreelancers] = useState([]);
  const [freelancerId, setFreelancerId] = useState('');
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFreelancers, setIsLoadingFreelancers] = useState(false);
  const [error, setError] = useState('');

  const formatPercent = (value) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return 'N/A';
    }

    const num = Number(value);
    return `${num.toFixed(1)}%`;
  };

  const getMatchLabel = (score) => {
    const numericScore = Number(score ?? 0);

    if (numericScore >= 70) return 'Good match';
    if (numericScore >= 50) return 'Moderate match';
    return 'Low match';
  };

  const getMatchBadgeClasses = (score) => {
    const numericScore = Number(score ?? 0);

    if (numericScore >= 70) return 'bg-emerald-50 text-emerald-700';
    if (numericScore >= 50) return 'bg-blue-50 text-blue-700';
    return 'bg-amber-50 text-amber-700';
  };

  useEffect(() => {
    const loadFreelancers = async () => {
      try {
        setIsLoadingFreelancers(true);
        setError('');

        const result = await freelancerService.getAll({
          page: 1,
          pageSize: 100
        });

        const items =
          result?.items ||
          result?.data ||
          result?.results ||
          result?.value ||
          result ||
          [];

        const freelancerList = Array.isArray(items) ? items : [];

        setFreelancers(freelancerList);

        if (freelancerList.length > 0) {
          const firstId =
            freelancerList[0].freelancerID ||
            freelancerList[0].freelancerId ||
            freelancerList[0].id ||
            '';

          setFreelancerId(firstId);
        }
      } catch (err) {
        setError(err?.message || 'Failed to load freelancers.');
        setFreelancers([]);
      } finally {
        setIsLoadingFreelancers(false);
      }
    };

    loadFreelancers();
  }, []);

  const loadRecommendations = async () => {
    if (!freelancerId.trim()) {
      setError('Please select a freelancer.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setProjects([]);

      const token = accessToken;

      const url = `https://localhost:7244/api/ai-recommendations/${freelancerId}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });

      const contentType = response.headers.get('content-type') || '';
      const rawText = await response.text();

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status} ${response.statusText}${rawText ? ` - ${rawText}` : ''}`
        );
      }

      if (!contentType.includes('application/json')) {
        throw new Error(`Expected JSON but got: ${rawText.slice(0, 200)}`);
      }

      const data = rawText ? JSON.parse(rawText) : [];
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getFreelancerValue = (freelancer) =>
    freelancer.freelancerID || freelancer.freelancerId || freelancer.id || '';

  const getFreelancerLabel = (freelancer) =>
    freelancer.fullName ||
    freelancer.name ||
    freelancer.username ||
    freelancer.email ||
    freelancer.title ||
    'Unnamed freelancer';

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          AI Recommended Projects
        </h1>

        <p className="mt-2 text-sm text-slate-500">
         Select a freelancer and load recommended projects. Logistic Regression model predicts the match of projects based on the freelancer
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <select
            value={freelancerId}
            onChange={(e) => setFreelancerId(e.target.value)}
            disabled={isLoadingFreelancers}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-500 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            <option value="">
              {isLoadingFreelancers ? 'Loading freelancers...' : 'Select a freelancer'}
            </option>

            {freelancers.map((freelancer) => {
              const value = getFreelancerValue(freelancer);
              const label = getFreelancerLabel(freelancer);

              return (
                <option key={value} value={value}>
                  {label}
                </option>
              );
            })}
          </select>

          <button
            onClick={loadRecommendations}
            disabled={isLoading || isLoadingFreelancers || !freelancerId}
            className="rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Loading...' : 'Load Recommendations'}
          </button>
        </div>

        <p className="mt-3 text-xs text-slate-400">
          Backend: https://localhost:7244
        </p>

        {error && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm whitespace-pre-wrap text-rose-700">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-4">
          {projects.length === 0 && !isLoading && !error && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
              No recommendations loaded yet.
            </div>
          )}

          {projects.map((project) => (
            <div
              key={project.projectId}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
            >
              <h2 className="text-lg font-semibold text-slate-900">
                {project.title}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {project.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-white px-3 py-1 text-slate-600">
                  Budget: €{project.budget}
                </span>

                <span className="rounded-full bg-white px-3 py-1 text-slate-600">
                  Category: {project.categoryName}
                </span>

                <span className="rounded-full bg-teal-50 px-3 py-1 font-semibold text-teal-700">
                  Match: {formatPercent(project.matchScore)}
                </span>

                <span className="rounded-full bg-indigo-50 px-3 py-1 font-semibold text-indigo-700">
                  Similarity: {Number(project.cosineSimilarity ?? 0).toFixed(3)}
                </span>

                <span
                  className={`rounded-full px-3 py-1 font-semibold ${getMatchBadgeClasses(project.matchScore)}`}
                >
                  Prediction: {getMatchLabel(project.matchScore)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}