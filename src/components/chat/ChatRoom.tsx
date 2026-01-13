import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ChatHeader } from './ChatHeader';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { UsersList } from './UsersList';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  user_id: string;
  content: string | null;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  created_at: string;
}

interface Profile {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  status: string | null;
  last_seen: string | null;
}

export function ChatRoom() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [showUsers, setShowUsers] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      // Fetch messages
      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100);

      if (messagesData) {
        setMessages(messagesData);
      }

      // Fetch profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*');

      if (profilesData) {
        setProfiles(profilesData);
      }
    };

    fetchData();
  }, []);

  // Subscribe to realtime updates
  useEffect(() => {
    const messagesChannel = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'messages' },
        (payload) => {
          setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
        }
      )
      .subscribe();

    const profilesChannel = supabase
      .channel('profiles-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setProfiles((prev) => [...prev, payload.new as Profile]);
          } else if (payload.eventType === 'UPDATE') {
            setProfiles((prev) =>
              prev.map((p) => (p.id === payload.new.id ? (payload.new as Profile) : p))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(profilesChannel);
    };
  }, []);

  // Scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update user status periodically
  useEffect(() => {
    if (!user) return;

    const updateStatus = async () => {
      await supabase
        .from('profiles')
        .update({ status: 'online', last_seen: new Date().toISOString() })
        .eq('user_id', user.id);
    };

    updateStatus();
    const interval = setInterval(updateStatus, 30000);

    const handleBeforeUnload = () => {
      supabase
        .from('profiles')
        .update({ status: 'offline', last_seen: new Date().toISOString() })
        .eq('user_id', user.id);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user]);

  const handleSendMessage = async (content: string) => {
    if (!user) return;

    const { error } = await supabase.from('messages').insert({
      user_id: user.id,
      content
    });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
    }
  };

  const handleSendFile = async (file: File) => {
    if (!user) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError, data } = await supabase.storage
      .from('chat-files')
      .upload(fileName, file);

    if (uploadError) {
      toast({
        title: 'Error',
        description: 'Failed to upload file',
        variant: 'destructive'
      });
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('chat-files')
      .getPublicUrl(fileName);

    const { error: messageError } = await supabase.from('messages').insert({
      user_id: user.id,
      file_url: publicUrl,
      file_name: file.name,
      file_type: file.type
    });

    if (messageError) {
      toast({
        title: 'Error',
        description: 'Failed to send file',
        variant: 'destructive'
      });
    }
  };

  const getProfileForUser = (userId: string) => {
    return profiles.find((p) => p.user_id === userId) || {
      username: 'Unknown',
      avatar_url: null,
      status: 'offline'
    };
  };

  const shouldShowAvatar = (message: Message, index: number) => {
    if (index === 0) return true;
    const prevMessage = messages[index - 1];
    return prevMessage.user_id !== message.user_id;
  };

  const onlineCount = profiles.filter((p) => p.status === 'online').length;

  return (
    <div className="h-screen flex bg-background">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatHeader 
          showUsers={showUsers} 
          onToggleUsers={() => setShowUsers(!showUsers)}
          onlineCount={onlineCount}
        />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto scrollbar-thin py-4">
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              content={message.content}
              fileUrl={message.file_url}
              fileName={message.file_name}
              fileType={message.file_type}
              createdAt={message.created_at}
              isOwn={message.user_id === user?.id}
              profile={getProfileForUser(message.user_id)}
              showAvatar={shouldShowAvatar(message, index)}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        <MessageInput
          onSendMessage={handleSendMessage}
          onSendFile={handleSendFile}
        />
      </div>

      {/* Users Sidebar - Desktop */}
      <div className="hidden lg:block w-64 border-l border-border bg-sidebar">
        <UsersList profiles={profiles} currentUserId={user?.id || ''} />
      </div>

      {/* Users Sidebar - Mobile Overlay */}
      <AnimatePresence>
        {showUsers && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm lg:hidden z-40"
              onClick={() => setShowUsers(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-72 bg-sidebar border-l border-border lg:hidden z-50"
            >
              <UsersList profiles={profiles} currentUserId={user?.id || ''} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
