import { motion } from 'framer-motion';
import { UserAvatar } from './UserAvatar';
import { formatDistanceToNow } from 'date-fns';

interface Profile {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  status: string | null;
  last_seen: string | null;
}

interface UsersListProps {
  profiles: Profile[];
  currentUserId: string;
}

export function UsersList({ profiles, currentUserId }: UsersListProps) {
  const sortedProfiles = [...profiles].sort((a, b) => {
    if (a.user_id === currentUserId) return -1;
    if (b.user_id === currentUserId) return 1;
    const statusOrder = { online: 0, away: 1, busy: 2, offline: 3 };
    return (statusOrder[a.status as keyof typeof statusOrder] || 3) - 
           (statusOrder[b.status as keyof typeof statusOrder] || 3);
  });

  const onlineCount = profiles.filter(p => p.status === 'online').length;

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-foreground">Users</h2>
        <p className="text-xs text-muted-foreground">{onlineCount} online</p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
        {sortedProfiles.map((profile, index) => (
          <motion.div
            key={profile.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
          >
            <UserAvatar
              username={profile.username}
              avatarUrl={profile.avatar_url}
              status={(profile.status as 'online' | 'offline' | 'away' | 'busy') || 'offline'}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {profile.username}
                {profile.user_id === currentUserId && (
                  <span className="text-xs text-primary ml-1">(you)</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {profile.status === 'online' 
                  ? 'Online' 
                  : profile.last_seen 
                    ? `Last seen ${formatDistanceToNow(new Date(profile.last_seen), { addSuffix: true })}`
                    : 'Offline'
                }
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
