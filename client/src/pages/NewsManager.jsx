import { useState, useEffect } from "react";
import { news } from "../api";

export default function NewsManager() {
  const [allNews, setAllNews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    source: "",
  });
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState(null);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const res = await news.list();
      setAllNews(res.data);
    } catch (error) {
      console.error("Failed to load news:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      alert("Title and content are required");
      return;
    }

    try {
      const res = await news.add(
        formData.title,
        formData.content,
        formData.source
      );
      setAllNews([res.data, ...allNews]);
      setFormData({ title: "", content: "", source: "" });
      setShowForm(false);
    } catch (error) {
      console.error("Failed to add news:", error);
      alert("Failed to add news item");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this news item?")) return;
    try {
      await news.delete(id);
      setAllNews(allNews.filter((n) => n.id !== id));
      setSelectedNews(null);
    } catch (error) {
      console.error("Failed to delete:", error);
      alert("Failed to delete news item");
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-stone-900">Daily Briefing</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors font-medium text-sm"
        >
          {showForm ? "Cancel" : "+ Add News"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border border-stone-200 rounded-lg bg-white space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="News headline"
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Content
            </label>
            <textarea
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              placeholder="News details and summary"
              rows="5"
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Source
            </label>
            <input
              type="text"
              value={formData.source}
              onChange={(e) =>
                setFormData({ ...formData, source: e.target.value })
              }
              placeholder="e.g., Twitter, News API, Paper"
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors font-medium"
          >
            Add News Item
          </button>
        </form>
      )}

      {/* News List */}
      {allNews.length === 0 ? (
        <div className="text-center py-12 text-stone-500">
          No news items yet. Add some to get content suggestions.
        </div>
      ) : (
        <div className="grid gap-4">
          {allNews.map((newsItem) => (
            <div
              key={newsItem.id}
              onClick={() =>
                setSelectedNews(
                  selectedNews === newsItem.id ? null : newsItem.id
                )
              }
              className="p-4 border border-stone-200 rounded-lg bg-white hover:border-stone-400 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-stone-900">
                    {newsItem.title}
                  </h3>
                  <p className="text-sm text-stone-600 mt-1 line-clamp-2">
                    {newsItem.content}
                  </p>
                  <p className="text-xs text-stone-500 mt-2">
                    {newsItem.source} •{" "}
                    {new Date(newsItem.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(newsItem.id);
                  }}
                  className="ml-4 text-xs text-red-600 hover:text-red-800 font-medium"
                >
                  Delete
                </button>
              </div>

              {/* Suggestions */}
              {selectedNews === newsItem.id && (
                <SuggestionsList newsId={newsItem.id} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SuggestionsList({ newsId }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuggestions();
  }, [newsId]);

  const loadSuggestions = async () => {
    try {
      const res = await news.get(newsId);
      setSuggestions(res.data.suggestions || []);
    } catch (error) {
      console.error("Failed to load suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p className="text-xs text-stone-500 mt-3">Loading suggestions...</p>;
  }

  return (
    <div className="mt-4 pt-4 border-t border-stone-200">
      <p className="text-xs font-semibold text-stone-600 uppercase mb-2">
        Content Suggestions
      </p>
      <div className="space-y-2">
        {suggestions.map((sugg, idx) => (
          <div
            key={idx}
            className="p-2 bg-stone-50 rounded text-sm text-stone-700"
          >
            {sugg.suggestion || sugg}
          </div>
        ))}
      </div>
    </div>
  );
}
