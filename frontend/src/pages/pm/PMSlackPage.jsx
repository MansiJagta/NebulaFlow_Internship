import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { slackChannels, slackMessages, directMessages } from '@/data/slackMockData';
import { Hash, Send, Smile, Paperclip, AtSign, Video, FileText, Sparkles, Mic, Phone, Info, MoreVertical, Search, Plus, MessageSquare, List } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const SlackPage = () => {
    const [activeChannel, setActiveChannel] = useState('general');
    const [activeTab, setActiveTab] = useState('chat');
    const [message, setMessage] = useState('');

    const filteredMessages = slackMessages.filter(m => m.channel === activeChannel);
    const currentChannel = slackChannels.find(c => c.id === activeChannel);

    const mockDocs = [
        { name: 'Q3_Roadmap.pdf', type: 'PDF', size: '2.4 MB', date: 'Today' },
        { name: 'Design_System_v2.fig', type: 'Figma', size: '15 MB', date: 'Yesterday' },
        { name: 'API_Specs.docx', type: 'Word', size: '450 KB', date: 'Mon' },
        { name: 'User_Research.csv', type: 'CSV', size: '1.2 MB', date: 'Last week' },
    ];

    return (
        <div className="flex h-[calc(100vh-140px)] rounded-xl overflow-hidden border border-border/40 bg-card shadow-2xl">
            {/* Sidebar */}
            <div className="w-64 bg-sidebar/50 border-r border-border/30 flex flex-col">
                <div className="p-4 border-b border-border/20 flex items-center justify-between">
                    <h2 className="font-bold text-lg text-foreground truncate">Nebula Flow HQ</h2>
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-colors">
                        <Plus className="w-4 h-4 text-primary" />
                    </div>
                </div>

                <ScrollArea className="flex-1 px-3 py-4">
                    <div className="mb-6">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2 flex items-center justify-between group cursor-pointer hover:text-foreground">
                            Channels <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>
                        {slackChannels.map(ch => (
                            <button
                                key={ch.id}
                                onClick={() => { setActiveChannel(ch.id); setActiveTab('chat'); }}
                                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm transition-all mb-0.5 ${activeChannel === ch.id ? 'bg-primary/10 text-primary font-medium' : 'text-foreground/70 hover:bg-muted/30 hover:text-foreground'
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
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2 flex items-center justify-between group cursor-pointer hover:text-foreground">
                            Direct Messages <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>
                        {directMessages.map(dm => (
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
                {/* Channel Header */}
                <div className="h-14 border-b border-border/30 flex items-center justify-between px-4 bg-card/30">
                    <div className="flex items-center gap-2">
                        <Hash className="w-5 h-5 text-muted-foreground" />
                        <h2 className="font-bold text-foreground">{currentChannel?.name}</h2>
                        <span className="text-xs text-muted-foreground ml-2 border-l border-border/30 pl-2 hidden sm:block">Topic: Sprint Planning & Updates</span>
                    </div>

                    <div className="flex items-center gap-1 bg-muted/20 p-1 rounded-lg">
                        {[
                            { id: 'chat', icon: MessageSquare, label: 'Chat' },
                            { id: 'video', icon: Video, label: 'Huddle' },
                            { id: 'summary', icon: Sparkles, label: 'AI Summary' },
                            { id: 'docs', icon: FileText, label: 'Files' },
                        ].map((tab) => (
                            <TooltipProvider key={tab.id}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`p-2 rounded-md transition-all ${activeTab === tab.id ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground'}`}
                                        >
                                            <tab.icon className="w-4 h-4" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>{tab.label}</p></TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ))}
                        <Separator orientation="vertical" className="h-6 mx-1" />
                        <div className="flex items-center -space-x-2 mr-2">
                            <Avatar className="w-6 h-6 border-2 border-background"><AvatarFallback className="text-[9px] bg-red-400/20 text-red-400">J</AvatarFallback></Avatar>
                            <Avatar className="w-6 h-6 border-2 border-background"><AvatarFallback className="text-[9px] bg-blue-400/20 text-blue-400">S</AvatarFallback></Avatar>
                            <Avatar className="w-6 h-6 border-2 border-background"><AvatarFallback className="text-[9px] bg-green-400/20 text-green-400">M</AvatarFallback></Avatar>
                            <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[9px] text-muted-foreground font-bold">3+</div>
                        </div>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-hidden relative">
                    <AnimatePresence mode="wait">
                        {activeTab === 'chat' && (
                            <motion.div
                                key="chat"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="h-full flex flex-col"
                            >
                                <ScrollArea className="flex-1 p-4">
                                    {/* AI Summary Block (Collapsible-ish) */}
                                    <div className="mb-6 p-3 rounded-lg bg-primary/5 border border-primary/20 flex gap-3">
                                        <div className="p-2 h-fit rounded-md bg-primary/10 text-primary">
                                            <Sparkles className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-primary mb-1">AI Summary</h4>
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                Team discussed Sprint 14 priorities. <span className="text-foreground font-medium">@Alice</span> confirmed auth flow is ready for review. <span className="text-foreground font-medium">@Bob</span> is deploying the dashboard fix. Design review scheduled for 2 PM.
                                            </p>
                                        </div>
                                    </div>

                                    <Separator className="my-4 opacity-50" />

                                    <div className="space-y-6">
                                        {filteredMessages.map((msg, i) => (
                                            <div key={msg.id} className="flex gap-3 group">
                                                <div className="w-9 h-9 mt-1 rounded-md bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                                                    {msg.avatar}
                                                </div>
                                                <div className="flex-1 max-w-3xl">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className="font-bold text-sm hover:underline cursor-pointer">{msg.user}</span>
                                                        <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                                                    </div>
                                                    <p className="text-sm text-foreground/90 leading-relaxed">{msg.message}</p>

                                                    {msg.reactions && (
                                                        <div className="flex gap-1.5 mt-1.5">
                                                            {msg.reactions.map((r, ri) => (
                                                                <span key={ri} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-muted/40 border border-border/20 text-xs hover:bg-muted/60 cursor-pointer transition-colors">
                                                                    {r.emoji} <span className="text-[10px] font-semibold">{r.count}</span>
                                                                </span>
                                                            ))}
                                                            <span className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted text-muted-foreground cursor-pointer">
                                                                <Smile className="w-3.5 h-3.5" />
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>

                                {/* Message Input */}
                                <div className="p-4 pt-2">
                                    <div className="border border-border/40 rounded-xl bg-card overflow-hidden shadow-sm focus-within:ring-1 focus-within:ring-primary/50 focus-within:border-primary/50 transition-all">
                                        <div className="flex items-center gap-1 p-1.5 border-b border-border/10 bg-muted/20">
                                            <Button variant="ghost" size="icon" className="h-6 w-6"><span className="font-bold text-xs">B</span></Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6"><span className="italic text-xs font-serif">I</span></Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6"><span className="line-through text-xs">S</span></Button>
                                            <Separator orientation="vertical" className="h-4 mx-1" />
                                            <Button variant="ghost" size="icon" className="h-6 w-6"><List className="w-3 h-3" /></Button>
                                        </div>
                                        <textarea
                                            value={message}
                                            onChange={e => setMessage(e.target.value)}
                                            placeholder={`Message #${currentChannel?.name}`}
                                            className="w-full bg-transparent p-3 text-sm focus:outline-none min-h-[60px] resize-none"
                                        />
                                        <div className="flex items-center justify-between p-2 bg-transparent">
                                            <div className="flex items-center gap-1">
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground"><Plus className="w-4 h-4" /></Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground"><Video className="w-4 h-4" /></Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground"><Mic className="w-4 h-4" /></Button>
                                                <Separator orientation="vertical" className="h-4 mx-1" />
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground"><AtSign className="w-4 h-4" /></Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground"><Smile className="w-4 h-4" /></Button>
                                            </div>
                                            <Button size="sm" variant={message.trim() ? "default" : "secondary"} className={`h-7 px-3 transition-all ${message.trim() ? 'bg-primary text-primary-foreground' : 'opacity-70'}`}>
                                                <Send className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'video' && (
                            <motion.div
                                key="video"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="h-full flex items-center justify-center p-8"
                            >
                                <div className="w-full max-w-4xl grid grid-cols-2 gap-4">
                                    {['Alice', 'Bob', 'Carol', 'You'].map((u, i) => (
                                        <div key={u} className="aspect-video bg-muted/10 rounded-xl border border-border/20 relative overflow-hidden group">
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Avatar className="w-20 h-20 text-2xl">
                                                    <AvatarFallback className="bg-primary/10 text-primary">{u[0]}</AvatarFallback>
                                                </Avatar>
                                            </div>
                                            <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-xs text-white flex items-center gap-2">
                                                {i === 3 ? <Mic className="w-3 h-3 text-red-400" /> : <Mic className="w-3 h-3 text-green-400" />}
                                                {u}
                                            </div>
                                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="icon" variant="secondary" className="h-7 w-7 rounded-full"><MoreVertical className="w-4 h-4" /></Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 bg-card/80 backdrop-blur-xl p-3 rounded-full border border-border/20 shadow-xl">
                                    <Button size="icon" variant="destructive" className="rounded-full w-12 h-12"><Phone className="w-5 h-5 truncate" /></Button>
                                    <Button size="icon" variant="outline" className="rounded-full w-12 h-12 border-border/20 bg-muted/20"><Video className="w-5 h-5" /></Button>
                                    <Button size="icon" variant="outline" className="rounded-full w-12 h-12 border-border/20 bg-muted/20"><Mic className="w-5 h-5" /></Button>
                                    <Button size="icon" variant="outline" className="rounded-full w-12 h-12 border-border/20 bg-muted/20"><Smile className="w-5 h-5" /></Button>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'summary' && (
                            <motion.div
                                key="summary"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full p-8 max-w-3xl mx-auto"
                            >
                                <div className="nebula-card p-8 border-primary/20 bg-primary/5">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                            <Sparkles className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">Channel Intelligence</h2>
                                            <p className="text-sm text-muted-foreground">Automated daily digest</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Key Decisions
                                            </h3>
                                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
                                                <li>Sprint scope locked for v2.4 release.</li>
                                                <li>Dashboard refresh rate set to 5 minutes.</li>
                                                <li>Dark mode is the default theme for new users.</li>
                                            </ul>
                                        </div>
                                        <Separator className="bg-primary/10" />
                                        <div>
                                            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Action Items
                                            </h3>
                                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
                                                <li><strong className="text-foreground">@Alice</strong> to finalize API docs by EOD.</li>
                                                <li><strong className="text-foreground">@Bob</strong> needs to merge PR #234 before standup.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'docs' && (
                            <motion.div
                                key="docs"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full p-6"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="font-bold text-lg">Shared Files</h2>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
                                        <Button size="sm" variant="outline"><List className="w-4 h-4 mr-2" /> Sort</Button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {mockDocs.map((doc, i) => (
                                        <div key={i} className="group p-4 rounded-xl border border-border/30 bg-card hover:bg-muted/10 transition-all cursor-pointer hover:border-primary/30 relative">
                                            <div className="mb-4 w-10 h-10 rounded-lg bg-muted/30 flex items-center justify-center">
                                                <FileText className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                            </div>
                                            <h3 className="text-sm font-medium text-foreground truncate mb-1">{doc.name}</h3>
                                            <p className="text-xs text-muted-foreground flex justify-between">
                                                <span>{doc.size}</span>
                                                <span>{doc.date}</span>
                                            </p>
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="icon" variant="ghost" className="h-6 w-6"><MoreVertical className="w-3 h-3" /></Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default SlackPage;
