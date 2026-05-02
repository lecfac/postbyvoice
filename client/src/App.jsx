import { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import ContentCreator from "./pages/ContentCreator";
import DraftViewer from "./pages/DraftViewer";
import NewsManager from "./pages/NewsManager";
import Header from "./components/Header";

export default function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [draftToView, setDraftToView] = useState(null);

  const goToDraft = (id) => {
    setDraftToView(id);
    setCurrentPage("draft");
  };

  const returnToDashboard = () => {
    setCurrentPage("dashboard");
    setDraftToView(null);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="max-w-6xl mx-auto px-4 py-8">
        {currentPage === "dashboard" && (
          <Dashboard goToDraft={goToDraft} />
        )}
        {currentPage === "create" && <ContentCreator />}
        {currentPage === "draft" && (
          <DraftViewer draftId={draftToView} onBack={returnToDashboard} />
        )}
        {currentPage === "news" && <NewsManager />}
      </main>
    </div>
  );
}
