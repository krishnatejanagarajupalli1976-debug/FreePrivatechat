import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { Message, Participant } from '@/hooks/useChat';

interface ChatRoomProps {
  roomCode: string;
  messages: Message[];
  participants: Participant[];
  isConnected: boolean;
  isDarkMode: boolean;
  onSendMessage: (content: string, type?: 'text' | 'image' | 'file' | 'voice' | 'video') => void;
  onUploadFile: (file: File) => Promise<string | null>;
  onToggleDarkMode: () => void;
  onLeaveRoom: () => void;
}

export function ChatRoom({
  roomCode,
  messages,
  participants,
  isConnected,
  isDarkMode,
  onSendMessage,
  onUploadFile,
  onToggleDarkMode,
  onLeaveRoom,
}: ChatRoomProps) {
  return (
    <div className="h-screen flex flex-col bg-background">
      <ChatHeader
        roomCode={roomCode}
        participants={participants}
        isDarkMode={isDarkMode}
        onToggleDarkMode={onToggleDarkMode}
        onLeaveRoom={onLeaveRoom}
      />
      
      <MessageList messages={messages} />
      
      <MessageInput onSendMessage={onSendMessage} onUploadFile={onUploadFile} disabled={!isConnected} />
      
      {!isConnected && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card/95 backdrop-blur px-6 py-3 rounded-full shadow-lg border border-border">
          <span className="text-muted-foreground">Connecting...</span>
        </div>
      )}
    </div>
  );
}
