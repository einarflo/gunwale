type ErrorNoticeProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  lead?: string;
  onRetry: () => void;
};

const ErrorNotice = ({
  title,
  description,
  actionLabel = "Prøv igjen",
  lead = "Uff da …",
  onRetry,
}: ErrorNoticeProps) => (
  <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
    <div className="text-sm font-semibold text-[#6a71fa] uppercase tracking-[0.14em] mb-2">
      {lead}
    </div>
    <div className="text-slate-900 font-semibold mb-1">{title}</div>
    {description && <div className="text-slate-600 mb-4">{description}</div>}
    <button
      onClick={onRetry}
      className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#6a71fa] to-[#9c8afa] px-4 py-2 text-white text-sm font-semibold shadow hover:shadow-lg active:scale-95 transition"
    >
      {actionLabel}
    </button>
  </div>
);

export default ErrorNotice;
