import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { File, Download, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserAvatar } from './UserAvatar';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  username: string;
  avatar_url: string | null;
  status: string | null;
}

interface MessageBubbleProps {
  content: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  fileType?: string | null;
  createdAt: string;
  isOwn: boolean;
  profile: Profile;
  showAvatar?: boolean;
}

export function MessageBubble({
  content,
  fileUrl,
  fileName,
  fileType,
  createdAt,
  isOwn,
  profile,
  showAvatar = true
}: MessageBubbleProps) {
  const isImage = fileType?.startsWith('image/');
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch signed URL for private files
  useEffect(() => {
    if (!fileUrl) return;

    const fetchSignedUrl = async () => {
      setIsLoading(true);
      try {
        // Check if it's already a full URL (legacy public URLs)
        if (fileUrl.startsWith('http')) {
          setSignedUrl(fileUrl);
        } else {
          // Generate a signed URL with 1 hour expiry
          const { data, error } = await supabase.storage
            .from('chat-files')
            .createSignedUrl(fileUrl, 3600);

          if (error) {
            console.error('Error creating signed URL:', error);
            return;
          }

          if (data?.signedUrl) {
            setSignedUrl(data.signedUrl);
          }
        }
      } catch (error) {
        console.error('Error fetching signed URL:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSignedUrl();
  }, [fileUrl]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex gap-3 px-4 py-1',
        isOwn ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {showAvatar ? (
        <UserAvatar
          username={profile.username}
          avatarUrl={profile.avatar_url}
          status={(profile.status as 'online' | 'offline' | 'away' | 'busy') || 'offline'}
          size="sm"
          showStatus={false}
        />
      ) : (
        <div className="w-8" />
      )}

      <div className={cn('max-w-[70%] flex flex-col', isOwn ? 'items-end' : 'items-start')}>
        {showAvatar && (
          <span className="text-xs text-muted-foreground mb-1 px-1">
            {profile.username}
          </span>
        )}

        <div
          className={cn(
            'rounded-2xl px-4 py-2',
            isOwn ? 'chat-bubble-own rounded-tr-sm' : 'chat-bubble-other rounded-tl-sm'
          )}
        >
          {content && (
            <p className="text-sm text-foreground whitespace-pre-wrap break-words">
              {content}
            </p>
          )}

          {fileUrl && isLoading && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}

          {fileUrl && !isLoading && signedUrl && isImage && (
            <a href={signedUrl} target="_blank" rel="noopener noreferrer" className="block mt-2">
              <img
                src={signedUrl}
                alt={fileName || 'Shared image'}
                className="max-w-full max-h-64 rounded-lg object-cover"
              />
            </a>
          )}

          {fileUrl && !isLoading && signedUrl && !isImage && (
            <a
              href={signedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-background/20 hover:bg-background/30 transition-colors"
            >
              <File className="w-4 h-4 text-primary" />
              <span className="text-sm truncate flex-1">{fileName}</span>
              <Download className="w-4 h-4 text-muted-foreground" />
            </a>
          )}
        </div>

        <span className="text-[10px] text-muted-foreground mt-1 px-1">
          {format(new Date(createdAt), 'HH:mm')}
        </span>
      </div>
    </motion.div>
  );
}
