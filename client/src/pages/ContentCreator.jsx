import { useState, useRef } from "react";
import { drafts, files, news } from "../api";
import DraftPreview from "../components/DraftPreview";

export default function ContentCreator() {
  const [input, setInput] = useState("");
  const [selectedNews, setSelectedNews] = useState(null);
  const [allNews, setAllNews] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fileContent, setFileContent] = useState("");
  const fileInputRef = useRef(null);

  const loadNews = async () => {
    try {
      const res = await news.list();
      setAllNews(res.data);
    } catch (error) {
      console.error("Failed to load news:", error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await files.upload(file);
      setFileContent(res.data.extracted);
      setInput(res.data.extracted);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to process file");
    } finally {
      setUploading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setGenerating(true);
    try {
      const res = await drafts.generate(input, selectedNews);
      setResult(res.data);
      setInput("");
      setFileContent("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Generation failed:", error);
      alert("Failed to generate content");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-stone-900 mb-4">
          Create Content
        </h2>

        <form onSubmit={handleGenerate} className="space-y-4">
          {/* Input Method Selector */}
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => loadNews()}
              className="px-3 py-1 text-sm border border-stone-300 rounded text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Link to News
            </button>
          </div>

          {/* News Selection */}
          {allNews.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Link to News Item (Optional)
              </label>
              <select
                value={selectedNews || ""}
                onChange={(e) => setSelectedNews(e.target.value || null)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400"
              >
                <option value="">-- None --</option>
                {allNews.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Text Input */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Your Idea or Content
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste text or write your idea here..."
              rows="6"
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Or Upload File
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              disabled={uploading}
              accept=".txt,.pdf,.doc,.docx"
              className="block w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200"
            />
            {uploading && <p className="text-xs text-stone-500 mt-1">Processing...</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!input.trim() || generating}
            className="w-full px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 disabled:bg-stone-300 transition-colors font-medium"
          >
            {generating ? "Generating..." : "Generate Content"}
          </button>
        </form>
      </div>

      {/* Result Preview */}
      {result && (
        <div className="border-t border-stone-200 pt-6">
          <h3 className="text-lg font-semibold text-stone-900 mb-4">
            Generated Content
          </h3>
          <DraftPreview draft={result} />
          <button
            onClick={() => setResult(null)}
            className="mt-4 px-4 py-2 text-sm border border-stone-300 rounded text-stone-600 hover:bg-stone-100 transition-colors"
          >
            Create Another
          </button>
        </div>
      )}
    </div>
  );
}
