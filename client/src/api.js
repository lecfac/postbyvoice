import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

export const drafts = {
  list: () => api.get("/drafts"),
  get: (id) => api.get(`/drafts/${id}`),
  generate: (userInput, newsId) =>
    api.post("/generate", { userInput, newsId }),
  update: (id, data) => api.patch(`/drafts/${id}`, data),
  delete: (id) => api.delete(`/drafts/${id}`),
};

export const news = {
  list: () => api.get("/news"),
  get: (id) => api.get(`/news/${id}`),
  add: (title, content, source) =>
    api.post("/news", { title, content, source }),
  delete: (id) => api.delete(`/news/${id}`),
};

export const files = {
  upload: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default api;
