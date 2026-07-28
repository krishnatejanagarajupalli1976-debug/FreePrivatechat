import { useState } from 'react';
import { Copy, QrCode, MoreVertical, Moon, Sun, LogOut, Users, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QRCodeSVG } from 'qrcode.react';
import { Participant } from '@/hooks/useChat';

interface ChatHeaderProps {
  roomCode: string;
  participants: Participant[];
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onLeaveRoom: () => void;
}

export function ChatHeader({
  roomCode,
  participants,
  isDarkMode,
  onToggleDarkMode,
  onLeaveRoom,
}: ChatHeaderProps) {
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const joinUrl = `${window.location.origin}?room=${roomCode}`;

  return (
    <>
      <header className="chat-header px-4 py-3 flex items-center justify-between shadow-md z-10">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold tracking-wider text-lg">
                {roomCode}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-header-foreground/80 hover:text-header-foreground hover:bg-header-foreground/10"
                onClick={handleCopyCode}
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-header-foreground/80 hover:text-header-foreground hover:bg-header-foreground/10"
                onClick={() => setShowQR(true)}
              >
                <QrCode className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-1 text-sm text-header-foreground/70">
              <Users className="w-3 h-3" />
              <span>{participants.length} online</span>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-header-foreground/80 hover:text-header-foreground hover:bg-header-foreground/10"
            >
              <MoreVertical className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onToggleDarkMode}>
              {isDarkMode ? (
                <>
                  <Sun className="w-4 h-4 mr-2" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 mr-2" />
                  Night Mode
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLeaveRoom} className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Exit Chat
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* QR Code Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">Scan to Join</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            <div className="bg-white p-4 rounded-xl">
              <QRCodeSVG value={joinUrl} size={200} level="H" />
            </div>
            <p className="text-muted-foreground text-sm mt-4 text-center">
              Scan this QR code or share the Room ID
            </p>
            <p className="font-mono font-bold text-xl mt-2">{roomCode}</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
