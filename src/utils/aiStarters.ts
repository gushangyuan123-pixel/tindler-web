import { UserProfile } from '../services/types';
import { getRandomItem } from './helpers';

const STARTER_TEMPLATES = [
  "Ask about their hot take on ",
  "You both seem passionate about ",
  "Their side project sounds interesting — ask about ",
  "Start with what drew you to their profile: ",
  "Common ground: you're both in ",
];

const INTEREST_CONTEXTS = [
  "— it could lead to a great collab!",
  "— maybe you can share insights?",
  "— what's their take?",
  "— sounds like a good conversation starter.",
  "— there's definitely common ground here.",
];

const PROJECT_PROMPTS = [
  "Ask them about their work on ",
  "Their project on ",
  "Curious about their experience with ",
];

export function generateAIStarter(profile: UserProfile): string {
  const template = getRandomItem(STARTER_TEMPLATES);

  // If profile has interests, use them
  if (profile.interests.length > 0) {
    const interest = getRandomItem(profile.interests);
    const context = getRandomItem(INTEREST_CONTEXTS);
    return `${template}${interest}${context}`;
  }

  // If profile has side projects, reference them
  if (profile.sideProjects.length > 0) {
    const project = getRandomItem(profile.sideProjects);
    const prompt = getRandomItem(PROJECT_PROMPTS);
    return `${prompt}"${project}" — sounds fascinating!`;
  }

  // Fallback to company/role
  return `${template}their work at ${profile.company}. What's it like being a ${profile.role} there?`;
}

export function generateConversationStarters(profile: UserProfile): string[] {
  const starters: string[] = [];

  // Starter about company
  starters.push(`What's keeping you busy at ${profile.company}?`);

  // Starter about interests
  if (profile.interests.length > 0) {
    const interest = getRandomItem(profile.interests);
    starters.push(`I'd love to hear more about your interest in ${interest}!`);
  } else {
    starters.push(`What got you interested in ${profile.role}?`);
  }

  // Starter about hot take
  if (profile.hotTake) {
    starters.push(`Your hot take is spicy — tell me more?`);
  } else {
    starters.push(`What's the most exciting thing you're working on?`);
  }

  return starters;
}
