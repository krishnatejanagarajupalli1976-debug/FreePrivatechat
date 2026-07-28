import { useState } from 'react';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { setDisplayName } from '@/lib/sessionStore';

interface NameInputScreenProps {
  onNameSet: (name: string) => void;
}

export function NameInputScreen({ onNameSet }: NameInputScreenProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter your display name');
      return;
    }
    if (trimmedName.length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    if (trimmedName.length > 20) {
      setError('Name must be 20 characters or less');
      return;
    }

    setDisplayName(trimmedName);
    onNameSet(trimmedName);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background p-4">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-md animate-fade-in">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mb-4 shadow-lg">
              <MessageCircle className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">ChatLink</h1>
            <p className="text-muted-foreground mt-2 text-center">
              Anonymous real-time chat
            </p>
          </div>

          {/* Name Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
              <label htmlFor="displayName" className="block text-sm font-medium text-foreground mb-2">
                Enter your display name
              </label>
              <Input
                id="displayName"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                placeholder="Your name..."
                className="w-full text-lg"
                autoFocus
                maxLength={20}
              />
              {error && (
                <p className="text-destructive text-sm mt-2">{error}</p>
              )}
              <p className="text-muted-foreground text-xs mt-2">
                This name will be shown to other participants
              </p>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full gap-2"
              disabled={!name.trim()}
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="pb-4 pt-6 select-none pointer-events-none">
        <p 
          className="text-xs font-medium"
          style={{ 
            color: '#000000',
            textShadow: '0 0 8px rgba(0, 0, 0, 0.15), 0 0 20px rgba(0, 0, 0, 0.1)'
          }}
        >
          Created by: Nagarajupalli Krishna Teja
        </p>
        <p 
          className="text-xs mt-1"
          style={{ 
            color: '#000000',
            textShadow: '0 0 8px rgba(0, 0, 0, 0.15), 0 0 20px rgba(0, 0, 0, 0.1)'
          }}
        >
          © 2026 Nagarajupalli Krishna Teja. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
