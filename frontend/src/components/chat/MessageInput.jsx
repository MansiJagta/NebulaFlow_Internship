import { useRef, useState } from 'react';
import { Paperclip, Send, X, FileText } from 'lucide-react';
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
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Limit to 3 files total
    const totalFiles = [...selectedFiles, ...files].slice(0, 3);
    setSelectedFiles(totalFiles);
    
    event.target.value = '';
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!inputMessage.trim() && selectedFiles.length === 0) return;

    if (selectedFiles.length > 0) {
      await onUploadFile(selectedFiles, inputMessage);
    } else {
      await onSendMessage();
    }
    
    setSelectedFiles([]);
    setInputMessage('');
  };

  const handleKeyDown = async (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      await handleSend();
    }
  };

  return (
    <div className="p-4 pt-2 border-t border-border/20 bg-card/20">
      {/* File Previews */}
      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-md border border-primary/20 text-xs text-primary group animate-in fade-in slide-in-from-bottom-1">
              <FileText className="w-3.5 h-3.5" />
              <span className="max-w-[150px] truncate font-medium">{file.name}</span>
              <button 
                onClick={() => removeFile(index)}
                className="ml-1 p-0.5 hover:bg-primary/20 rounded-full transition-colors"
                title="Remove file"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

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
          multiple
          onChange={handleFileChange}
        />

        <Input
          value={inputMessage}
          onChange={(event) => {
            setInputMessage(event.target.value);
            onTyping?.();
          }}
          onKeyDown={handleKeyDown}
          placeholder={selectedFiles.length > 0 ? "Add a message..." : `Message ${activeChannelName}`}
          className="h-10"
          disabled={disabled}
        />

        <Button 
          type="button" 
          onClick={handleSend} 
          disabled={disabled || (!inputMessage.trim() && selectedFiles.length === 0)}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
