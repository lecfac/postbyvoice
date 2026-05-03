import { useState, useEffect } from "react";
import { drafts } from "../api";
import DraftPreview from "../components/DraftPreview";

export default function DraftViewer({ draftId, onBack }) {
  const [draft, setDraft] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDraft, setEditedDraft] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDraft();
  }, [draftId]);

  const loadDraft = async () => {
    try {
      const res = await drafts.get(draftId);
      setDraft(res.data);
      setEditedDraft(res.data);
    } catch (error) {
      console.error("Failed to load draft:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const res = await drafts.update(draftId, {
        coreMessage: editedDraft.coreMessage,
        linkedIn: editedDraft.linkedIn,
        twitter: editedDraft.twitter,
        substack: editedDraft.substack,
      });
      setDraft(res.data);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save:", error);
      alert("Failed to save changes");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this draft?")) return;
    try {
      await drafts.delete(draftId);
      onBack();
    } catch (error) {
      console.error("Failed to delete:", error);
      alert("Failed to delete draft");
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!draft) {
    return (
      <div className="text-center py-12">
        <p className="text-stone-600">Draft not found</p>
        <button
          onClick={onBack}
          className="mt-4 text-sm text-stone-600 hover:text-stone-900"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-sm text-stone-600 hover:text-stone-900"
        >
          ← Back
        </button>
        <div className="flex gap-2">
          {!isEditing && (
            <>
              <button
                onClick={() => {
                  setIsEditing(true);
                  setEditedDraft(draft);
                }}
                className="px-3 py-1 text-sm border border-stone-300 rounded text-stone-600 hover:bg-stone-100 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-1 text-sm border border-red-300 rounded text-red-600 hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            </>
          )}
          {isEditing && (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 text-sm border border-stone-300 rounded text-stone-600 hover:bg-stone-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1 text-sm bg-stone-900 text-white rounded hover:bg-stone-800 transition-colors"
              >
                Save
              </button>
            </>
          )}
        </div>
      </div>

      <div className="text-xs text-stone-500">
        Created {new Date(draft.createdAt).toLocaleDateString()}
        {draft.newsTitle && ` • From: ${draft.newsTitle}`}
      </div>

      {isEditing ? (
        <EditForm draft={editedDraft} setDraft={setEditedDraft} />
      ) : (
        <DraftPreview draft={draft} />
      )}
    </div>
  );
}

function EditForm({ draft, setDraft }) {
  const fields = [
    { key: "coreMessage", label: "Core Message" },
    { key: "linkedIn", label: "LinkedIn" },
    { key: "twitter", label: "Twitter/X" },
    { key: "substack", label: "Substack" },
  ];

  return (
    <div className="space-y-4">
      {fields.map(({ key, label }) => (
        <div key={key}>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            {label}
          </label>
          <textarea
            value={draft[key]}
            onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
            rows={key === "coreMessage" ? 2 : 4}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
          />
        </div>
      ))}
    </div>
  );
}
