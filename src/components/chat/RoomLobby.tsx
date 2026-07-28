import { useState, useEffect, useRef } from 'react';
import { Plus, LogIn, QrCode, MessageCircle, Users, AlertTriangle, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Html5Qrcode } from 'html5-qrcode';

interface RoomLobbyProps {
  displayName: string;
  isLoading: boolean;
  onCreateRoom: (maxUsers: number) => Promise<string | null>;
  onJoinRoom: (code: string) => Promise<boolean>;
}

const ROOM_SIZE_OPTIONS = [
  { value: 4, label: '4 Users', description: 'Small group' },
  { value: 10, label: '10 Users', description: 'Team chat' },
  { value: 25, label: '25 Users', description: 'Medium group' },
  { value: 50, label: '50 Users', description: 'Large group — Free' },
  { value: 100, label: '100 Users', description: 'Max group — Free' },
];

const DB_FIX_SQL = `ALTER TABLE public.rooms DROP CONSTRAINT IF EXISTS rooms_max_users_check;
ALTER TABLE public.rooms ADD CONSTRAINT rooms_max_users_check CHECK (max_users >= 2 AND max_users <= 100);
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_message_type_check;
ALTER TABLE public.messages ADD CONSTRAINT messages_message_type_check CHECK (message_type IN ('text', 'system', 'image', 'file', 'voice', 'video'));`;

export function RoomLobby({ displayName, isLoading, onCreateRoom, onJoinRoom }: RoomLobbyProps) {
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const [showDbFix, setShowDbFix] = useState(false);
  const [copied, setCopied] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const handleCreateRoom = async (maxUsers: number) => {
    setShowSizeSelector(false);
    const code = await onCreateRoom(maxUsers);
    if (!code) setShowDbFix(true);
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(DB_FIX_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const code = joinCode.trim().toUpperCase();
    if (!code) {
      setError('Please enter a Room ID');
      return;
    }
    if (code.length !== 10) {
      setError('Room ID must be exactly 10 characters');
      return;
    }

    const success = await onJoinRoom(code);
    if (!success) {
      setError('Invalid or expired Room ID');
    }
  };

  const startScanner = async () => {
    try {
      setScannerError('');
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          // Extract room code from URL or use directly
          let roomCode = decodedText;
          
          // If it's a URL, try to extract the room code
          if (decodedText.includes('room=')) {
            const url = new URL(decodedText);
            roomCode = url.searchParams.get('room') || decodedText;
          }
          
          // Clean and validate
          roomCode = roomCode.trim().toUpperCase();
          if (roomCode.length === 10) {
            await stopScanner();
            setShowQRScanner(false);
            const success = await onJoinRoom(roomCode);
            if (!success) {
              setError('Invalid or expired Room ID from QR code');
            }
          }
        },
        () => {
          // Ignore scan errors (no QR detected)
        }
      );
    } catch (err) {
      console.error('Scanner error:', err);
      setScannerError('Could not access camera. Please allow camera permission or enter Room ID manually.');
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
      scannerRef.current = null;
    }
  };

  useEffect(() => {
    if (showQRScanner) {
      // Small delay to ensure dialog is rendered
      const timer = setTimeout(() => {
        startScanner();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      stopScanner();
    }
  }, [showQRScanner]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-4">
            <MessageCircle className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Welcome, {displayName}!</h1>
          <p className="text-muted-foreground mt-1">Create or join a chat room</p>
        </div>

        <div className="space-y-4">
          {/* DB Fix Banner */}
          {showDbFix && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">Database fix required</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Run this SQL in your{' '}
                    <a
                      href="https://supabase.com/dashboard/project/ktvzntxjfabvtwtpksrp/sql/new"
                      target="_blank"
                      rel="noreferrer"
                      className="underline font-medium"
                    >
                      Supabase SQL Editor
                    </a>
                    , then try again:
                  </p>
                </div>
              </div>
              <pre className="bg-amber-100 rounded-lg p-3 text-[11px] text-amber-900 overflow-x-auto whitespace-pre-wrap break-all">{DB_FIX_SQL}</pre>
              <Button size="sm" variant="outline" className="gap-2 border-amber-400 text-amber-800 hover:bg-amber-100" onClick={handleCopySQL}>
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy SQL'}
              </Button>
            </div>
          )}

          {/* Create Room */}
          <Button
            onClick={() => setShowSizeSelector(true)}
            disabled={isLoading}
            size="lg"
            className="w-full gap-2 h-14 text-lg"
          >
            <Plus className="w-5 h-5" />
            Create New Room
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or join existing</span>
            </div>
          </div>

          {/* Join Room */}
          <form onSubmit={handleJoinRoom} className="space-y-3">
            <div className="bg-card rounded-xl p-4 border border-border">
              <label htmlFor="roomCode" className="block text-sm font-medium text-foreground mb-2">
                Enter Room ID
              </label>
              <div className="flex gap-2">
                <Input
                  id="roomCode"
                  type="text"
                  value={joinCode}
                  onChange={(e) => {
                    setJoinCode(e.target.value.toUpperCase());
                    setError('');
                  }}
                  placeholder="XXXXXXXXXX"
                  className="flex-1 font-mono text-lg tracking-wider"
                  maxLength={10}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowQRScanner(true)}
                  disabled={isLoading}
                  title="Scan QR Code"
                >
                  <QrCode className="w-5 h-5" />
                </Button>
              </div>
              {error && (
                <p className="text-destructive text-sm mt-2">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="secondary"
              size="lg"
              className="w-full gap-2"
              disabled={isLoading || !joinCode.trim()}
            >
              <LogIn className="w-4 h-4" />
              Join Room
            </Button>
          </form>
        </div>

        {/* Room Size Selector Dialog */}
        <Dialog open={showSizeSelector} onOpenChange={setShowSizeSelector}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Select Room Size
              </DialogTitle>
              <DialogDescription>
                Choose the maximum number of users for your room
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-3">
              {ROOM_SIZE_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  className="w-full h-14 justify-between hover:bg-primary/10 hover:border-primary"
                  onClick={() => handleCreateRoom(option.value)}
                  disabled={isLoading}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                  {option.value >= 50 && (
                    <span className="text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-full font-medium">
                      Free
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* QR Scanner Dialog */}
        <Dialog open={showQRScanner} onOpenChange={setShowQRScanner}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Scan QR Code
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              {scannerError ? (
                <div className="text-center space-y-4">
                  <p className="text-destructive text-sm">{scannerError}</p>
                  <Button variant="outline" onClick={() => startScanner()}>
                    Try Again
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div 
                    id="qr-reader" 
                    className="w-full rounded-lg overflow-hidden bg-muted"
                    style={{ minHeight: '280px' }}
                  />
                  <p className="text-center text-sm text-muted-foreground">
                    Point your camera at a room QR code
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}