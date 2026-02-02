export const sessionApi = {
  createSession: async (data) => {
    const response = await axiosInstance.post("/api/sessions", data);  // ✅ Added /api
    return response.data;
  },

  getActiveSessions: async () => {
    const response = await axiosInstance.get("/api/sessions/active");  // ✅ Added /api
    return response.data;
  },
  
  getMyRecentSessions: async () => {
    const response = await axiosInstance.get("/api/sessions/my-recent");  // ✅ Added /api
    return response.data;
  },

  getSessionById: async (id) => {
    const response = await axiosInstance.get(`/api/sessions/${id}`);  // ✅ Added /api
    return response.data;
  },

  joinSession: async (id) => {
    const response = await axiosInstance.post(`/api/sessions/${id}/join`);  // ✅ Added /api
    return response.data;
  },
  
  endSession: async (id) => {
    const response = await axiosInstance.post(`/api/sessions/${id}/end`);  // ✅ Added /api
    return response.data;
  },
  
  getStreamToken: async () => {
    const response = await axiosInstance.get("/api/chat/token");  // ✅ Added /api
    return response.data;
  },
};
