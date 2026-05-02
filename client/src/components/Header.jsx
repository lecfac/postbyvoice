export default function Header({ currentPage, setCurrentPage }) {
  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-stone-900">PostByVoice</h1>
          <nav className="flex gap-6">
            {[
              { id: "dashboard", label: "Dashboard" },
              { id: "create", label: "Create" },
              { id: "news", label: "Briefing" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`text-sm font-medium transition-colors ${
                  currentPage === item.id
                    ? "text-stone-900 border-b-2 border-stone-900"
                    : "text-stone-500 hover:text-stone-700"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
