import { makeAutoObservable } from "mobx";
import axios from "axios";

class NewsStore {
  posts: any[] = [];
  loading: boolean = false;
  error: string | null = null;
  pagination: { page: number; limit: number; total: number; totalPages: number } = {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  };

  constructor() {
    makeAutoObservable(this);
  }

  fetchPosts = async (params: { page?: number; limit?: number } = {}) => {
    this.loading = true;
    this.error = null;
    try {
      const response = await axios.get("/news", { params });
      
      if (params.page && params.page > 1) {
        this.posts = [...this.posts, ...(response.data?.data || [])];
      } else {
        this.posts = response.data?.data || [];
      }
      
      if (response.data?.pagination) {
        this.pagination = response.data.pagination;
      }
      
      return this.posts;
    } catch (err: any) {
      this.error = err?.response?.data?.message || err?.message || "Failed to fetch news posts";
      return Promise.reject(err);
    } finally {
      this.loading = false;
    }
  };

  createPost = async (postData: any) => {
    this.loading = true;
    try {
      const response = await axios.post("/news", postData);
      
      if (response.data?.data) {
        this.posts = [response.data.data, ...this.posts];
      }
      return { success: true, data: response.data?.data };
    } catch (err: any) {
      return { success: false, message: err?.response?.data?.message || err?.message };
    } finally {
      this.loading = false;
    }
  };

  toggleLike = async (postId: string, reactionType: string = 'like') => {
    try {
      const response = await axios.post(`/news/${postId}/like`, { reactionType });
      const { reactionCounts, userReaction, likes, reactions } = response.data?.data || {};
      
      const postIndex = this.posts.findIndex((p) => p._id === postId);
      if (postIndex > -1) {
        const post = this.posts[postIndex];
        this.posts[postIndex] = {
          ...post,
          reactionCounts: reactionCounts || post.reactionCounts,
          userReaction: userReaction !== undefined ? userReaction : post.userReaction,
          likes: [],
          reactions: []
        };
      }
      
      return response.data?.data;
    } catch (err: any) {
      console.error("Failed to toggle like/reaction:", err);
    }
  };

  addComment = async (postId: string, text: string) => {
    try {
      const response = await axios.post(`/news/${postId}/comment`, { text });
      const updatedComments = response.data?.data || [];
      
      const postIndex = this.posts.findIndex((p) => p._id === postId);
      if (postIndex > -1) {
        this.posts[postIndex].comments = updatedComments;
      }
      
      return updatedComments;
    } catch (err: any) {
      console.error("Failed to add comment:", err);
    }
  };
}

export const newsStore = new NewsStore();
