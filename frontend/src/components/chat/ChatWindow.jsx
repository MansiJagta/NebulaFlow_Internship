import { useEffect, useMemo, useRef, useState } from 'react';
import { Hash, Trash2, Pencil, Check, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';

const formatTime = (value) => {
  if (!value) return '';
  try {
    return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

const getSenderName = (sender) => {
  if (!sender) return 'Unknown';
  return sender.fullName || sender.name || sender.email || 'Unknown';
};

const isImageFile = (url = '') => /\.(png|jpg|jpeg|gif|webp|svg)(\?.*)?$/i.test(url);
const isPdfFile = (url = '') => /\.pdf(\?.*)?$/i.test(url);

const ChatWindow = ({ activeChannel, messages, typingText, setMessages, API_BASE_URL = 'http://localhost:5000', token }) => {
  const { user } = useAuth();
  const bottomRef = useRef(null);
  
  // State for inline editing
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingText, activeChannel?.id]);

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        // Optimistic update (socket will also handle this but local update is faster)
        setMessages(prevMessages => prevMessages.filter(msg => msg._id !== messageId));
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete message');
      }
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  };

  const handleEditClick = (message) => {
    setEditingMessageId(message._id);
    setEditValue(message.content || '');
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditValue('');
  };

  const handleSaveEdit = async (messageId) => {
    if (!editValue.trim() || isSavingEdit) return;

    setIsSavingEdit(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: editValue.trim() }),
      });

      if (res.ok) {
        setEditingMessageId(null);
        setEditValue('');
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.message || data.error || 'Failed to edit message. Please check your permissions.');
      }
    } catch (error) {
      console.error('Error updating message:', error);
      alert('Network error. Failed to edit message.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const headerTitle = useMemo(() => {
    if (!activeChannel) return 'Loading...';
    if (activeChannel.type === 'dm') return activeChannel.name;
    return `# ${activeChannel.name}`;
  }, [activeChannel]);

  return (
    <div className="flex-1 flex flex-col bg-background/50 backdrop-blur-sm relative overflow-y-auto">
      <div className="h-14 border-b border-border/30 flex items-center px-4 bg-card/30 gap-2">
        {activeChannel?.type === 'channel' ? <Hash className="w-4 h-4 text-muted-foreground" /> : null}
        <h2 className="font-bold text-foreground truncate">{headerTitle}</h2>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-5">
          {messages.map((message) => {
            const senderName = getSenderName(message.sender);
            const senderInitial = senderName?.[0]?.toUpperCase() || 'U';
            const senderId = typeof message.sender === 'string' ? message.sender : message.sender?._id;
            const isEditing = editingMessageId === message._id;

            return (
              <div key={message._id || `${message.channelId}-${message.createdAt}`} className="flex gap-3 group">
                <div className="w-9 h-9 mt-1 rounded-md bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                  {senderInitial}
                </div>

                <div className="flex-1 max-w-3xl min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-sm text-foreground">{senderName}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatTime(message.createdAt)}
                      {message.isEdited && <span className="ml-1 italic opacity-60">(edited)</span>}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="flex flex-col gap-2 mt-1">
                        <textarea
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSaveEdit(message._id);
                            } else if (e.key === 'Escape') {
                              handleCancelEdit();
                            }
                          }}
                          className="w-full bg-card/50 border border-border/50 rounded-md p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary h-20 resize-none shadow-inner"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveEdit(message._id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
                          >
                            <Check size={14} /> Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted text-muted-foreground rounded-md text-xs font-semibold hover:bg-muted/80 transition-all shadow-sm"
                          >
                            <X size={14} /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {message.content && (
                          <p className="text-sm text-foreground/90 leading-relaxed break-words mb-2 whitespace-pre-wrap">
                            {message.content}
                          </p>
                        )}

                        {message.attachments && message.attachments.length > 0 ? (
                          <div className="flex flex-wrap gap-3 mt-2">
                            {message.attachments.map((att, idx) => (
                              <div key={idx} className="max-w-full">
                                {isImageFile(att.url) ? (
                                  <img
                                    src={att.url}
                                    alt={att.filename || 'attachment'}
                                    className="max-w-xs rounded-lg border border-border/30 hover:shadow-lg transition-shadow cursor-pointer"
                                  />
                                ) : isPdfFile(att.url) ? (
                                  <a
                                    href={`${API_BASE_URL}/api/chat/pdf/${message._id}?token=${token}&index=${idx}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 px-3 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg text-primary hover:text-primary/80 font-medium text-sm transition-all border border-primary/20"
                                  >
                                    📄 {att.filename || 'Open PDF'}
                                  </a>
                                ) : (
                                  <a
                                    href={att.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 px-3 py-2 bg-muted/50 hover:bg-muted rounded-lg text-foreground hover:text-foreground/80 font-medium text-sm transition-all"
                                  >
                                    📎 {att.filename || 'Open attachment'}
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : message.isAttachment && message.attachmentUrl ? (
                          <div className="mt-2">
                            {isImageFile(message.attachmentUrl) ? (
                              <img
                                src={message.attachmentUrl}
                                alt={message.attachmentFilename || 'attachment'}
                                className="max-w-xs rounded-lg border border-border/30 hover:shadow-lg transition-shadow cursor-pointer"
                              />
                            ) : isPdfFile(message.attachmentUrl) ? (
                              <a
                                href={`${API_BASE_URL}/api/chat/pdf/${message._id}${token ? `?token=${token}` : ''}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg text-primary hover:text-primary/80 font-medium text-sm transition-all border border-primary/20"
                              >
                                📄 {message.attachmentFilename || 'Open PDF'}
                              </a>
                            ) : (
                              <a
                                href={message.attachmentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-2 bg-muted/50 hover:bg-muted rounded-lg text-foreground hover:text-foreground/80 font-medium text-sm transition-all"
                              >
                                📎 {message.attachmentFilename || 'Open attachment'}
                              </a>
                            )}
                          </div>
                        ) : null}
                      </>
                    )}
                  </div>
                </div>
                {senderId === user?.id && !isEditing && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 self-start mt-1 bg-background/80 backdrop-blur-md border border-border/50 rounded-md p-0.5 shadow-sm">
                    <button 
                      onClick={() => handleEditClick(message)} 
                      className="p-1 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-all"
                      title="Edit message"
                    >
                      <Pencil size={15} />
                    </button>
                    <button 
                      onClick={() => handleDeleteMessage(message._id)} 
                      className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-all"
                      title="Delete message"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {typingText ? <p className="text-xs text-muted-foreground italic">{typingText}</p> : null}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatWindow;
