import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { slackChannels, slackMessages, directMessages } from '@/data/slackMockData';
import { Hash, Send, Smile, Paperclip, AtSign, Video, FileText, Sparkles, Mic, Plus } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const CollaboratorSlackPage = () => {
    const [activeChannel, setActiveChannel] = useState('general');
    const [activeTab, setActiveTab] = useState('chat');
    const [message, setMessage] = useState('');

    const filteredMessages = activeTab === 'mentions'
        ? slackMessages.filter(m => m.message.includes('@Alice'))
        : slackMessages.filter(m => m.channel === activeChannel);

    const currentChannel = slackChannels.find(c => c.id === activeChannel);

    const myChannels = slackChannels.slice(0, 3); // Mock "My Channels"

    return (
        <div className="flex h-[calc(100vh-140px)] rounded-xl overflow-hidden border border-border/40 bg-card shadow-2xl">
            {/* Sidebar */}
            <div className="w-64 bg-sidebar/50 border-r border-border/30 flex flex-col">
                <div className="p-4 border-b border-border/20">
                    <h2 className="font-bold text-lg text-foreground">Nebula Flow HQ</h2>
                </div>

                <ScrollArea className="flex-1 px-3 py-4">
                    {/* Mentions & Reactions */}
                    <div className="mb-6">
                        <button
                            onClick={() => setActiveTab('mentions')}
                            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm transition-all mb-0.5 ${activeTab === 'mentions' ? 'bg-primary/10 text-primary font-medium' : 'text-foreground/70 hover:bg-muted/30 hover:text-foreground'}`}
                        >
                            <AtSign className="w-3.5 h-3.5" />
                            <span className="flex-1 text-left">Mentions & Reactions</span>
                            <Badge variant="default" className="w-5 h-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-red-500 text-white">2</Badge>
                        </button>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2 flex items-center justify-between">
                            My Channels
                        </h3>
                        {myChannels.map(ch => (
                            <button
                                key={ch.id}
                                onClick={() => { setActiveChannel(ch.id); setActiveTab('chat'); }}
                                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm transition-all mb-0.5 ${activeChannel === ch.id && activeTab === 'chat' ? 'bg-primary/10 text-primary font-medium' : 'text-foreground/70 hover:bg-muted/30 hover:text-foreground'
                                    }`}
                            >
                                <Hash className="w-3.5 h-3.5 opacity-70" />
                                <span className="flex-1 text-left truncate">{ch.name}</span>
                                {ch.unread > 0 && (
                                    <Badge variant="default" className="w-5 h-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground">{ch.unread}</Badge>
                                )}
                            </button>
                        ))}
                    </div>

                    <div>
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2 flex items-center justify-between">
                            Recent DMs
                        </h3>
                        {directMessages.slice(0, 4).map(dm => (
                            <button key={dm.id} className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm text-foreground/70 hover:bg-muted/30 hover:text-foreground mb-0.5 transition-all group">
                                <div className="relative">
                                    <Avatar className="w-5 h-5 rounded-md">
                                        <AvatarFallback className="text-[9px] bg-muted text-muted-foreground font-bold rounded-md group-hover:bg-muted/80">{dm.avatar}</AvatarFallback>
                                    </Avatar>
                                    {dm.online && <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border-2 border-sidebar" />}
                                </div>
                                <span className="flex-1 text-left truncate">{dm.user}</span>
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col bg-background/50 backdrop-blur-sm relative">
                {/* Header */}
                <div className="h-14 border-b border-border/30 flex items-center justify-between px-4 bg-card/30">
                    <div className="flex items-center gap-2">
                        {activeTab === 'mentions' ? (
                            <>
                                <AtSign className="w-5 h-5 text-red-500" />
                                <h2 className="font-bold text-foreground">Mentions & Activity</h2>
                            </>
                        ) : (
                            <>
                                <Hash className="w-5 h-5 text-muted-foreground" />
                                <h2 className="font-bold text-foreground">{currentChannel?.name}</h2>
                            </>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden relative">
                    <ScrollArea className="flex-1 p-4 h-full">
                        {activeTab === 'mentions' && (
                            <div className="mb-6 px-4 py-2 bg-yellow-500/10 border-l-4 border-yellow-500 rounded-r-lg">
                                <p className="text-sm text-yellow-500 font-medium">You have 2 new mentions requiring attention.</p>
                            </div>
                        )}

                        <div className="space-y-6">
                            {filteredMessages.map((msg, i) => (
                                <div key={msg.id} className={`flex gap-3 group ${activeTab === 'mentions' ? 'bg-muted/10 p-3 rounded-lg border border-border/20' : ''}`}>
                                    <div className="w-9 h-9 mt-1 rounded-md bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                                        {msg.avatar}
                                    </div>
                                    <div className="flex-1 max-w-3xl">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="font-bold text-sm hover:underline cursor-pointer">{msg.user}</span>
                                            <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                                            {activeTab === 'mentions' && <span className="text-[10px] bg-muted px-1.5 rounded text-muted-foreground">in #{msg.channel}</span>}
                                        </div>
                                        <p className="text-sm text-foreground/90 leading-relaxed">
                                            {msg.message.split(' ').map((word, idx) =>
                                                word.startsWith('@Alice') || word.startsWith('@channel')
                                                    ? <span key={idx} className="bg-yellow-500/20 text-yellow-500 rounded px-1 font-medium">{word} </span>
                                                    : word + ' '
                                            )}
                                        </p>

                                        {msg.reactions && (
                                            <div className="flex gap-1.5 mt-1.5">
                                                {msg.reactions.map((r, ri) => (
                                                    <span key={ri} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-muted/40 border border-border/20 text-xs hover:bg-muted/60 cursor-pointer transition-colors">
                                                        {r.emoji} <span className="text-[10px] font-semibold">{r.count}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                    {/* Message Input - Only for chat tab */}
                    {activeTab === 'chat' && (
                        <div className="p-4 pt-2">
                            <div className="border border-border/40 rounded-xl bg-card overflow-hidden shadow-sm focus-within:ring-1 focus-within:ring-primary/50 focus-within:border-primary/50 transition-all">
                                <textarea
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    placeholder={`Message #${currentChannel?.name}`}
                                    className="w-full bg-transparent p-3 text-sm focus:outline-none min-h-[60px] resize-none"
                                />
                                <div className="flex items-center justify-between p-2 bg-transparent">
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground"><Paperclip className="w-4 h-4" /></Button>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground"><AtSign className="w-4 h-4" /></Button>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground"><Smile className="w-4 h-4" /></Button>
                                    </div>
                                    <Button size="sm" variant={message.trim() ? "default" : "secondary"} className={`h-7 px-3 transition-all ${message.trim() ? 'bg-primary text-primary-foreground' : 'opacity-70'}`}>
                                        <Send className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CollaboratorSlackPage;
