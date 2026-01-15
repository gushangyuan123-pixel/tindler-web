import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, MoreVertical, Send, User } from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';
import { ChatBubble, ConversationStarter } from '../components/ChatBubble';
import { Match, Message, apiMessageToMessage } from '../services/types';
import { generateConversationStarters } from '../utils/aiStarters';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';

export function Chat() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const match = location.state?.match as Match | undefined;
  const { updateMatchMessage } = useApp();

  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const conversationStarters = match
    ? generateConversationStarters(match.profile)
    : [];

  useEffect(() => {
    // Load messages from API
    const loadMessages = async () => {
      if (!matchId) return;

      try {
        const response = await apiService.getMessages(parseInt(matchId));
        if (response.success && response.messages) {
          setMessages(response.messages.map(apiMessageToMessage));
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
        // Fall back to localStorage if API fails
        const savedMessages = localStorage.getItem(`chat_messages_${matchId}`);
        if (savedMessages) {
          try {
            const parsed = JSON.parse(savedMessages);
            setMessages(parsed.map((m: any) => ({
              ...m,
              createdAt: new Date(m.createdAt),
            })));
          } catch (e) {
            console.error('Failed to parse saved messages:', e);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [matchId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Save messages to localStorage as backup
  useEffect(() => {
    if (matchId && messages.length > 0) {
      localStorage.setItem(`chat_messages_${matchId}`, JSON.stringify(messages));
    }
  }, [matchId, messages]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    if (!matchId) return;

    const pollMessages = async () => {
      try {
        const response = await apiService.getMessages(parseInt(matchId));
        if (response.success && response.messages) {
          const newMessages = response.messages.map(apiMessageToMessage);
          // Only update if we have new messages
          if (newMessages.length > messages.length) {
            setMessages(newMessages);
          }
        }
      } catch (error) {
        // Silently fail on poll errors
      }
    };

    const interval = setInterval(pollMessages, 5000);
    return () => clearInterval(interval);
  }, [matchId, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!messageText.trim() || !matchId || isSending) return;

    const text = messageText.trim();
    setMessageText('');
    setIsSending(true);

    // Optimistically add the message to UI
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      matchId: parseInt(matchId),
      senderId: 'current-user',
      content: text,
      createdAt: new Date(),
      isFromCurrentUser: true,
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      // Send to API
      const response = await apiService.sendMessage(parseInt(matchId), text);

      if (response.success && response.message) {
        // Replace temp message with real one from server
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempMessage.id ? apiMessageToMessage(response.message) : m
          )
        );
      }

      // Update match's last message in app state
      updateMatchMessage(match?.id || '', text);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Keep the message in UI but could show error state
    } finally {
      setIsSending(false);
    }
  };

  const handleStarterClick = (starter: string) => {
    setMessageText(starter);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!match) {
    return (
      <div className="min-h-screen bg-dark-gray flex items-center justify-center">
        <p className="text-medium-gray">Match not found</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-dark-gray flex flex-col safe-top">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-medium-gray/30">
        <button
          onClick={() => navigate('/matches')}
          className="p-1 text-light-gray hover:text-white"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={() => setShowProfile(true)}
          className="flex items-center gap-3 flex-1"
        >
          <Avatar
            src={match.profile.photoUrl}
            alt={match.profile.name}
            size="sm"
          />
          <div className="text-left">
            <h2 className="font-bold text-white">{match.profile.name}</h2>
            <p className="text-[10px] font-mono text-medium-gray">
              {match.profile.company}
            </p>
          </div>
        </button>

        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 text-light-gray hover:text-white relative"
        >
          <MoreVertical size={20} />

          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-40 bg-medium-gray rounded-lg shadow-lg overflow-hidden z-10">
              <button
                onClick={() => {
                  setShowProfile(true);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/10"
              >
                View Profile
              </button>
              <button className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/10">
                Unmatch
              </button>
              <button className="w-full px-4 py-3 text-left text-sm text-hot-pink hover:bg-white/10">
                Report
              </button>
            </div>
          )}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Match intro card */}
        {messages.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="bg-medium-gray/30 rounded-lg p-6 text-center mb-6">
              <Avatar
                src={match.profile.photoUrl}
                alt={match.profile.name}
                size="xl"
                className="mx-auto mb-4"
              />
              <h3 className="font-bold text-white mb-1">
                You matched with {match.profile.name}!
              </h3>
              <p className="text-xs font-mono text-medium-gray">
                {match.profile.role} @ {match.profile.company}
              </p>
            </div>

            {/* Conversation starters */}
            <div className="space-y-3">
              <p className="text-xs font-mono text-acid-yellow uppercase tracking-wider">
                Conversation Starters
              </p>
              {conversationStarters.map((starter, index) => (
                <ConversationStarter
                  key={index}
                  starter={starter}
                  onClick={() => handleStarterClick(starter)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-acid-yellow border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Messages list */}
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-medium-gray/30 safe-bottom">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-medium-gray/30 rounded-full text-white placeholder:text-medium-gray focus:outline-none focus:ring-2 focus:ring-acid-yellow"
          />
          <button
            onClick={handleSend}
            disabled={!messageText.trim() || isSending}
            className={`
              w-11 h-11 rounded-full flex items-center justify-center transition-colors
              ${messageText.trim()
                ? 'bg-acid-yellow text-black'
                : 'bg-medium-gray/30 text-medium-gray'
              }
            `}
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      {/* Profile detail sheet */}
      {showProfile && (
        <ProfileDetailSheet
          profile={match.profile}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
}

interface ProfileDetailSheetProps {
  profile: Match['profile'];
  onClose: () => void;
}

function ProfileDetailSheet({ profile, onClose }: ProfileDetailSheetProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        className="absolute bottom-0 left-0 right-0 bg-dark-gray rounded-t-2xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Profile photo */}
        <div className="h-[300px] bg-medium-gray relative">
          {profile.photoUrl ? (
            <img
              src={profile.photoUrl}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User size={80} className="text-light-gray/30" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-dark-gray to-transparent" />
        </div>

        <div className="p-6 -mt-8 relative">
          <h2 className="text-2xl font-black text-white mb-1">{profile.name}</h2>
          <p className="text-xs font-mono text-medium-gray mb-6">
            {profile.role} @ {profile.company}
          </p>

          {/* About */}
          <div className="mb-6">
            <h3 className="text-xs font-mono text-acid-yellow uppercase tracking-wider mb-3">
              About
            </h3>
            <p className="text-sm text-light-gray">{profile.bio}</p>
          </div>

          {/* Hot take */}
          {profile.hotTake && (
            <div className="mb-6">
              <h3 className="text-xs font-mono text-acid-yellow uppercase tracking-wider mb-3">
                Hot Take
              </h3>
              <div className="flex gap-2">
                <div className="w-1 bg-acid-yellow rounded-full flex-shrink-0" />
                <p className="text-sm text-white italic">"{profile.hotTake}"</p>
              </div>
            </div>
          )}

          {/* Side projects */}
          {profile.sideProjects.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-mono text-acid-yellow uppercase tracking-wider mb-3">
                Side Projects
              </h3>
              <ul className="space-y-2">
                {profile.sideProjects.map((project, index) => (
                  <li key={index} className="text-sm text-light-gray">
                    {project}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Interests */}
          {profile.interests.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-mono text-acid-yellow uppercase tracking-wider mb-3">
                Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-3 py-1.5 bg-acid-yellow text-black text-xs font-mono rounded-full"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
