import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { File, Download, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserAvatar } from './UserAvatar';

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

          {fileUrl && isImage && (
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="block mt-2">
              <img
                src={fileUrl}
                alt={fileName || 'Shared image'}
                className="max-w-full max-h-64 rounded-lg object-cover"
              />
            </a>
          )}

          {fileUrl && !isImage && (
            <a
              href={fileUrl}
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
