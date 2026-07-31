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
    const postIndex = this.posts.findIndex((p) => p._id === postId);
    if (postIndex === -1) return;
    
    const post = this.posts[postIndex];
    
    // Save previous state for rollback
    const prevUserReaction = post.userReaction;
    const prevReactionCounts = { ...(post.reactionCounts || {}) };
    
    // --- OPTIMISTIC UPDATE ---
    const newReactionCounts = { ...prevReactionCounts };
    let newUserReaction: string | null = reactionType;
    
    // If the user already had a reaction
    if (prevUserReaction) {
      // If clicking the same reaction, it means toggle OFF
      if (prevUserReaction === reactionType) {
        newUserReaction = null;
        if (newReactionCounts[prevUserReaction] > 0) {
          newReactionCounts[prevUserReaction] -= 1;
        }
      } else {
        // Switching to a different reaction
        if (newReactionCounts[prevUserReaction] > 0) {
          newReactionCounts[prevUserReaction] -= 1;
        }
        newReactionCounts[reactionType] = (newReactionCounts[reactionType] || 0) + 1;
      }
    } else {
      // Adding a reaction for the first time
      newReactionCounts[reactionType] = (newReactionCounts[reactionType] || 0) + 1;
    }
    
    // Apply optimistic state
    this.posts[postIndex] = {
      ...post,
      reactionCounts: newReactionCounts,
      userReaction: newUserReaction
    };
    
    // --- BACKGROUND API CALL ---
    try {
      const response = await axios.post(`/news/${postId}/like`, { reactionType });
      const { reactionCounts, userReaction } = response.data?.data || {};
      
      // Update with server truth in case there were simultaneous updates
      const currentIndex = this.posts.findIndex((p) => p._id === postId);
      if (currentIndex > -1) {
        this.posts[currentIndex] = {
          ...this.posts[currentIndex],
          reactionCounts: reactionCounts || this.posts[currentIndex].reactionCounts,
          userReaction: userReaction !== undefined ? userReaction : this.posts[currentIndex].userReaction,
        };
      }
      return response.data?.data;
    } catch (err: any) {
      console.error("Failed to toggle like/reaction:", err);
      // Rollback on failure
      const rollbackIndex = this.posts.findIndex((p) => p._id === postId);
      if (rollbackIndex > -1) {
        this.posts[rollbackIndex] = {
          ...this.posts[rollbackIndex],
          reactionCounts: prevReactionCounts,
          userReaction: prevUserReaction
        };
      }
    }
  };

  fetchComments = async (postId: string, page: number = 1) => {
    try {
      const response = await axios.get(`/news/${postId}/comments?page=${page}&limit=10`);
      return {
        data: response.data?.data || [],
        pagination: response.data?.pagination || { hasMore: false, total: 0 }
      };
    } catch (err: any) {
      console.error("Failed to fetch comments:", err);
      return { data: [], pagination: { hasMore: false, total: 0 } };
    }
  };

  fetchReplies = async (commentId: string) => {
    try {
      const response = await axios.get(`/news/comment/${commentId}/replies`);
      return response.data?.data || [];
    } catch (err: any) {
      console.error("Failed to fetch replies:", err);
      return [];
    }
  };

  addComment = async (postId: string, text: string, parentCommentId?: string) => {
    // --- OPTIMISTIC COMMENT COUNT ---
    const postIndex = this.posts.findIndex((p) => p._id === postId);
    if (postIndex > -1 && !parentCommentId) { // Only increment main count for top-level comments or according to your business logic
      const post = this.posts[postIndex];
      post.commentCount = (post.commentCount || 0) + 1;
      this.posts[postIndex] = { ...post };
    }

    try {
      const response = await axios.post(`/news/${postId}/comment`, { content: text, parentCommentId });
      return response.data?.data;
    } catch (err) {
      console.error("Failed to add comment:", err);
      // Revert optimistic count on failure
      if (postIndex > -1 && !parentCommentId) {
        const post = this.posts[postIndex];
        post.commentCount = Math.max((post.commentCount || 1) - 1, 0);
        this.posts[postIndex] = { ...post };
      }
      return null;
    }
  };

  fetchReactions = async (postId: string, page: number = 1, type?: string) => {
    try {
      const url = type && type !== 'All' 
        ? `/news/${postId}/reactions?page=${page}&limit=15&type=${type}`
        : `/news/${postId}/reactions?page=${page}&limit=15`;
      const response = await axios.get(url);
      return {
        data: response.data?.data || [],
        pagination: response.data?.pagination || { hasMore: false, total: 0 }
      };
    } catch (err: any) {
      console.error("Failed to fetch reactions:", err);
      return { data: [], pagination: { hasMore: false, total: 0 } };
    }
  };

  deleteComment = async (postId: string, commentId: string) => {
    try {
      await axios.delete(`/news/comment/${commentId}`);
      
      // Update comment count
      const postIndex = this.posts.findIndex((p) => p._id === postId);
      if (postIndex > -1) {
        const post = this.posts[postIndex];
        this.posts[postIndex] = {
          ...post,
          commentCount: Math.max(0, (post.commentCount || 1) - 1)
        };
      }
      return true;
    } catch (err: any) {
      console.error("Failed to delete comment:", err);
      throw err;
    }
  };
}

export const newsStore = new NewsStore();
