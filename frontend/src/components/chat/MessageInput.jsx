import { useRef } from 'react';
import { Paperclip, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const MessageInput = ({
  inputMessage,
  setInputMessage,
  disabled,
  onSendMessage,
  onUploadFile,
  onTyping,
  activeChannelName,
}) => {
  const fileInputRef = useRef(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await onUploadFile(file);
    event.target.value = '';
  };

  const handleKeyDown = async (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      await onSendMessage();
    }
  };

  return (
    <div className="p-4 pt-2 border-t border-border/20 bg-card/20">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={handleFileClick}
          disabled={disabled}
        >
          <Paperclip className="w-4 h-4" />
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,.pdf"
          onChange={handleFileChange}
        />

        <Input
          value={inputMessage}
          onChange={(event) => {
            setInputMessage(event.target.value);
            onTyping?.();
          }}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${activeChannelName}`}
          className="h-10"
          disabled={disabled}
        />

        <Button type="button" onClick={onSendMessage} disabled={disabled || !inputMessage.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
