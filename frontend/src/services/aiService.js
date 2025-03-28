import axios from "axios";
import { BASE_URL } from "../config/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add interceptor to add auth token to requests
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export const generateVideoIdeas = async (platform) => {
  try {
    const response = await api.post("/ai/generate-ideas", { platform });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const generateVideoStructure = (videoData, onProgressUpdate) => {
  return new Promise((resolve, reject) => {
    const source = new EventSource(`${BASE_URL}/ai/generate-video`, {
      withCredentials: true, // Include credentials for auth
    });

    // Send the POST request to initiate the process
    api.post("/ai/generate-video", videoData)
      .catch((error) => {
        source.close();
        reject(error.response?.data || error.message);
      });

    source.addEventListener("title", (event) => {
      const data = JSON.parse(event.data);
      onProgressUpdate({ type: "title", data });
    });

    source.addEventListener("description", (event) => {
      const data = JSON.parse(event.data);
      onProgressUpdate({ type: "description", data });
    });

    source.addEventListener("firstImage", (event) => {
      const data = JSON.parse(event.data);
      onProgressUpdate({ type: "firstImage", data });
    });

    source.addEventListener("progress", (event) => {
      const data = JSON.parse(event.data);
      onProgressUpdate({ type: "progress", data });
    });

    source.addEventListener("complete", (event) => {
      const data = JSON.parse(event.data);
      onProgressUpdate({ type: "complete", data });
      source.close();
      resolve(data);
    });

    source.addEventListener("error", (event) => {
      const data = JSON.parse(event.data);
      onProgressUpdate({ type: "error", data });
      source.close();
      reject(data);
    });

    source.onerror = () => {
      source.close();
      reject(new Error("SSE connection failed"));
    };
  });
};