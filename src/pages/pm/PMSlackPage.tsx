import { useState } from 'react';
import { motion } from 'framer-motion';
import { slackChannels, slackMessages, directMessages } from '@/data/slackMockData';
import { Hash, Send, Smile, Paperclip, AtSign } from 'lucide-react';

const SlackPage = () => {
  const [activeChannel, setActiveChannel] = useState('general');
  const [message, setMessage] = useState('');
  const filteredMessages = slackMessages.filter(m => m.channel === activeChannel);

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold nebula-gradient-text">Slack</h1>
        <p className="text-muted-foreground text-sm">Team communication hub</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-220px)]">
        {/* Channel Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="nebula-card p-3 overflow-y-auto"
        >
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">Channels</h3>
          {slackChannels.map(ch => (
            <button
              key={ch.id}
              onClick={() => setActiveChannel(ch.id)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-all ${
                activeChannel === ch.id ? 'bg-primary/10 text-primary' : 'text-foreground/70 hover:bg-muted/30'
              }`}
            >
              <Hash className="w-3.5 h-3.5" />
              <span className="flex-1 text-left">{ch.name}</span>
              {ch.unread > 0 && (
                <span className="w-5 h-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center font-bold">
                  {ch.unread}
                </span>
              )}
            </button>
          ))}

          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mt-4 mb-2">Direct Messages</h3>
          {directMessages.map(dm => (
            <button key={dm.id} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-foreground/70 hover:bg-muted/30 transition-all">
              <div className="relative">
                <div className="w-6 h-6 rounded-full bg-secondary/30 flex items-center justify-center text-xs font-bold text-secondary">
                  {dm.avatar}
                </div>
                {dm.online && <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-card" />}
              </div>
              <span className="flex-1 text-left truncate">{dm.user}</span>
            </button>
          ))}
        </motion.div>

        {/* Chat Area */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="nebula-card lg:col-span-3 flex flex-col"
        >
          {/* Channel Header */}
          <div className="px-4 py-3 border-b border-border/30 flex items-center gap-2">
            <Hash className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-foreground">{slackChannels.find(c => c.id === activeChannel)?.name}</h2>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {filteredMessages.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">No messages in this channel yet</p>
            ) : (
              filteredMessages.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-3 group"
                >
                  <div className="w-9 h-9 rounded-lg nebula-gradient-bg flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0">
                    {msg.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">{msg.user}</span>
                      <span className="text-xs text-muted-foreground">{msg.time}</span>
                    </div>
                    <p className="text-sm text-foreground/80 mt-0.5">{msg.message}</p>
                    {msg.reactions && (
                      <div className="flex gap-1.5 mt-1.5">
                        {msg.reactions.map((r, ri) => (
                          <span key={ri} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/30 text-xs border border-border/20 hover:bg-muted/50 cursor-pointer transition-colors">
                            {r.emoji} {r.count}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Message Input */}
          <div className="p-3 border-t border-border/30">
            <div className="flex items-center gap-2 bg-muted/20 rounded-lg px-3 py-2 border border-border/20 focus-within:border-primary/50 transition-colors">
              <Paperclip className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
              <input
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={`Message #${slackChannels.find(c => c.id === activeChannel)?.name}...`}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              <AtSign className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
              <Smile className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
              <button className="w-7 h-7 rounded-md bg-primary flex items-center justify-center hover:bg-primary/80 transition-colors">
                <Send className="w-3.5 h-3.5 text-primary-foreground" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SlackPage;
