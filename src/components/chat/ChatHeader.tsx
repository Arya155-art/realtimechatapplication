import { LogOut, Users, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';

interface ChatHeaderProps {
  showUsers: boolean;
  onToggleUsers: () => void;
  onlineCount: number;
}

export function ChatHeader({ showUsers, onToggleUsers, onlineCount }: ChatHeaderProps) {
  const { signOut } = useAuth();

  return (
    <motion.header 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-16 px-4 flex items-center justify-between border-b border-border glass"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary/20">
          <MessageCircle className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="font-semibold text-foreground">ChatRoom</h1>
          <p className="text-xs text-muted-foreground">{onlineCount} online</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleUsers}
          className="lg:hidden"
        >
          <Users className="w-5 h-5" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={signOut}
          className="text-muted-foreground hover:text-destructive"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
    </motion.header>
  );
}
