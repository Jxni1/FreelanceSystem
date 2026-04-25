import { useNavigate } from 'react-router-dom';

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
      className="inline-flex items-center gap-2 mb-6 text-slate-300 hover:text-teal-300 font-medium transition-colors"
    >
      <span aria-hidden="true">&larr;</span>
      <span>{label}</span>
    </button>
  );
}
