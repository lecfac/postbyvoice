import { useState, useEffect } from "react";
import { drafts, news } from "../api";

export default function Dashboard({ goToDraft }) {
  const [allDrafts, setAllDrafts] = useState([]);
  const [allNews, setAllNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [draftsRes, newsRes] = await Promise.all([
        drafts.list(),
        news.list(),
      ]);
      setAllDrafts(draftsRes.data);
      setAllNews(newsRes.data);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-12">
      {/* Recent Drafts */}
      <section>
        <h2 className="text-lg font-semibold text-stone-900 mb-4">
          Recent Drafts
        </h2>
        {allDrafts.length === 0 ? (
          <div className="text-center py-8 text-stone-500">
            No drafts yet. Start creating content.
          </div>
        ) : (
          <div className="grid gap-4">
            {allDrafts.slice(0, 5).map((draft) => (
              <div
                key={draft.id}
                onClick={() => goToDraft(draft.id)}
                className="p-4 border border-stone-200 rounded-lg hover:border-stone-400 cursor-pointer transition-colors bg-white"
              >
                <p className="text-sm font-medium text-stone-900">
                  {draft.coreMessage}
                </p>
                <p className="text-xs text-stone-500 mt-2">
                  {new Date(draft.createdAt).toLocaleDateString()}
                  {draft.newsTitle && ` • From: ${draft.newsTitle}`}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Daily Briefing Preview */}
      <section>
        <h2 className="text-lg font-semibold text-stone-900 mb-4">
          Daily Briefing
        </h2>
        {allNews.length === 0 ? (
          <div className="text-center py-8 text-stone-500">
            No news items yet. Add some to get started.
          </div>
        ) : (
          <div className="grid gap-4">
            {allNews.slice(0, 5).map((newsItem) => (
              <div
                key={newsItem.id}
                className="p-4 border border-stone-200 rounded-lg bg-white"
              >
                <h3 className="font-medium text-stone-900">{newsItem.title}</h3>
                <p className="text-sm text-stone-600 mt-1 line-clamp-2">
                  {newsItem.content}
                </p>
                <p className="text-xs text-stone-500 mt-2">{newsItem.source}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-4">
        <div className="p-4 border border-stone-200 rounded-lg bg-white">
          <p className="text-xs text-stone-500">Total Drafts</p>
          <p className="text-2xl font-semibold text-stone-900">
            {allDrafts.length}
          </p>
        </div>
        <div className="p-4 border border-stone-200 rounded-lg bg-white">
          <p className="text-xs text-stone-500">News Items</p>
          <p className="text-2xl font-semibold text-stone-900">
            {allNews.length}
          </p>
        </div>
      </section>
    </div>
  );
}
