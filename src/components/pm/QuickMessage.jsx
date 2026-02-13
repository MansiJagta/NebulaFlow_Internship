import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile, Paperclip, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const QuickMessage = () => {
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSend = () => {
        if (!message.trim()) return;
        setIsSending(true);
        setTimeout(() => {
            setIsSending(false);
            setSent(true);
            setMessage('');
            setTimeout(() => setSent(false), 2000);
        }, 1500);
    };

    return (
        <div className="nebula-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center justify-between">
                Quick Message
                {sent && <span className="text-xs text-green-400 animate-pulse">Sent!</span>}
            </h3>
            <div className="flex flex-col gap-2">
                <div className="relative">
                    <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Message #general..."
                        className="pr-10 bg-muted/20 border-border/30 focus-visible:ring-primary/50"
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 text-muted-foreground">
                        <Smile className="w-4 h-4 hover:text-primary cursor-pointer transition-colors" />
                    </div>
                </div>
                <div className="flex justify-between items-center mt-1">
                    <div className="flex gap-2 text-muted-foreground">
                        <Paperclip className="w-4 h-4 hover:text-foreground cursor-pointer transition-colors" />
                    </div>
                    <Button
                        size="sm"
                        variant="gradient"
                        onClick={handleSend}
                        disabled={isSending || !message.trim()}
                        className="h-8 px-4"
                    >
                        {isSending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                        <span className="ml-2">Send</span>
                    </Button>
                </div>
            </div>

            {/* Typing Indicator Simulation */}
            <AnimatePresence>
                {message.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-muted-foreground mt-2 flex items-center gap-1"
                    >
                        <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1 h-1 bg-primary rounded-full animate-bounce"></span>
                        <span className="ml-1">typing...</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default QuickMessage;
