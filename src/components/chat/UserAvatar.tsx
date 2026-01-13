import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StatusIndicator } from './StatusIndicator';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  username: string;
  avatarUrl?: string | null;
  status?: 'online' | 'offline' | 'away' | 'busy';
  showStatus?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function UserAvatar({ 
  username, 
  avatarUrl, 
  status = 'offline', 
  showStatus = true,
  size = 'md',
  className 
}: UserAvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className={cn('relative', className)}>
      <Avatar className={cn(sizeClasses[size], 'border-2 border-border')}>
        <AvatarImage src={avatarUrl || undefined} alt={username} />
        <AvatarFallback className="bg-primary/20 text-primary font-medium">
          {getInitials(username)}
        </AvatarFallback>
      </Avatar>
      {showStatus && (
        <StatusIndicator 
          status={status} 
          size="sm"
          className="absolute -bottom-0.5 -right-0.5"
        />
      )}
    </div>
  );
}
