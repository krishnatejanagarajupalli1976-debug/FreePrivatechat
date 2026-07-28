import { useState, useRef, useEffect } from 'react';
import { Send, Plus, Paperclip, Image, Camera, MoreHorizontal, X, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageInputProps {
  onSendMessage: (content: string, type?: 'text' | 'image' | 'file' | 'voice' | 'video') => void;
  onUploadFile?: (file: File) => Promise<string | null>;
  disabled?: boolean;
}

export function MessageInput({ onSendMessage, onUploadFile, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [preview, setPreview] = useState<{ type: 'image' | 'file'; name: string; url?: string; file?: File } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (preview && preview.file && onUploadFile) {
      setIsUploading(true);
      try {
        const fileUrl = await onUploadFile(preview.file);
        if (fileUrl) {
          const isVideo = preview.file.type.startsWith('video/');
          // prefix content with 'video:' so receiver can detect it; send as 'file' type to satisfy DB constraint
          const content = isVideo ? `video:${fileUrl}|${preview.name}` : `${fileUrl}|${preview.name}`;
          onSendMessage(content, 'file');
        }
      } finally {
        setIsUploading(false);
        setPreview(null);
      }
    } else if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      setShowMenu(false);
      setPreview(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview({ type: type === 'image' ? 'image' : 'file', name: file.name, url, file });
    }
    setShowMenu(false);
    // Reset input
    e.target.value = '';
  };

  const clearPreview = () => {
    if (preview?.url) {
      URL.revokeObjectURL(preview.url);
    }
    setPreview(null);
  };

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const menuItems = [
    { icon: MoreHorizontal, label: 'More', action: () => setShowMenu(false) },
    { icon: Camera, label: 'Camera', action: () => cameraInputRef.current?.click() },
    { icon: Image, label: 'Photos', action: () => imageInputRef.current?.click() },
    { icon: Video, label: 'Video', action: () => videoInputRef.current?.click() },
    { icon: Paperclip, label: 'File', action: () => fileInputRef.current?.click() },
  ];

  return (
    <div className="input-bar px-3 py-2 border-t border-border">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => handleFileSelect(e, 'file')}
        accept="*/*"
      />
      <input
        ref={imageInputRef}
        type="file"
        className="hidden"
        onChange={(e) => handleFileSelect(e, 'image')}
        accept="image/*"
      />
      <input
        ref={cameraInputRef}
        type="file"
        className="hidden"
        onChange={(e) => handleFileSelect(e, 'image')}
        accept="image/*"
        capture="environment"
      />
      <input
        ref={videoInputRef}
        type="file"
        className="hidden"
        onChange={(e) => handleFileSelect(e, 'video')}
        accept="video/*"
      />

      {/* Preview */}
      {preview && (
        <div className="max-w-3xl mx-auto mb-2">
          <div className="bg-card rounded-lg border border-border p-3 flex items-center gap-3">
            {preview.type === 'image' && preview.url ? (
              <img src={preview.url} alt="Preview" className="w-16 h-16 object-cover rounded" />
            ) : preview.file?.type.startsWith('video/') && preview.url ? (
              <video src={preview.url} className="w-16 h-16 object-cover rounded" />
            ) : (
              <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                <Paperclip className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            <span className="flex-1 text-sm truncate">{preview.name}</span>
            <Button variant="ghost" size="icon" onClick={clearPreview}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex items-end gap-2">
        {/* Plus Menu */}
        <div className="relative" ref={menuRef}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 rounded-full hover:bg-muted"
            onClick={() => setShowMenu(!showMenu)}
          >
            {showMenu ? (
              <X className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Plus className="w-5 h-5 text-muted-foreground" />
            )}
          </Button>

          {/* Vertical Menu */}
          {showMenu && (
            <div className="absolute bottom-12 left-0 bg-card rounded-lg shadow-xl border border-border py-1 animate-slide-up z-50">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    item.action();
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <item.icon className="w-5 h-5 text-primary" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Text Input */}
        <div className="flex-1 bg-card rounded-2xl border border-border overflow-hidden">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={preview ? "Add a caption..." : "Type a message..."}
            disabled={disabled}
            rows={1}
            className="w-full px-4 py-2.5 text-[15px] bg-transparent resize-none outline-none placeholder:text-muted-foreground disabled:opacity-50"
            style={{ maxHeight: '120px' }}
          />
        </div>

        {/* Send Button */}
        <Button
          type="submit"
          size="icon"
          className="shrink-0 rounded-full w-10 h-10"
          disabled={(!message.trim() && !preview) || disabled || isUploading}
        >
          {isUploading ? (
            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </form>
    </div>
  );
}