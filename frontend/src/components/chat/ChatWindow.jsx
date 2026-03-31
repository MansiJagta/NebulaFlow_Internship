import { useEffect, useMemo, useRef } from 'react';
import { Hash } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

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

const ChatWindow = ({ activeChannel, messages, typingText }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingText, activeChannel?.id]);

  const headerTitle = useMemo(() => {
    if (!activeChannel) return 'Loading...';
    if (activeChannel.type === 'dm') return activeChannel.name;
    return `# ${activeChannel.name}`;
  }, [activeChannel]);

  return (
    <div className="flex-1 flex flex-col bg-background/50 backdrop-blur-sm relative">
      <div className="h-14 border-b border-border/30 flex items-center px-4 bg-card/30 gap-2">
        {activeChannel?.type === 'channel' ? <Hash className="w-4 h-4 text-muted-foreground" /> : null}
        <h2 className="font-bold text-foreground truncate">{headerTitle}</h2>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-5">
          {messages.map((message) => {
            const senderName = getSenderName(message.sender);
            const senderInitial = senderName?.[0]?.toUpperCase() || 'U';

            return (
              <div key={message._id || `${message.channelId}-${message.createdAt}`} className="flex gap-3">
                <div className="w-9 h-9 mt-1 rounded-md bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                  {senderInitial}
                </div>

                <div className="flex-1 max-w-3xl min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-sm text-foreground">{senderName}</span>
                    <span className="text-[10px] text-muted-foreground">{formatTime(message.createdAt)}</span>
                  </div>

                  {message.content ? (
                    <p className="text-sm text-foreground/90 leading-relaxed break-words">{message.content}</p>
                  ) : null}

                  {message.fileUrl ? (
                    <div className="mt-2">
                      {isImageFile(message.fileUrl) ? (
                        <img
                          src={message.fileUrl}
                          alt="attachment"
                          className="max-w-xs rounded-lg border border-border/30"
                        />
                      ) : null}

                      {isPdfFile(message.fileUrl) ? (
                        <a
                          href={message.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm underline text-primary"
                        >
                          Open PDF attachment
                        </a>
                      ) : null}

                      {!isImageFile(message.fileUrl) && !isPdfFile(message.fileUrl) ? (
                        <a
                          href={message.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm underline text-primary"
                        >
                          Open attachment
                        </a>
                      ) : null}
                    </div>
                  ) : null}
                </div>
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
