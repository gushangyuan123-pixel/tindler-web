import React from 'react';
import { Message } from '../services/types';
import { formatTime } from '../utils/helpers';

interface ChatBubbleProps {
  message: Message;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isFromUser = message.isFromCurrentUser;

  return (
    <div className={`flex ${isFromUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[80%] ${isFromUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`
            px-4 py-2.5 rounded-2xl
            ${isFromUser
              ? 'bg-acid-yellow text-black rounded-br-sm'
              : 'bg-medium-gray text-white rounded-bl-sm'
            }
          `}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
        <span className="text-[10px] font-mono text-medium-gray mt-1 px-1">
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
}

interface ConversationStarterProps {
  starter: string;
  onClick: () => void;
}

export function ConversationStarter({ starter, onClick }: ConversationStarterProps) {
  return (
    <button
      onClick={onClick}
      className="
        w-full text-left px-4 py-3
        bg-dark-gray border border-medium-gray/50 rounded-lg
        text-sm text-light-gray
        hover:border-acid-yellow hover:text-white
        transition-colors
      "
    >
      {starter}
    </button>
  );
}
