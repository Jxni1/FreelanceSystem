export const GUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isValidGuid = (v) => GUID_RE.test(v?.trim() ?? '');

export const STATUS_OPTIONS = ['open', 'in_progress', 'completed', 'cancelled'];
export const STATUS_LABELS = {
  open: 'Open',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const VISIBILITY_OPTIONS = ['public', 'private'];
export const VISIBILITY_LABELS = { public: 'Public', private: 'Private' };

export const STATUS_BADGE = {
  open:        'bg-teal-100 text-teal-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed:   'bg-green-100 text-green-700',
  cancelled:   'bg-red-100 text-red-600',
};

export const EMPTY_CREATE = {
  title: '',
  description: '',
  budget: '',
  clientID: '',
  categoryID: '',
  visibility: 'public',
  status: 'open',
};

export const EMPTY_UPDATE = {
  title: '',
  description: '',
  budget: '',
  categoryID: '',
  visibility: 'public',
  status: 'open',
};