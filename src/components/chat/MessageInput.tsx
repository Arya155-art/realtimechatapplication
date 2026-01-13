import { useState, useRef } from 'react';
import { Send, Paperclip, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// File validation constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'image/png', 'image/jpeg', 'image/gif', 'image/webp',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/zip'
];
const MESSAGE_COOLDOWN = 1000; // 1 second between messages

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  onSendFile: (file: File) => Promise<void>;
  disabled?: boolean;
}

export function MessageInput({ onSendMessage, onSendFile, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastSentRef = useRef<number>(0);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!message.trim() && !selectedFile) || sending) return;

    // Client-side rate limiting
    const now = Date.now();
    if (now - lastSentRef.current < MESSAGE_COOLDOWN) {
      toast({
        title: 'Slow down!',
        description: 'Please wait before sending another message',
        variant: 'destructive'
      });
      return;
    }
    lastSentRef.current = now;

    setSending(true);
    try {
      if (selectedFile) {
        await onSendFile(selectedFile);
        setSelectedFile(null);
      }
      if (message.trim()) {
        await onSendMessage(message.trim());
        setMessage('');
      }
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 10MB',
        variant: 'destructive'
      });
      e.target.value = '';
      return;
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Only images, PDFs, Word documents, text files, and ZIP archives are allowed',
        variant: 'destructive'
      });
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-card/50">
      <AnimatePresence>
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-2"
          >
            <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary">
              <Paperclip className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground flex-1 truncate">
                {selectedFile.name}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setSelectedFile(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt,.zip"
        />
        
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || sending}
          className="text-muted-foreground hover:text-foreground"
        >
          <Paperclip className="w-5 h-5" />
        </Button>

        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={disabled || sending}
          className="flex-1 bg-secondary border-0 focus-visible:ring-1 focus-visible:ring-primary"
        />

        <Button
          type="submit"
          size="icon"
          disabled={(!message.trim() && !selectedFile) || disabled || sending}
          className={cn(
            'bg-primary text-primary-foreground hover:bg-primary/90',
            'disabled:opacity-50'
          )}
        >
          {sending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>
    </form>
  );
}
