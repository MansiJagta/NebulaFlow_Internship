import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import ChannelList from '@/components/chat/ChannelList';
import ChatWindow from '@/components/chat/ChatWindow';
import MessageInput from '@/components/chat/MessageInput';
import { useAuth } from '@/contexts/AuthContext';
import { disconnectSocket, initializeSocket } from '@/lib/socket';

const PUBLIC_CHANNEL_NAMES = ['general', 'dev-team', 'design', 'daily-standup', 'random'];

const getPublicChannelMapKey = () => 'nebula-chat-public-channel-map';
const getDmMapKey = (userId) => `nebula-chat-dm-map-${userId}`;

const safeParse = (value, fallback) => {
  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

const getSenderId = (sender) => (typeof sender === 'string' ? sender : sender?._id || sender?.id || null);

const addMessageUnique = (prev, incoming) => {
  if (!incoming) return prev;
  if (!incoming._id) return [...prev, incoming];
  if (prev.some((message) => message._id === incoming._id)) return prev;
  return [...prev, incoming];
};

const SlackPage = () => {
  const { user, token, API_BASE_URL, selectedRepo } = useAuth();

  const [channels, setChannels] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [typingText, setTypingText] = useState('');

  const typingTimeoutRef = useRef(null);
  const activeChannelRef = useRef(activeChannel);

  useEffect(() => {
    activeChannelRef.current = activeChannel;
  }, [activeChannel]);

  const axiosConfig = useMemo(() => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return { headers, withCredentials: true };
  }, [token]);

  const fetchMessages = useCallback(
    async (channelId) => {
      if (!channelId) return;

      try {
        const response = await axios.get(`${API_BASE_URL}/chat/${channelId}`, axiosConfig);
        const nextMessages = Array.isArray(response.data) ? response.data : [];
        setMessages(nextMessages);
      } catch (error) {
        console.error('Failed to load messages', error);
        setMessages([]);
      }
    },
    [API_BASE_URL, axiosConfig]
  );

  const ensurePublicChannels = useCallback(async () => {
    try {
      // 1. Fetch current channels in this workspace
      const res = await axios.get(`${API_BASE_URL}/chat/workspace/${selectedRepo.workspaceId}/channels`, axiosConfig);
      let workspaceChannels = Array.isArray(res.data) ? res.data : [];

      // 2. Filter out DMs for the "Channels" list
      const publicChannels = workspaceChannels.filter(c => !c.isPrivate);
      
      // 3. If standard public channels are missing, create them
      const existingNames = new Set(publicChannels.map(c => c.name));
      const missing = PUBLIC_CHANNEL_NAMES.filter(name => !existingNames.has(name));

      if (missing.length > 0) {
        console.log(`[SlackPage] Creating missing public channels: ${missing.join(', ')}`);
        const created = await Promise.all(
          missing.map(async (name) => {
            const response = await axios.post(
              `${API_BASE_URL}/chat/channel/create`,
              { name, workspaceId: selectedRepo.workspaceId, isPrivate: false },
              axiosConfig
            );
            return response.data;
          })
        );
        workspaceChannels = [...workspaceChannels, ...created];
      }

      // 4. Return the IDs for socket joining and state
      return workspaceChannels.map(c => ({
        id: c._id,
        name: c.name,
        isPrivate: c.isPrivate,
        members: c.members || [],
        unread: 0
      }));
    } catch (err) {
      console.error('Failed to ensure public channels', err);
      return [];
    }
  }, [API_BASE_URL, axiosConfig, selectedRepo?.workspaceId]);

  const loadInitialData = useCallback(async () => {
    if (!user?.id || !selectedRepo?.workspaceId) {
      return;
    }

    try {
      console.log(`[SlackPage] Initializing Slack for workspace: ${selectedRepo.workspaceId}`);
      
      const [channelData, collabRes] = await Promise.all([
        ensurePublicChannels(),
        axios.get(`${API_BASE_URL}/github/repo/collaborators?owner=${selectedRepo.owner}&repo=${selectedRepo.name}`, axiosConfig),
      ]);

      // Populate channels list (public only)
      setChannels(channelData.filter(c => !c.isPrivate));

      // Populate collaborators list (strictly GitHub collaborators with accounts, matching Add Members page)
      const githubTeammates = (Array.isArray(collabRes.data) ? collabRes.data : [])
        .filter((entry) => entry.hasAccount && entry.userId !== user.id)
        .map((entry) => ({
          id: entry.userId,
          name: entry.name || entry.login,
          email: entry.email || `${entry.login}@github.com`,
          avatarUrl: entry.avatarUrl || '',
          online: true,
          unread: 0,
        }));
      setCollaborators(githubTeammates);

      // Join ALL socket rooms for this workspace (public channels + your DMs)
      const socket = initializeSocket(API_BASE_URL);
      channelData.forEach(channel => {
        socket.emit('join_channel', channel.id);
      });

      // Set first public channel as active by default if none selected
      if (channelData.length > 0) {
        const defaultChannel = channelData.find(c => !c.isPrivate) || channelData[0];
        setActiveChannel((prev) => prev || defaultChannel);
      }
    } catch (error) {
      console.error('Failed to initialize Slack page', error);
    }
  }, [API_BASE_URL, axiosConfig, ensurePublicChannels, user?.id, selectedRepo?.workspaceId]);

  useEffect(() => {
    if (user?.id && selectedRepo?.workspaceId) {
      loadInitialData();
    }
  }, [loadInitialData, user?.id, selectedRepo?.workspaceId]);

  useEffect(() => {
    const socket = initializeSocket(API_BASE_URL);

    socket.on('receive_message', (payload) => {
      const current = activeChannelRef.current;
      if (!payload?.channelId) return;

      if (current?.id === payload.channelId) {
        setMessages((prev) => addMessageUnique(prev, payload));
        return;
      }

      setChannels((prev) =>
        prev.map((channel) =>
          channel.id === payload.channelId
            ? {
                ...channel,
                unread: channel.unread + 1,
              }
            : channel
        )
      );

      setCollaborators((prev) => {
        const senderId = getSenderId(payload.sender);

        return prev.map((dmUser) => {
          const isSender = senderId && dmUser.id === senderId;

          if (!isSender) {
            return dmUser;
          }

          return {
            ...dmUser,
            unread: dmUser.unread + 1,
          };
        });
      });
    });
 
    socket.on('message_deleted', (messageId) => {
      const current = activeChannelRef.current;
      if (current) {
        setMessages((prev) => prev.filter(msg => msg._id !== messageId));
      }
    });

    socket.on('message_updated', (updatedMsg) => {
      const current = activeChannelRef.current;
      if (current && updatedMsg.channelId === current.id) {
        setMessages((prev) => prev.map(msg => msg._id === updatedMsg._id ? updatedMsg : msg));
      }
    });

    socket.on('typing_start', ({ userName, channelId }) => {
      if (activeChannelRef.current?.id === channelId) {
        setTypingText(`${userName} is typing...`);
      }
    });

    socket.on('typing_stop', ({ channelId }) => {
      if (activeChannelRef.current?.id === channelId) {
        setTypingText('');
      }
    });

    return () => {
      socket.off('receive_message');
      socket.off('message_deleted');
      socket.off('message_updated');
      socket.off('typing_start');
      socket.off('typing_stop');
      disconnectSocket();
    };
  }, [API_BASE_URL, user?.id]);

  useEffect(() => {
    const run = async () => {
      if (!activeChannel?.id) return;

      const socket = initializeSocket(API_BASE_URL);
      socket.emit('join_channel', activeChannel.id);

      await fetchMessages(activeChannel.id);

      if (activeChannel.type === 'channel') {
        setChannels((prev) =>
          prev.map((channel) =>
            channel.id === activeChannel.id
              ? {
                  ...channel,
                  unread: 0,
                }
              : channel
          )
        );
      }

      if (activeChannel.type === 'dm' && activeChannel.userId) {
        setCollaborators((prev) =>
          prev.map((dmUser) =>
            dmUser.id === activeChannel.userId
              ? {
                  ...dmUser,
                  unread: 0,
                }
              : dmUser
          )
        );
      }
    };

    run();
  }, [API_BASE_URL, activeChannel, fetchMessages]);

  const openPublicChannel = useCallback((channel) => {
    setActiveChannel({ ...channel, type: 'channel' });
  }, []);

  const openDmChannel = useCallback(
    async (targetUser) => {
      if (!user?.id) return;

      const response = await axios.post(
        `${API_BASE_URL}/chat/channel/create`,
        {
          name: `dm`, // Backend will handle finding/naming consistently
          workspaceId: selectedRepo?.workspaceId,
          isPrivate: true,
          members: [user.id, targetUser.id],
        },
        axiosConfig
      );

      const channelId = response?.data?._id;

      if (!channelId) return;

      setActiveChannel({
        id: channelId,
        type: 'dm',
        name: targetUser.name,
        userId: targetUser.id,
      });
    },
    [API_BASE_URL, axiosConfig, user?.id]
  );

  const sendMessage = useCallback(async () => {
    if (!activeChannel?.id || !inputMessage.trim()) return;

    const content = inputMessage.trim();

    try {
      const response = await axios.post(
        `${API_BASE_URL}/chat/send/${activeChannel.id}`,
        { content },
        axiosConfig
      );

      const savedMessage = response.data;
      setMessages((prev) => addMessageUnique(prev, savedMessage));

      setInputMessage('');
      setTypingText('');
    } catch (error) {
      console.error('Failed to send message', error);
    }
  }, [API_BASE_URL, activeChannel?.id, axiosConfig, inputMessage]);

  const uploadFile = useCallback(
    async (files, content = "") => {
      if (!activeChannel?.id || (!files?.length && !content)) return;

      const formData = new FormData();
      
      // Append each file if present
      if (files && files.length > 0) {
        files.forEach(file => {
          formData.append('file', file);
        });
      }

      // Append text content if present
      if (content) {
        formData.append('content', content);
      }

      try {
        const response = await axios.post(
          `${API_BASE_URL}/chat/upload/${activeChannel.id}`,
          formData,
          {
            ...axiosConfig,
            headers: {
              ...axiosConfig.headers,
            },
          }
        );

        const savedMessage = response.data;
        setMessages((prev) => addMessageUnique(prev, savedMessage));
      } catch (error) {
        console.error('File upload failed', error);
      }
    },
    [API_BASE_URL, activeChannel?.id, axiosConfig]
  );

  const emitTyping = useCallback(() => {
    if (!activeChannel?.id || !user?.name) return;

    const socket = initializeSocket(API_BASE_URL);
    socket.emit('typing_start', { channelId: activeChannel.id, userName: user.name });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', { channelId: activeChannel.id, userName: user.name });
    }, 1200);
  }, [API_BASE_URL, activeChannel?.id, user?.name]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex h-[calc(100vh-140px)] rounded-xl overflow-hidden border border-border/40 bg-card shadow-2xl">
      <ChannelList
        channels={channels}
        users={collaborators}
        activeChannel={activeChannel}
        onSelectChannel={openPublicChannel}
        onSelectDm={openDmChannel}
      />

      <div className="flex-1 flex flex-col">
        <ChatWindow 
          activeChannel={activeChannel} 
          messages={messages} 
          typingText={typingText}
          setMessages={setMessages}
          API_BASE_URL={API_BASE_URL}
          token={token}
        />
        <MessageInput
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          disabled={!activeChannel?.id}
          onSendMessage={sendMessage}
          onUploadFile={uploadFile}
          onTyping={emitTyping}
          activeChannelName={activeChannel?.type === 'channel' ? `#${activeChannel?.name}` : activeChannel?.name || ''}
        />
      </div>
    </div>
  );
};

export default SlackPage;
