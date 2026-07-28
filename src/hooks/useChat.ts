import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getSessionId, getDisplayName, generateRoomCode, getSavedRoom, saveRoom, clearSavedRoom } from '@/lib/sessionStore';
import { useToast } from '@/hooks/use-toast';

export interface Message {
  id: string;
  content: string;
  messageType: 'text' | 'system' | 'image' | 'file' | 'voice' | 'video';
  createdAt: string;
  participantId: string;
  senderName: string;
  isOwn: boolean;
}

export interface Participant {
  id: string;
  displayName: string;
  isActive: boolean;
}

export function useChat() {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const { toast } = useToast();

  const sessionId = getSessionId();
  const displayName = getDisplayName();

  // Load all existing messages for a room
  const loadMessages = useCallback(async (rId: string, myParticipantId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*, room_participants(display_name)')
      .eq('room_id', rId)
      .order('created_at', { ascending: true });

    if (error || !data) return;

    const loaded: Message[] = data.map((m: any) => ({
      id: m.id,
      content: m.content,
      messageType: m.message_type,
      createdAt: m.created_at,
      participantId: m.participant_id,
      senderName: m.room_participants?.display_name || 'Unknown',
      isOwn: m.participant_id === myParticipantId,
    }));

    setMessages(loaded);
  }, []);

  // Subscribe to realtime messages
  const subscribeToRoom = useCallback((roomIdToSubscribe: string, myParticipantId: string) => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
    }

    const channel = supabase
      .channel(`room-${roomIdToSubscribe}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomIdToSubscribe}`,
        },
        async (payload) => {
          const newMessage = payload.new as any;

          const { data: participant } = await supabase
            .from('room_participants')
            .select('display_name')
            .eq('id', newMessage.participant_id)
            .maybeSingle();

          const message: Message = {
            id: newMessage.id,
            content: newMessage.content,
            messageType: newMessage.message_type,
            createdAt: newMessage.created_at,
            participantId: newMessage.participant_id,
            senderName: participant?.display_name || 'Unknown',
            isOwn: newMessage.participant_id === myParticipantId,
          };

          // Avoid duplicates (message may already be in loaded history)
          setMessages((prev) =>
            prev.find((m) => m.id === message.id) ? prev : [...prev, message]
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_participants',
          filter: `room_id=eq.${roomIdToSubscribe}`,
        },
        async (payload) => {
          const { data } = await supabase
            .from('room_participants')
            .select('*')
            .eq('room_id', roomIdToSubscribe)
            .eq('is_active', true);

          if (data) {
            setParticipants(
              data.map((p) => ({
                id: p.id,
                displayName: p.display_name,
                isActive: p.is_active,
              }))
            );
          }

          if (payload.eventType === 'INSERT') {
            const newParticipant = payload.new as any;
            if (newParticipant.id !== myParticipantId) {
              setMessages((prev) => [
                ...prev,
                {
                  id: crypto.randomUUID(),
                  content: `${newParticipant.display_name} joined the chat`,
                  messageType: 'system',
                  createdAt: new Date().toISOString(),
                  participantId: '',
                  senderName: 'System',
                  isOwn: false,
                },
              ]);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedParticipant = payload.new as any;
            const oldParticipant = payload.old as any;
            if (oldParticipant.is_active && !updatedParticipant.is_active) {
              setMessages((prev) => [
                ...prev,
                {
                  id: crypto.randomUUID(),
                  content: `${updatedParticipant.display_name} left the chat`,
                  messageType: 'system',
                  createdAt: new Date().toISOString(),
                  participantId: '',
                  senderName: 'System',
                  isOwn: false,
                },
              ]);
            }
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    channelRef.current = channel;
  }, []);

  // Auto-rejoin saved room on page load
  useEffect(() => {
    const saved = getSavedRoom();
    if (!saved || !displayName) return;

    const rejoin = async () => {
      setIsLoading(true);
      try {
        // Verify room still exists
        const { data: room } = await supabase
          .from('rooms')
          .select('*')
          .eq('id', saved.roomId)
          .maybeSingle();

        if (!room) { clearSavedRoom(); return; }

        // Reactivate participant
        const { data: participant, error } = await supabase
          .from('room_participants')
          .update({ is_active: true })
          .eq('id', saved.participantId)
          .select()
          .single();

        if (error || !participant) { clearSavedRoom(); return; }

        const { data: allParticipants } = await supabase
          .from('room_participants')
          .select('*')
          .eq('room_id', saved.roomId)
          .eq('is_active', true);

        setRoomId(saved.roomId);
        setRoomCode(saved.roomCode);
        setParticipantId(saved.participantId);
        setParticipants(
          (allParticipants || []).map((p) => ({
            id: p.id,
            displayName: p.display_name,
            isActive: p.is_active,
          }))
        );

        await loadMessages(saved.roomId, saved.participantId);
        subscribeToRoom(saved.roomId, saved.participantId);
      } catch {
        clearSavedRoom();
      } finally {
        setIsLoading(false);
      }
    };

    rejoin();
  }, []);

  // Create a new room
  const createRoom = useCallback(async (maxUsers: number = 10) => {
    if (!displayName) return null;

    setIsLoading(true);
    try {
      const code = generateRoomCode();

      let room: any = null;
      for (const size of [maxUsers, 4]) {
        const { data, error } = await supabase
          .from('rooms')
          .insert({ room_code: code, max_users: size })
          .select()
          .single();
        if (!error) { room = data; break; }
        if (size === 4) throw error;
      }

      const { data: participant, error: participantError } = await supabase
        .from('room_participants')
        .insert({ room_id: room.id, display_name: displayName, session_id: sessionId })
        .select()
        .single();

      if (participantError) throw participantError;

      saveRoom(code, participant.id, room.id);
      setRoomId(room.id);
      setRoomCode(code);
      setParticipantId(participant.id);
      setParticipants([{ id: participant.id, displayName, isActive: true }]);
      await loadMessages(room.id, participant.id);
      subscribeToRoom(room.id, participant.id);

      return code;
    } catch (error: any) {
      toast({ title: 'Error creating room', description: error.message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [displayName, sessionId, subscribeToRoom, loadMessages, toast]);

  // Join an existing room
  const joinRoom = useCallback(async (code: string) => {
    if (!displayName) return false;

    setIsLoading(true);
    try {
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_code', code.toUpperCase())
        .maybeSingle();

      if (roomError) throw roomError;
      if (!room) {
        toast({ title: 'Invalid Room ID', description: 'The room does not exist or has expired.', variant: 'destructive' });
        return false;
      }

      const { data: existingParticipants } = await supabase
        .from('room_participants')
        .select('*')
        .eq('room_id', room.id)
        .eq('is_active', true);

      if (existingParticipants && existingParticipants.length >= room.max_users) {
        toast({ title: 'Room is full', description: 'This room has reached its maximum capacity.', variant: 'destructive' });
        return false;
      }

      const { data: existingParticipant } = await supabase
        .from('room_participants')
        .select('*')
        .eq('room_id', room.id)
        .eq('session_id', sessionId)
        .maybeSingle();

      let participant;
      if (existingParticipant) {
        const { data, error } = await supabase
          .from('room_participants')
          .update({ is_active: true, display_name: displayName })
          .eq('id', existingParticipant.id)
          .select()
          .single();
        if (error) throw error;
        participant = data;
      } else {
        const { data, error } = await supabase
          .from('room_participants')
          .insert({ room_id: room.id, display_name: displayName, session_id: sessionId })
          .select()
          .single();
        if (error) throw error;
        participant = data;
      }

      const { data: allParticipants } = await supabase
        .from('room_participants')
        .select('*')
        .eq('room_id', room.id)
        .eq('is_active', true);

      saveRoom(code.toUpperCase(), participant.id, room.id);
      setRoomId(room.id);
      setRoomCode(code.toUpperCase());
      setParticipantId(participant.id);
      setParticipants(
        (allParticipants || []).map((p) => ({
          id: p.id,
          displayName: p.display_name,
          isActive: p.is_active,
        }))
      );

      await loadMessages(room.id, participant.id);
      subscribeToRoom(room.id, participant.id);

      return true;
    } catch (error: any) {
      toast({ title: 'Error joining room', description: error.message, variant: 'destructive' });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [displayName, sessionId, subscribeToRoom, loadMessages, toast]);

  // Upload file to storage
  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    if (!roomId) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${roomId}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-files')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      toast({ title: 'Error uploading file', description: error.message, variant: 'destructive' });
      return null;
    }
  }, [roomId, toast]);

  // Send a message
  const sendMessage = useCallback(async (content: string, type: 'text' | 'image' | 'file' | 'voice' | 'video' = 'text') => {
    if (!roomId || !participantId || !content.trim()) return;

    // Always send as 'file' if type is 'video' to satisfy DB constraint
    const dbType = type === 'video' ? 'file' : type;

    try {
      const { error } = await supabase.from('messages').insert({
        room_id: roomId,
        participant_id: participantId,
        content: content.trim(),
        message_type: dbType,
      });

      if (error) throw error;
    } catch (error: any) {
      toast({ title: 'Error sending message', description: error.message, variant: 'destructive' });
    }
  }, [roomId, participantId, toast]);

  // Leave room (clears saved room)
  const leaveRoom = useCallback(async () => {
    if (!participantId) return;

    try {
      await supabase
        .from('room_participants')
        .update({ is_active: false })
        .eq('id', participantId);

      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }

      clearSavedRoom();
      setRoomId(null);
      setRoomCode(null);
      setParticipantId(null);
      setMessages([]);
      setParticipants([]);
      setIsConnected(false);
    } catch (error: any) {
      toast({ title: 'Error leaving room', description: error.message, variant: 'destructive' });
    }
  }, [participantId, toast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, []);

  return {
    roomId,
    roomCode,
    participantId,
    messages,
    participants,
    isConnected,
    isLoading,
    createRoom,
    joinRoom,
    sendMessage,
    uploadFile,
    leaveRoom,
  };
}
