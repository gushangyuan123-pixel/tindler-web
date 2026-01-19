import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, Coffee, Loader, Clock } from 'lucide-react';
import { useBC } from '../../context/BCContext';
import { BCMessage, BCMatch } from '../../services/types';
import bcApiService from '../../services/bcApi';

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

interface ChatBubbleProps {
  message: BCMessage;
  isCurrentUser: boolean;
}

function ChatBubble({ message, isCurrentUser }: ChatBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[80%] p-3 border-2 border-black ${
          isCurrentUser
            ? 'bg-cyan-500 text-black'
            : 'bg-white text-black'
        }`}
      >
        <p className="font-mono text-sm">{message.content}</p>
        <p className={`text-xs mt-1 ${isCurrentUser ? 'text-black/60' : 'text-medium-gray'}`}>
          {formatTime(message.createdAt)}
        </p>
      </div>
    </motion.div>
  );
}

export function BCChat() {
  const navigate = useNavigate();
  const { matchId } = useParams<{ matchId: string }>();
  const {
    userType,
    isApplicant,
    applicantMatch,
    memberMatches,
    currentProfile,
    addMessage,
    isAuthenticated,
  } = useBC();

  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Find the match
  const match: BCMatch | null = isApplicant
    ? applicantMatch
    : memberMatches.find((m) => m.id === matchId) || null;

  // Redirect if no match found
  useEffect(() => {
    if (!userType) {
      navigate('/bc');
      return;
    }
    if (!match) {
      if (isApplicant) {
        navigate('/bc/discover');
      } else {
        navigate('/bc/matches');
      }
    }
  }, [userType, match, isApplicant, navigate]);

  // Load messages from API if authenticated
  useEffect(() => {
    if (isAuthenticated && match && matchId) {
      setIsLoadingMessages(true);
      bcApiService.getMessages(parseInt(matchId))
        .then((messages) => {
          // Messages are loaded into match from API
          // The context should update accordingly
        })
        .catch((error) => {
          console.error('Failed to load messages:', error);
        })
        .finally(() => {
          setIsLoadingMessages(false);
        });
    }
  }, [isAuthenticated, match, matchId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [match?.messages]);

  if (!match || !currentProfile) return null;

  const otherPerson = isApplicant ? match.bcMember : match.applicant;
  const isPendingMatch = (match as any).status === 'pending';

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSending) return;

    // Don't allow messaging for pending matches (need admin confirmation)
    if (isPendingMatch && isAuthenticated) {
      return;
    }

    setIsSending(true);

    try {
      if (isAuthenticated) {
        // Send via API
        const result = await bcApiService.sendMessage(parseInt(match.id), inputValue.trim());

        const newMessage: BCMessage = {
          id: String(result.id),
          matchId: match.id,
          senderId: currentProfile.id,
          content: result.content,
          createdAt: new Date(result.created_at),
          isFromCurrentUser: true,
        };

        addMessage(match.id, newMessage);
      } else {
        // Demo mode - use local state
        const newMessage: BCMessage = {
          id: `msg-${Date.now()}`,
          matchId: match.id,
          senderId: currentProfile.id,
          content: inputValue.trim(),
          createdAt: new Date(),
          isFromCurrentUser: true,
        };

        addMessage(match.id, newMessage);

        // Simulate reply after a short delay (demo mode only)
        setTimeout(() => {
          const replies = [
            "Thanks for reaching out! I'd love to chat more about BC.",
            "Great question! Let me share my experience...",
            "That's a great point. When I was recruiting...",
            "I'm free next week if you want to schedule a call!",
            "Absolutely! BC has been an amazing experience.",
          ];

          const replyMessage: BCMessage = {
            id: `msg-${Date.now()}-reply`,
            matchId: match.id,
            senderId: otherPerson.id,
            content: replies[Math.floor(Math.random() * replies.length)],
            createdAt: new Date(),
            isFromCurrentUser: false,
          };

          addMessage(match.id, replyMessage);
        }, 1500 + Math.random() * 2000);
      }

      setInputValue('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-gray flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-dark-gray border-b-3 border-black">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(isApplicant ? '/bc/match' : '/bc/matches')}
            className="p-2 hover:bg-medium-gray/20 rounded"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>

          <div className="flex items-center gap-3 flex-1">
            <div className="relative">
              <div className="w-10 h-10 border-2 border-black overflow-hidden">
                <img
                  src={otherPerson.photoUrl}
                  alt={otherPerson.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-cyan-500 border border-black
                              flex items-center justify-center">
                <Coffee className="w-2 h-2" />
              </div>
            </div>
            <div>
              <h2 className="text-white font-bold">{otherPerson.name}</h2>
              <span className="text-xs font-mono text-cyan-500">
                {isApplicant ? 'BC MEMBER' : 'APPLICANT'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Status Banner */}
      {isPendingMatch && isAuthenticated && (
        <div className="bg-yellow-500/10 border-b-2 border-yellow-500 px-4 py-3">
          <div className="flex items-center gap-2 text-yellow-500">
            <Clock className="w-4 h-4" />
            <span className="font-mono text-sm">
              Waiting for admin to confirm this coffee chat. Messaging will be enabled once confirmed.
            </span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {/* Loading indicator */}
        {isLoadingMessages && (
          <div className="flex justify-center py-4">
            <Loader className="w-6 h-6 animate-spin text-cyan-500" />
          </div>
        )}

        {/* Intro message */}
        {!isLoadingMessages && match.messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-cyan-500 border-3 border-black mx-auto mb-4
                           flex items-center justify-center">
              <Coffee className="w-8 h-8" />
            </div>
            <h3 className="text-white font-bold mb-2">Coffee Chat Connected!</h3>
            <p className="text-medium-gray font-mono text-sm max-w-xs mx-auto">
              {isApplicant
                ? `You matched with ${otherPerson.name}. Send a message to introduce yourself!`
                : `You accepted ${otherPerson.name}'s coffee chat request. Say hello!`}
            </p>
          </div>
        )}

        {/* Message list */}
        {match.messages.map((message) => (
          <ChatBubble
            key={message.id}
            message={message}
            isCurrentUser={message.isFromCurrentUser}
          />
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="sticky bottom-0 bg-dark-gray border-t-3 border-black p-4"
      >
        {isPendingMatch && isAuthenticated ? (
          <div className="text-center text-medium-gray font-mono text-sm py-2">
            Messaging disabled until admin confirms the match
          </div>
        ) : (
          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              disabled={isSending}
              className="flex-1 px-4 py-3 bg-white border-3 border-black font-mono
                         focus:outline-none focus:ring-2 focus:ring-cyan-500
                         disabled:bg-gray-200 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isSending}
              className={`px-4 py-3 border-3 border-black flex items-center justify-center
                         transition-all ${
                           inputValue.trim() && !isSending
                             ? 'bg-cyan-500 text-black shadow-brutalist hover:shadow-none hover:translate-x-1 hover:translate-y-1'
                             : 'bg-medium-gray text-dark-gray cursor-not-allowed'
                         }`}
            >
              {isSending ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
