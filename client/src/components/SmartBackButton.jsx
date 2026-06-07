import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function SmartBackButton({ fallbackTo = '/dashboard', label = 'Back' }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(fallbackTo);
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-brand-700"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}
