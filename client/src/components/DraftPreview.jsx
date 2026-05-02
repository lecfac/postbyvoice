export default function DraftPreview({ draft }) {
  const platforms = [
    { key: "linkedIn", label: "LinkedIn", color: "border-blue-200 bg-blue-50" },
    { key: "twitter", label: "Twitter/X", color: "border-slate-200 bg-slate-50" },
    { key: "substack", label: "Substack", color: "border-orange-200 bg-orange-50" },
  ];

  return (
    <div className="space-y-4">
      <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg">
        <p className="text-xs font-semibold text-stone-500 uppercase">
          Core Message
        </p>
        <p className="text-sm text-stone-900 mt-2">{draft.coreMessage}</p>
      </div>

      <div className="grid gap-4">
        {platforms.map(({ key, label, color }) => (
          <div key={key} className={`p-4 border rounded-lg ${color}`}>
            <p className="text-xs font-semibold text-stone-600 uppercase">
              {label}
            </p>
            <p className="text-sm text-stone-900 mt-2 whitespace-pre-wrap">
              {draft[key]}
            </p>
            <button
              onClick={() => navigator.clipboard.writeText(draft[key])}
              className="mt-2 text-xs text-stone-600 hover:text-stone-900 font-medium"
            >
              Copy
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
