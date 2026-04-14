import { useState, useMemo } from 'react';
import { X, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

const getInitials = (value = '') =>
  value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';

const CreateChannelModal = ({ isOpen, onClose, availableMembers, currentUserId, onCreateChannel, isLoading }) => {
  const [channelName, setChannelName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);

  const filteredAvailableMembers = useMemo(() => {
    // Filter out current user from available members
    return availableMembers.filter(member => member.id !== currentUserId);
  }, [availableMembers, currentUserId]);

  const handleToggleMember = (memberId) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleCreateChannel = async () => {
    if (!channelName.trim() || selectedMembers.length === 0) {
      alert('Please enter a channel name and select at least one member');
      return;
    }

    try {
      await onCreateChannel({
        name: channelName.trim(),
        members: selectedMembers,
      });

      // Reset form
      setChannelName('');
      setSelectedMembers([]);
      onClose();
    } catch (error) {
      console.error('Failed to create channel:', error);
      alert('Failed to create channel. Please try again.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCreateChannel();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl border border-border/50 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/20">
          <div>
            <h2 className="text-lg font-bold text-foreground">Create Channel</h2>
            <p className="text-xs text-muted-foreground mt-1">Create a group chat with team members</p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Channel Name Input */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-2 uppercase tracking-wider">
              Channel Name
            </label>
            <Input
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., frontend-team, design-review"
              className="bg-background/50 border-border/30"
              disabled={isLoading}
              autoFocus
            />
            <p className="text-[10px] text-muted-foreground mt-1.5">
              Use lowercase and hyphens. Example: my-awesome-channel
            </p>
          </div>

          {/* Members Selection */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-3 uppercase tracking-wider">
              Select Members ({selectedMembers.length})
            </label>

            {filteredAvailableMembers.length === 0 ? (
              <div className="text-center p-8 border-2 border-dashed border-border/20 rounded-lg">
                <p className="text-sm text-muted-foreground">No members available</p>
              </div>
            ) : (
              <ScrollArea className="h-64 border border-border/20 rounded-lg p-2 bg-background/30">
                <div className="space-y-1">
                  {filteredAvailableMembers.map((member) => {
                    const isSelected = selectedMembers.includes(member.id);

                    return (
                      <button
                        key={member.id}
                        onClick={() => handleToggleMember(member.id)}
                        disabled={isLoading}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-md transition-all cursor-pointer group `}
                      >
                        <div className="relative">
                          <Avatar className="w-8 h-8 rounded-md">
                            <AvatarImage src={member.avatarUrl || ''} alt={member.name} />
                            <AvatarFallback className="text-[10px] bg-muted text-muted-foreground font-bold rounded-md">
                              {getInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          {isSelected && (
                            <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-0.5">
                              <Check className="w-3 h-3 text-primary-foreground" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 text-left min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{member.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{member.email}</p>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-md border-2 transition-all ${
                            isSelected
                              ? 'bg-primary border-primary'
                              : 'border-border/40 group-hover:border-primary/50'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Selected Members Summary */}
          {selectedMembers.length > 0 && (
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-xs font-semibold text-primary mb-2">Selected Members:</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedMembers.map((memberId) => {
                  const member = filteredAvailableMembers.find(m => m.id === memberId);
                  return (
                    <span
                      key={memberId}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary rounded-md text-xs font-medium"
                    >
                      {member?.name}
                      <button
                        onClick={() => handleToggleMember(memberId)}
                        className="hover:text-primary/70"
                        disabled={isLoading}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-6 border-t border-border/20 bg-muted/20 rounded-b-xl">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateChannel}
            disabled={isLoading || !channelName.trim() || selectedMembers.length === 0}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⏳</span> Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" /> Create Channel
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateChannelModal;
