import axios from "axios";
import type {
  AuthResponse,
  ContentResponse,
  ContentType,
  MessageResponse,
  ShareLinkResponse,
  SharedBrainResponse,
} from "../types";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  signup: async (email: string, password: string): Promise<MessageResponse> => {
    const response = await api.post<MessageResponse>("/signup", {
      email,
      password,
    });
    return response.data;
  },

  signin: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/signin", {
      email,
      password,
    });
    return response.data;
  },
};

export const contentApi = {
  getAll: async (typeFilter?: ContentType): Promise<ContentResponse> => {
    const params = typeFilter ? { type: typeFilter } : {};
    const response = await api.get<ContentResponse>("/content", { params });
    return response.data;
  },

  create: async (data: {
    title: string;
    type?: ContentType;
    link?: string;
    content?: string;
    tags?: string[];
  }): Promise<MessageResponse> => {
    const response = await api.post<MessageResponse>("/content", data);
    return response.data;
  },

  delete: async (id: string): Promise<MessageResponse> => {
    const response = await api.delete<MessageResponse>(`/content/${id}`);
    return response.data;
  },
};

export const brainApi = {
  share: async (share: boolean): Promise<ShareLinkResponse | MessageResponse> => {
    const response = await api.post<ShareLinkResponse | MessageResponse>(
      "/brain/share",
      { share }
    );
    return response.data;
  },

  getShared: async (shareLink: string): Promise<SharedBrainResponse> => {
    const response = await api.get<SharedBrainResponse>(`/brain/${shareLink}`);
    return response.data;
  },
};
