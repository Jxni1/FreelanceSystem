import { useState } from 'react';

export default function RecommendedProjectsTestPage() {
  const [freelancerId, setFreelancerId] = useState('');
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadRecommendations = async () => {
    if (!freelancerId.trim()) {
      setError('Please enter a freelancer ID.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setProjects([]);

      const url = `https://localhost:7244/api/ai-recommendations/${freelancerId}`;

      const response = await fetch(url, {
        method: 'GET',
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          AI Recommended Projects
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Test your Python + .NET recommendation flow from the React app.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={freelancerId}
            onChange={(e) => setFreelancerId(e.target.value)}
            placeholder="Enter freelancer ID"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-teal-500"
          />

          <button
            onClick={loadRecommendations}
            disabled={isLoading}
            className="rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Loading...' : 'Test AI Recommendations'}
          </button>
        </div>

        <p className="mt-3 text-xs text-slate-400">
          Backend: https://localhost:7244
        </p>

        {error && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 whitespace-pre-wrap">
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
                  Match: {project.matchScore}%
                </span>

                <span className="rounded-full bg-indigo-50 px-3 py-1 font-semibold text-indigo-700">
                  Similarity: {project.cosineSimilarity}
                </span>

                <span
                  className={`rounded-full px-3 py-1 font-semibold ${
                    project.prediction === 1
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  Prediction: {project.prediction === 1 ? 'Good match' : 'Low match'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}