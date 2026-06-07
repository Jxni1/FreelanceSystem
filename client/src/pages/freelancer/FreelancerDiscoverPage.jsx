import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Search, Briefcase } from 'lucide-react';
import { useProjects } from '../../hooks/useProjects';
import { useCategories } from '../../hooks/useCategories';
import { useSkills } from '../../hooks/useSkills';
import { PageHeading } from '../../components/ui/PageHeading';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';

function timeAgo(value) {
  if (!value) return 'recently';
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  return new Date(value).toLocaleDateString();
}

function formatMoney(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? `$${n.toLocaleString()}` : null;
}

function FilterGroup({ title, children }) {
  return (
    <div className="space-y-2.5 border-t border-line py-4 first:border-t-0 first:pt-0">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      {children}
    </div>
  );
}

function JobCard({ job }) {
  return (
    <Card>
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <Badge tone="emerald">Open</Badge>
            <span>· {job.postedAgo}</span>
          </div>

          <Link to={`/projects/${job.id}`} className="block text-base font-semibold text-slate-900 hover:text-brand-700">
            {job.title}
          </Link>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
            {job.client ? <span className="font-medium text-slate-700">{job.client}</span> : null}
            {job.category ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                {job.category}
              </span>
            ) : null}
          </div>

          <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">{job.description}</p>

          {job.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {job.tags.map((tag) => (
                <Badge key={tag} tone="slate">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:w-44 sm:items-end sm:text-right">
          {job.price ? (
            <div>
              <p className="text-lg font-bold text-slate-900">{job.price}</p>
              <p className="text-xs text-slate-500">Fixed price</p>
            </div>
          ) : null}
          <div className="mt-1">
            <Button to={`/projects/${job.id}`} size="sm">
              View &amp; apply
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function FreelancerDiscoverPage() {
  const { projects, isLoading, fetchProjects } = useProjects();
  const { categories, fetchCategories } = useCategories();
  const { skills, fetchSkills } = useSkills();

  const [categoryId, setCategoryId] = useState('');
  const [search, setSearch] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);

  useEffect(() => {
    fetchCategories({ pageSize: 100 });
    fetchSkills({ pageSize: 100 });
  }, [fetchCategories, fetchSkills]);

  useEffect(() => {
    fetchProjects({
      page: 1,
      pageSize: 24,
      status: 'Open',
      categoryId: categoryId || undefined,
      search: activeSearch || undefined,
      skillNames: selectedSkills.length ? selectedSkills : undefined,
    });
  }, [fetchProjects, categoryId, activeSearch, selectedSkills]);

  const toggleSkill = (name) =>
    setSelectedSkills((prev) => (prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]));

  const categoryNameById = useMemo(() => {
    const map = {};
    (categories.items ?? []).forEach((c) => {
      map[c.categoryID] = c.name;
    });
    return map;
  }, [categories]);

  const jobs = useMemo(
    () =>
      (projects.items ?? []).map((project) => ({
        id: project.projectID,
        postedAgo: timeAgo(project.createdAt),
        client: project.clientName || '',
        category: project.categoryName || categoryNameById[project.categoryID] || '',
        price: formatMoney(project.budget),
        title: project.title || 'Untitled project',
        description: project.description || 'No description provided.',
        tags: (project.skills ?? []).slice(0, 4),
      })),
    [projects, categoryNameById],
  );

  const skillItems = (skills.items ?? []).map((s) => s.name).filter(Boolean);
  const hasFilters = Boolean(categoryId) || selectedSkills.length > 0 || Boolean(activeSearch);

  const handleSearch = (event) => {
    event.preventDefault();
    setActiveSearch(search.trim());
  };

  const clearFilters = () => {
    setCategoryId('');
    setSelectedSkills([]);
    setSearch('');
    setActiveSearch('');
  };

  return (
    <div className="space-y-6">
      <PageHeading
        title="Find work"
        subtitle={`${(projects.totalCount || 0).toLocaleString()} open ${projects.totalCount === 1 ? 'project' : 'projects'}`}
      />

      <form onSubmit={handleSearch} className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search projects by title or keyword..."
          className="h-11 w-full rounded-xl border border-line bg-white pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </form>

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="order-last lg:order-first lg:w-64 lg:shrink-0">
          <Card bodyClassName="p-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">Filters</p>
              {hasFilters ? (
                <button type="button" onClick={clearFilters} className="text-xs font-medium text-brand-700 hover:text-brand-800">
                  Clear
                </button>
              ) : null}
            </div>

            <FilterGroup title="Category">
              {(categories.items ?? []).length === 0 ? (
                <p className="text-xs text-slate-400">No categories yet.</p>
              ) : (
                <div className="space-y-2">
                  {categories.items.map((cat) => (
                    <Checkbox
                      key={cat.categoryID}
                      label={cat.name}
                      checked={categoryId === cat.categoryID}
                      onChange={() => setCategoryId((prev) => (prev === cat.categoryID ? '' : cat.categoryID))}
                    />
                  ))}
                </div>
              )}
            </FilterGroup>

            <FilterGroup title="Skills">
              {skillItems.length === 0 ? (
                <p className="text-xs text-slate-400">No skills yet.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {skillItems.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                        selectedSkills.includes(skill)
                          ? 'border-brand-200 bg-brand-50 text-brand-700'
                          : 'border-line bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              )}
            </FilterGroup>
          </Card>
        </aside>

        <div className="min-w-0 flex-1 space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-brand-100 border-t-brand-700" />
            </div>
          ) : jobs.length === 0 ? (
            <Card bodyClassName="p-10">
              <div className="flex flex-col items-center gap-2 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                  <Briefcase className="h-6 w-6" aria-hidden="true" />
                </span>
                <p className="font-semibold text-slate-900">No open projects found</p>
                <p className="text-sm text-slate-500">
                  {hasFilters ? 'Try clearing filters to see more work.' : 'New projects will show up here as clients post them.'}
                </p>
              </div>
            </Card>
          ) : (
            jobs.map((job) => <JobCard key={job.id} job={job} />)
          )}
        </div>
      </div>
    </div>
  );
}
