import { format } from 'date-fns';
import { Download, FileIcon, ImageIcon, Video } from 'lucide-react';
import { Message } from '@/hooks/useChat';
import { Button } from '@/components/ui/button';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const time = format(new Date(message.createdAt), 'HH:mm');

  if (message.messageType === 'system') {
    return (
      <div className="flex justify-center my-2 animate-fade-in">
        <div className="chat-bubble-system">
          {message.content}
        </div>
      </div>
    );
  }

  // Parse file content (format: "url|filename")
  const parseFileContent = (content: string) => {
    const parts = content.split('|');
    if (parts.length >= 2) {
      return { url: parts[0], filename: parts.slice(1).join('|') };
    }
    return null;
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const isMediaMessage = message.messageType === 'image' || message.messageType === 'file' || message.messageType === 'video';
  const fileData = isMediaMessage ? parseFileContent(message.content) : null;

  return (
    <div
      className={`flex flex-col mb-2 animate-fade-in ${
        message.isOwn ? 'items-end' : 'items-start'
      }`}
    >
      {/* Sender name for received messages */}
      {!message.isOwn && (
        <span className="text-xs text-primary font-medium px-3 mb-0.5">
          {message.senderName}
        </span>
      )}
      
      <div
        className={`chat-bubble ${
          message.isOwn ? 'chat-bubble-sent' : 'chat-bubble-received'
        } ${isMediaMessage ? 'p-2' : ''}`}
      >
        {/* Video message */}
        {message.messageType === 'video' && fileData ? (
          <div className="space-y-2 min-w-[240px]">
            <div className="relative">
              <video
                src={fileData.url}
                controls
                className="w-full max-w-[280px] rounded-lg block"
              />
              <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                <Video className="w-3 h-3" /> Video
              </div>
            </div>
            <div className="flex items-center gap-2 px-1">
              <span className="text-xs truncate flex-1 text-muted-foreground">{fileData.filename}</span>
              <Button
                size="sm"
                className="gap-1.5 h-8 px-3 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => handleDownload(fileData.url, fileData.filename)}
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </Button>
            </div>
          </div>
        ) : message.messageType === 'image' && fileData ? (
          <div className="space-y-2 min-w-[200px]">
            <div className="relative">
              <img
                src={fileData.url}
                alt={fileData.filename}
                className="w-full max-w-[240px] rounded-lg cursor-pointer hover:opacity-90 transition-opacity block"
                onClick={() => window.open(fileData.url, '_blank')}
              />
              <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                <ImageIcon className="w-3 h-3" /> Photo
              </div>
            </div>
            <div className="flex items-center gap-2 px-1">
              <span className="text-xs truncate flex-1 text-muted-foreground">{fileData.filename}</span>
              <Button
                size="sm"
                className="gap-1.5 h-8 px-3 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => handleDownload(fileData.url, fileData.filename)}
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </Button>
            </div>
          </div>
        ) : message.messageType === 'file' && fileData ? (
          <div className="flex items-center gap-3 min-w-[220px] p-1">
            <div className="w-11 h-11 bg-primary/15 rounded-xl flex items-center justify-center shrink-0">
              <FileIcon className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{fileData.filename}</p>
              <p className="text-xs text-muted-foreground">Document</p>
            </div>
            <Button
              size="sm"
              className="gap-1.5 h-8 px-3 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => handleDownload(fileData.url, fileData.filename)}
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </Button>
          </div>
        ) : (
          /* Text message */
          <p className="text-[15px] leading-relaxed">{message.content}</p>
        )}
        
        <div
          className={`flex justify-end mt-1 -mb-0.5 ${
            message.isOwn ? 'text-bubble-sent-foreground/70' : 'text-muted-foreground'
          }`}
        >
          <span className="text-[10px]">{time}</span>
        </div>
      </div>
    </div>
  );
}
