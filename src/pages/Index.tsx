import { useState, useEffect } from 'react';
import { NameInputScreen } from '@/components/chat/NameInputScreen';
import { RoomLobby } from '@/components/chat/RoomLobby';
import { ChatRoom } from '@/components/chat/ChatRoom';
import { getDisplayName } from '@/lib/sessionStore';
import { useChat } from '@/hooks/useChat';

const Index = () => {
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const {
    roomCode,
    messages,
    participants,
    isConnected,
    isLoading,
    createRoom,
    joinRoom,
    sendMessage,
    uploadFile,
    leaveRoom,
  } = useChat();

  // Check for existing display name
  useEffect(() => {
    const storedName = getDisplayName();
    if (storedName) {
      setDisplayName(storedName);
    }
  }, []);

  // Handle URL room code
  useEffect(() => {
    if (displayName) {
      const params = new URLSearchParams(window.location.search);
      const urlRoomCode = params.get('room');
      if (urlRoomCode && !roomCode) {
        joinRoom(urlRoomCode);
        // Clear URL params
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [displayName, roomCode, joinRoom]);

  // Handle dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Screen 1: Name input
  if (!displayName) {
    return <NameInputScreen onNameSet={setDisplayName} />;
  }

  // Screen 2: Room lobby (create/join)
  if (!roomCode) {
    return (
      <RoomLobby
        displayName={displayName}
        isLoading={isLoading}
        onCreateRoom={createRoom}
        onJoinRoom={joinRoom}
      />
    );
  }

  // Screen 3: Chat room
  return (
    <ChatRoom
      roomCode={roomCode}
      messages={messages}
      participants={participants}
      isConnected={isConnected}
      isDarkMode={isDarkMode}
      onSendMessage={sendMessage}
      onUploadFile={uploadFile}
      onToggleDarkMode={handleToggleDarkMode}
      onLeaveRoom={leaveRoom}
    />
  );
};

export default Index;
