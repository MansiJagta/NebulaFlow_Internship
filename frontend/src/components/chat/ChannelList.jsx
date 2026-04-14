import { Hash, MessageSquare, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

const getInitials = (value = '') =>
  value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';

const ChannelList = ({ channels, users, activeChannel, onSelectChannel, onSelectDm, onCreateChannelClick }) => {
  return (
    <div className="w-64 bg-sidebar/50 border-r border-border/30 flex flex-col">
      <div className="p-4 border-b border-border/20">
        <h2 className="font-bold text-lg text-foreground truncate">Nebula Flow HQ</h2>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <div className="mb-6">
          <div className="flex items-center justify-between px-2 mb-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Channels
            </h3>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 hover:bg-primary/20 text-muted-foreground hover:text-primary transition-colors"
              onClick={onCreateChannelClick}
              title="Create new channel"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {channels.map((channel) => {
            const isActive = activeChannel?.id === channel.id;

            return (
              <button
                key={channel.id}
                onClick={() => onSelectChannel(channel)}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm transition-all mb-0.5 ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-foreground/70 hover:bg-muted/30 hover:text-foreground'
                }`}
              >
                <Hash className="w-3.5 h-3.5 opacity-70" />
                <span className="flex-1 text-left truncate">{channel.name}</span>
                {channel.unread > 0 ? (
                  <Badge
                    variant="default"
                    className="w-5 h-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground"
                  >
                    {channel.unread}
                  </Badge>
                ) : null}
              </button>
            );
          })}
        </div>

        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
            Direct Messages
          </h3>

          {users.map((dmUser) => {
            const isActive = activeChannel?.type === 'dm' && activeChannel?.userId === dmUser.id;

            return (
              <button
                key={dmUser.id}
                onClick={() => onSelectDm(dmUser)}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm transition-all mb-0.5 ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-foreground/70 hover:bg-muted/30 hover:text-foreground'
                }`}
              >
                <Avatar className="w-5 h-5 rounded-md">
                  <AvatarImage src={dmUser.avatarUrl || ''} alt={dmUser.name} />
                  <AvatarFallback className="text-[9px] bg-muted text-muted-foreground font-bold rounded-md">
                    {getInitials(dmUser.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 text-left truncate">{dmUser.name}</span>
                {dmUser.unread > 0 ? (
                  <Badge
                    variant="secondary"
                    className="w-5 h-5 rounded-full p-0 flex items-center justify-center text-[10px]"
                  >
                    {dmUser.unread}
                  </Badge>
                ) : null}
                {dmUser.online ? <span className="w-2 h-2 rounded-full bg-emerald-500" /> : null}
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChannelList;
