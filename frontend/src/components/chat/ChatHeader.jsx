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

  const isMembersVisible = activeChannel.members && activeChannel.members.length > 0;
  
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-card">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          {activeChannel.type === 'channel' && (
            <span className="text-xl font-semibold text-foreground">
              # {activeChannel.name}
            </span>
          )}
          {activeChannel.type === 'dm' && (
            <span className="text-xl font-semibold text-foreground">
              {activeChannel.name}
            </span>
          )}
        </div>
        
        {/* Members Badge */}
        {isMembersVisible && (
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              <Users className="w-3 h-3 mr-1" />
              {activeChannel.members.length} {activeChannel.members.length === 1 ? 'member' : 'members'}
            </Badge>
          </div>
        )}
      </div>

      {/* Members List (Tooltip) */}
      {isMembersVisible && activeChannel.members.length > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity">
                <div className="flex -space-x-2">
                  {activeChannel.members.slice(0, 3).map((memberId) => (
                    <Avatar key={memberId} className="w-8 h-8 border-2 border-card">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${memberId}`} />
                      <AvatarFallback>{memberId.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  ))}
                  {activeChannel.members.length > 3 && (
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center border-2 border-card text-xs font-semibold">
                      +{activeChannel.members.length - 3}
                    </div>
                  )}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <div className="space-y-2">
                <p className="font-semibold">Channel Members ({activeChannel.members.length})</p>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {activeChannel.members.map((memberId, idx) => (
                    <div key={memberId} className="text-sm text-muted-foreground">
                      Member {idx + 1}: {memberId}
                    </div>
                  ))}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="p-2 hover:bg-accent rounded-lg transition-colors ml-4"
          title="Close chat"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default ChatHeader;
