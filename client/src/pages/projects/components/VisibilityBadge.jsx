import { VISIBILITY_LABELS } from '../../../constants/projectConstants';

export default function VisibilityBadge({ visibility }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${visibility === 'public' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
      {VISIBILITY_LABELS[visibility] ?? visibility}
    </span>
  );
}