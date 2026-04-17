import { Users, X } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const ChatHeader = ({ activeChannel, onClose }) => {
  if (!activeChannel) return null;

  const membersArray = activeChannel.members || [];
  const memberCount = membersArray.length;
  const createdBy = activeChannel.createdBy;
  
  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-border/40 bg-card">
      <div className="flex items-center gap-4 overflow-hidden">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            {activeChannel.type === 'channel' && (
              <span className="text-lg font-bold text-foreground">
                # {activeChannel.name}
              </span>
            )}
            {activeChannel.type === 'dm' && (
              <span className="text-lg font-bold text-foreground">
                {activeChannel.name}
              </span>
            )}
          </div>
          
          {activeChannel.type !== 'dm' && (
            <div className="flex items-center gap-3 mt-1">
              {/* Member Badge - Styling inspired by user image */}
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-nebula-purple/20 border border-nebula-purple/30 rounded-full">
                <Users className="w-3 h-3 text-nebula-cyan" />
                <span className="text-[10px] font-bold text-nebula-cyan tracking-tight uppercase">
                  {memberCount} {memberCount === 1 ? 'member' : 'members'}
                </span>
              </div>

              {/* Created By Info */}
              {createdBy && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground uppercase opacity-60">Created by</span>
                  <div className="flex items-center gap-1 px-1.5 py-0.5 bg-white/5 border border-white/10 rounded-md">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-nebula-cyan to-nebula-purple flex items-center justify-center text-[7px] font-black text-white">
                      {createdBy.fullName?.[0]?.toUpperCase() || 'C'}
                    </div>
                    <span className="text-[10px] font-semibold text-foreground/80">{createdBy.fullName}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Avatars of first few members */}
        {membersArray.length > 0 && activeChannel.type !== 'dm' && (
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <div className="flex -space-x-2 cursor-pointer">
                  {membersArray.slice(0, 4).map((m, idx) => {
                    const mId = typeof m === 'string' ? m : m._id || m.id;
                    const mName = typeof m === 'string' ? 'Member' : m.fullName || m.name || m.email;
                    const mAvatar = typeof m === 'string' ? null : m.avatarUrl;
                    
                    return (
                      <Avatar key={mId} className="w-7 h-7 border-2 border-card ring-1 ring-border/20">
                        <AvatarImage src={mAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mId}`} />
                        <AvatarFallback className="text-[9px] bg-muted">{mName.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    );
                  })}
                  {memberCount > 4 && (
                    <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center border-2 border-card text-[9px] font-bold text-muted-foreground">
                      +{memberCount - 4}
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="p-3 bg-popover border-border/40 shadow-xl min-w-[180px] z-[100]">
                <p className="text-xs font-bold mb-2 pb-2 border-b border-border/20">Members ({memberCount})</p>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {membersArray.map((m) => {
                    const mId = typeof m === 'string' ? m : m._id || m.id;
                    const mName = typeof m === 'string' ? `User ${mId.substring(0,4)}` : m.fullName || m.name || m.email;
                    return (
                      <div key={mId} className="flex items-center gap-2 group">
                        <div className="w-5 h-5 rounded bg-muted flex items-center justify-center text-[7px] font-bold">{mName[0].toUpperCase()}</div>
                        <span className="text-xs truncate text-muted-foreground group-hover:text-foreground transition-colors">{mName}</span>
                      </div>
                    );
                  })}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Action Button (Optional close) */}
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
            title="Close chat"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
