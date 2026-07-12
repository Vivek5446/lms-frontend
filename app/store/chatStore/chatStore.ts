import { makeAutoObservable, runInAction } from "mobx";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import { BACKEND_URL } from "../../config/utils/variables";
import stores from "../stores";

// Socket.io must connect to the server root, NOT the /api prefix used by REST calls
const SOCKET_URL = (BACKEND_URL || "").replace(/\/api\/?$/, "");

class ChatStore {
  communities: any[] = [];
  activeCommunity: any = null;
  activeCommunityMemberCount: number = 0;
  rooms: any[] = [];
  activeRoom: any = null;
  messages: any[] = [];
  
  communityMembers: any[] = [];
  membersCurrentPage: number = 1;
  hasMoreMembers: boolean = true;
  isFetchingMembers: boolean = false;

  isLoading: boolean = false;
  socket: Socket | null = null;
  error: string | null = null;
  
  // Edit Drawer state
  isEditDrawerOpen: boolean = false;
  editingCommunity: any = null;
  
  // Cache State
  roomMessagesCache: Record<string, any[]> = {};
  roomPaginationCache: Record<string, { page: number, hasMore: boolean }> = {};
  
  // Pagination State
  currentPage: number = 1;
  hasMoreMessages: boolean = true;
  isLoadingMore: boolean = false;

  // Real-time & Robustness State
  typingUsers: string[] = [];
  typingTimeout: any = null;
  lastTypingEmitTime: number = 0;
  offlineQueue: any[] = [];
  isOnline: boolean = typeof window !== 'undefined' ? navigator.onLine : true;

  constructor() {
    makeAutoObservable(this);
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
  }

  handleOnline = () => {
    runInAction(() => { this.isOnline = true; });
    this.processOfflineQueue();
  };

  handleOffline = () => {
    runInAction(() => { this.isOnline = false; });
  };

  processOfflineQueue = async () => {
    if (this.offlineQueue.length === 0) return;
    const queue = [...this.offlineQueue];
    this.offlineQueue = [];

    const failedQueue: any[] = [];
    let hasFailed = false;

    for (const msg of queue) {
      if (hasFailed) {
        // Once one message fails, pause queue and preserve exact chronological order
        failedQueue.push(msg);
        continue;
      }
      try {
        await axios.post(`/community/rooms/${msg.room_id}/messages`, { content: msg.content });
      } catch (err) {
        console.error("Queue message failed, pausing queue.", err);
        hasFailed = true;
        failedQueue.push(msg);
      }
    }
    
    if (failedQueue.length > 0) {
      runInAction(() => {
        // Restore failed items safely to the top of the queue
        this.offlineQueue = [...failedQueue, ...this.offlineQueue];
      });
    }
  };

  // Socket Connection Management
  connectSocket = () => {
    // Only create and bind listeners once
    if (this.socket) {
      // Socket already exists — just make sure we're in the right room
      if (this.socket.connected && this.activeRoom) {
        this.socket.emit("joinRoom", this.activeRoom._id);
      }
      return;
    }

    this.socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"], // allow polling fallback
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
    console.log("[Socket] Connecting to:", SOCKET_URL);

    // ─── All listeners registered exactly once ───────────────────────────

    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket?.id);
      const user = stores.auth.user;
      if (user) this.socket!.emit("user_connected", user);
      // Re-join active room on every connect / reconnect
      if (this.activeRoom) this.socket!.emit("joinRoom", this.activeRoom._id);
    });

    this.socket.on("new-message", (message: any) => {
      if (this.activeRoom && message.room_id === this.activeRoom._id) {
        runInAction(() => {
          // Deduplicate only on exact temp-id match, not content
          const alreadyExists = this.messages.some(m => m._id === message._id);
          if (!alreadyExists) {
            // Replace any optimistic temp message that matches content + user
            const tempIdx = this.messages.findIndex(
              m => m._id?.startsWith("temp-") && m.content === message.content && m.user_id?._id === message.user_id?._id
            );
            if (tempIdx !== -1) {
              this.messages[tempIdx] = message;
            } else {
              this.messages.push(message);
            }
            if (this.activeRoom) {
              this.roomMessagesCache[this.activeRoom._id] = [...this.messages];
            }
          }
        });
      } else {
        runInAction(() => {
          if (this.roomMessagesCache[message.room_id]) {
            this.roomMessagesCache[message.room_id].push(message);
          }
        });
      }
    });

    this.socket.on("message-deleted", (data: any) => {
      const { room_id, message_id } = data;
      runInAction(() => {
        if (this.activeRoom && this.activeRoom._id === room_id) {
          this.messages = this.messages.filter(m => m._id !== message_id);
        }
        if (this.roomMessagesCache[room_id]) {
          this.roomMessagesCache[room_id] = this.roomMessagesCache[room_id].filter(m => m._id !== message_id);
        }
      });
    });

    this.socket.on("recieved-typing-status", (data: any) => {
      const { userData } = data;
      if (this.activeRoom && userData.room_id === this.activeRoom._id) {
        runInAction(() => {
          if (!this.typingUsers.includes(userData.name) && userData.name !== stores.auth.user?.name) {
            this.typingUsers.push(userData.name);
          }
        });
        if (this.typingTimeout) clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
          runInAction(() => { this.typingUsers = []; });
        }, 5000);
      }
    });
  };

  disconnectSocket = () => {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  };

  joinRoom = (roomId: string) => {
    if (!this.socket) return;
    if (this.socket.connected) {
      this.socket.emit("joinRoom", roomId);
    } else {
      this.socket.once("connect", () => {
        this.socket?.emit("joinRoom", roomId);
      });
    }
  };

  // API Calls
  fetchMyCommunities = async (page: number = 1, limit: number = 20) => {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await axios.get(`/community/my-communities`, { params: { page, limit } });
      runInAction(() => {
        this.communities = response.data.data;
        this.isLoading = false;
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data?.error || "Failed to fetch communities";
        this.isLoading = false;
      });
    }
  };

  fetchCommunityRooms = async (communityId: string, page: number = 1, limit: number = 20) => {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await axios.get(`/community/${communityId}/rooms`, { params: { page, limit } });
      runInAction(() => {
        this.rooms = response.data.data;
        this.isLoading = false;
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data?.error || "Failed to fetch rooms";
        this.isLoading = false;
      });
    }
  };

  fetchRoomMessages = async (roomId: string, page: number = 1, limit: number = 100) => {
    // If we already have the first page cached, don't show loading
    if (!this.roomMessagesCache[roomId]) {
      this.isLoading = true;
    }
    this.error = null;
    try {
      const response = await axios.get(`/community/rooms/${roomId}/messages`, { params: { page, limit } });
      runInAction(() => {
        const fetchedMessages = response.data.data.reverse();
        this.messages = fetchedMessages;
        this.currentPage = page;
        this.hasMoreMessages = fetchedMessages.length === limit;
        
        // Save to cache
        this.roomMessagesCache[roomId] = fetchedMessages;
        this.roomPaginationCache[roomId] = { page: this.currentPage, hasMore: this.hasMoreMessages };
        
        this.isLoading = false;
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.response?.data?.error || "Failed to fetch messages";
        this.isLoading = false;
      });
    }
  };

  deleteMessage = async (roomId: string, messageId: string) => {
    try {
      // Background DB Save
      await axios.delete(`/community/rooms/${roomId}/messages/${messageId}`);
      
      // Emit to socket so others see it deleted immediately
      if (this.socket) {
        this.socket.emit("delete-message", { room_id: roomId, message_id: messageId });
      }

      // We don't need to manually update local UI here because we optimistically deleted 
      // it from UI before this function is even called (during the 5 second countdown window)
      // but just in case, we can ensure it's removed:
      runInAction(() => {
        this.messages = this.messages.filter(m => m._id !== messageId);
        if (this.roomMessagesCache[roomId]) {
          this.roomMessagesCache[roomId] = this.roomMessagesCache[roomId].filter(m => m._id !== messageId);
        }
      });

    } catch (error) {
      console.error("Failed to delete message", error);
      // If backend fails, we should ideally revert the optimistic delete, but for now we'll just log
    }
  };

  loadMoreMessages = async () => {
    if (this.isLoadingMore || !this.hasMoreMessages || !this.activeRoom) return;
    
    this.isLoadingMore = true;
    const nextPage = this.currentPage + 1;
    const limit = 100;

    try {
      const response = await axios.get(`/community/rooms/${this.activeRoom._id}/messages`, { params: { page: nextPage, limit } });
      runInAction(() => {
        const fetchedMessages = response.data.data.reverse();
        // Prepend older messages to the top
        this.messages = [...fetchedMessages, ...this.messages];
        this.currentPage = nextPage;
        this.hasMoreMessages = fetchedMessages.length === limit;
        
        // Update Cache
        this.roomMessagesCache[this.activeRoom._id] = this.messages;
        this.roomPaginationCache[this.activeRoom._id] = { page: this.currentPage, hasMore: this.hasMoreMessages };
        
        this.isLoadingMore = false;
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = "Failed to load older messages";
        this.isLoadingMore = false;
      });
    }
  };

  fetchCommunityDetails = async (communityId: string) => {
    try {
      const response = await axios.get(`/community/${communityId}`);
      return response.data.data;
    } catch (err) {
      console.error("Failed to fetch community details", err);
      return null;
    }
  };

  reportCommunity = async (communityId: string, reason: string) => {
    try {
      await axios.post(`/community/${communityId}/report`, { reason });
      return true;
    } catch (err) {
      console.error("Failed to report community", err);
      return false;
    }
  };

  deleteCommunity = async (communityId: string) => {
    try {
      await axios.delete(`/community/${communityId}`);
      runInAction(() => {
        this.communities = this.communities.filter(c => c._id !== communityId);
        if (this.activeCommunity?._id === communityId) {
          this.activeCommunity = null;
          this.activeRoom = null;
        }
      });
      return true;
    } catch (err) {
      console.error("Failed to delete community", err);
      return false;
    }
  };


  fetchCommunityMemberCount = async (communityId: string) => {
    try {
      const response = await axios.get(`/community/${communityId}/member-count`);
      runInAction(() => {
        this.activeCommunityMemberCount = response.data.count || 0;
      });
    } catch (err) {
      console.error("Failed to fetch member count", err);
      runInAction(() => {
        this.activeCommunityMemberCount = 0;
      });
    }
  };

  fetchCommunityMembers = async (communityId: string, page: number = 1, limit: number = 20) => {
    this.isFetchingMembers = true;
    try {
      const response = await axios.get(`/community/${communityId}/members`, { params: { page, limit } });
      runInAction(() => {
        const fetchedMembers = response.data.data;
        if (page === 1) {
          this.communityMembers = fetchedMembers;
        } else {
          this.communityMembers = [...this.communityMembers, ...fetchedMembers];
        }
        this.membersCurrentPage = page;
        this.hasMoreMembers = fetchedMembers.length === limit;
        this.isFetchingMembers = false;
      });
    } catch (err) {
      console.error("Failed to fetch members", err);
      runInAction(() => {
        this.isFetchingMembers = false;
      });
    }
  };

  removeCommunityMember = async (communityId: string, memberUserId: string) => {
    try {
      // Optimistic update
      runInAction(() => {
        this.communityMembers = this.communityMembers.filter(m => m.user._id !== memberUserId);
        this.activeCommunityMemberCount = Math.max(0, this.activeCommunityMemberCount - 1);
      });
      await axios.delete(`/community/${communityId}/members/${memberUserId}`);
    } catch (err) {
      console.error("Failed to remove member", err);
      // Revert if we really wanted to, but simple error log is fine
    }
  };

  emitTyping = (roomId: string) => {
    const now = Date.now();
    // Debounce: Only emit typing status max once every 5 seconds
    if (now - this.lastTypingEmitTime < 5000) return;
    this.lastTypingEmitTime = now;

    if (this.socket && stores.auth.user) {
      this.socket.emit("typing-status", {
        room_id: roomId,
        name: stores.auth.user.name
      });
    }
  };

  sendMessage = async (roomId: string, content: string, file_url?: string, file_type?: string) => {
    try {
      // 1. Optimistic UI Update: Create a temporary message
      const tempId = "temp-" + Date.now();
      const user = stores.auth.user;
      
      const tempMessage = {
        _id: tempId,
        content: content,
        file_url: file_url,
        file_type: file_type,
        room_id: roomId,
        user_id: user,
        created_at: new Date().toISOString(),
      };

      // Instantly push to local UI and Cache
      runInAction(() => {
        this.messages.push(tempMessage);
        this.roomMessagesCache[roomId] = [...this.messages];
      });

      // Instantly emit to socket so others see it immediately
      if (this.socket) {
        this.socket.emit("send-message", tempMessage);
      }
      
      // If offline, queue it up and return early
      if (!this.isOnline) {
        runInAction(() => {
          this.offlineQueue.push(tempMessage);
        });
        return;
      }

      // 2. Background DB Save
      axios.post(`/community/rooms/${roomId}/messages`, { content, file_url, file_type })
        .then((response) => {
          const realMessage = response.data.data;
          // Replace temporary message with real DB message
          runInAction(() => {
            const index = this.messages.findIndex(m => m._id === tempId);
            if (index !== -1) {
              this.messages[index] = realMessage;
              this.roomMessagesCache[roomId] = [...this.messages];
            }
          });
        })
        .catch((err) => {
          console.error("Failed to save message to DB", err);
          // Revert optimistic update on failure
          runInAction(() => {
            this.messages = this.messages.filter(m => m._id !== tempId);
            this.roomMessagesCache[roomId] = [...this.messages];
            this.error = "Failed to send message";
          });
        });
        
    } catch (err: any) {
      console.error("Error in optimistic send", err);
    }
  };

  createCommunity = async (data: { name: string, description: string, privacy: string, category: string, icon: string, logo_url: string }) => {
    try {
      const response = await axios.post('/community', data);
      runInAction(() => {
        // Add new community to the front of the list
        this.communities = [response.data.data, ...this.communities];
        // Set it as active
        this.setActiveCommunity(response.data.data);
      });
      return response.data;
    } catch (error) {
      console.error("Error creating community", error);
      throw error;
    }
  };

  updateCommunity = async (communityId: string, data: { name: string, description: string, privacy: string, category: string, icon: string, logo_url: string }) => {
    try {
      const response = await axios.put(`/community/${communityId}`, data);
      runInAction(() => {
        const updatedCommunity = response.data.data;
        this.communities = this.communities.map(c => c._id === communityId ? updatedCommunity : c);
        if (this.activeCommunity?._id === communityId) {
          this.activeCommunity = updatedCommunity;
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error updating community", error);
      throw error;
    }
  };

  joinCommunity = async (communityId: string) => {
    try {
      const response = await axios.post(`/community/${communityId}/join`);
      runInAction(() => {
        // Immediately flip the is_member flag on the active community so the
        // message input appears right away without requiring a page refresh.
        if (this.activeCommunity && this.activeCommunity._id === communityId) {
          this.activeCommunity = { ...this.activeCommunity, is_member: true };
        }
        // Also refresh sidebar list in background
        this.fetchMyCommunities();
      });
      return response.data;
    } catch (error) {
      console.error("Error joining community", error);
      throw error;
    }
  };

  // State setters
  setActiveCommunity = (community: any) => {
    this.activeCommunity = community;
    this.activeCommunityMemberCount = 0;
    this.communityMembers = [];
    this.membersCurrentPage = 1;
    this.hasMoreMembers = true;
    this.activeRoom = null;
    this.messages = [];
  };

  setActiveRoom = (room: any) => {
    this.activeRoom = room;
    
    // 1. Immediately load from cache if available for instant tab switching
    if (this.roomMessagesCache[room._id]) {
      this.messages = this.roomMessagesCache[room._id];
      const pagination = this.roomPaginationCache[room._id];
      if (pagination) {
        this.currentPage = pagination.page;
        this.hasMoreMessages = pagination.hasMore;
      }
    } else {
      this.messages = [];
    }

    // 2. Fetch fresh data only if cache is empty
    // If cache exists, we rely on background Socket events to have caught new messages
    if (room) {
      if (!this.roomMessagesCache[room._id]) {
        this.fetchRoomMessages(room._id);
      }
      this.joinRoom(room._id);
    }
  };

  openEditDrawer = (community: any) => {
    runInAction(() => {
      this.editingCommunity = community;
      this.isEditDrawerOpen = true;
    });
  };

  closeEditDrawer = () => {
    runInAction(() => {
      this.editingCommunity = null;
      this.isEditDrawerOpen = false;
    });
  };
}

export const chatStore = new ChatStore();
