import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { WorkoutItem, gymWorkouts, homeWorkouts, getPicksForDay } from '../lib/workoutLibrary';
import './ChatBot.css';

interface ChatMessage {
  from: 'user' | 'bot';
  text: string;
}

interface ChatBotProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideFab?: boolean;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const getClientName = (): string => {
  const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
  return profile.name || profile.firstName || '';
};

const buildGreeting = (): string => {
  const name = getClientName();
  const greetName = name ? `Hey ${name}` : 'Hey there';
  return `${greetName}, good to see you again! I can generate a personalized workout plan for you in just a few seconds. Simply tap the option below that matches what you're looking for, and I'll take care of the rest.`;
};

const FALLBACK_REPLY =
  "I'm not quite sure what you mean by that. To help you faster and more accurately, try tapping one of the options below instead — Today, Tomorrow, This Week, or This Month.";

const ChatBot: React.FC<ChatBotProps> = ({ isOpen: controlledOpen, onOpenChange, hideFab }) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setIsOpen = (value: boolean) => {
    if (onOpenChange) onOpenChange(value);
    if (controlledOpen === undefined) setUncontrolledOpen(value);
  };
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { from: 'bot', text: buildGreeting() },
  ]);

  const getUserInfo = (): { userGoal: string; userConditions: string[]; userCategory: string } => {
    const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    const medicalHistory = JSON.parse(localStorage.getItem('medicalHistory') || '{}');
    const userGoal: string = profile.goal || 'Fitness';
    const userConditions: string[] = medicalHistory.conditions || [];
    const userCategory: string = profile.category || '';
    return { userGoal, userConditions, userCategory };
  };

  const getDayLabel = (dayOffset: number): string => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + dayOffset);
    const dayIndex = targetDate.getDay();
    return dayOffset === 0 ? 'Today' : dayOffset === 1 ? 'Tomorrow' : DAY_NAMES[dayIndex];
  };

  const formatPicks = (picks: WorkoutItem[]): string =>
    picks.map((w) => w.name + ' (' + w.meta + ')').join(', ');

  const buildDaySection = (
    dayOffset: number,
    userGoal: string,
    userConditions: string[],
    userCategory: string
  ): string => {
    const label = getDayLabel(dayOffset);
    const gym = getPicksForDay(gymWorkouts, dayOffset, userGoal, userConditions, userCategory);
    const home = getPicksForDay(homeWorkouts, dayOffset, userGoal, userConditions, userCategory);

    if (gym.isRest && home.isRest) {
      return label + ': Rest Day';
    }

    let section = label + ':\n';
    section += '  Gym: ' + (gym.isRest ? 'Rest Day' : formatPicks(gym.picks)) + '\n';
    section += '  Home: ' + (home.isRest ? 'Rest Day' : formatPicks(home.picks));
    return section;
  };

  const getTodayReply = (): string => {
    const { userGoal, userConditions, userCategory } = getUserInfo();
    const gym = getPicksForDay(gymWorkouts, 0, userGoal, userConditions, userCategory);
    const home = getPicksForDay(homeWorkouts, 0, userGoal, userConditions, userCategory);

    if (gym.isRest && home.isRest) {
      return 'Rest Day today. Take time to recover.';
    }

    let reply = 'Based on your goal (' + userGoal + '), here is your suggested workout for today:\n\n';
    reply += 'GYM:\n';
    reply += gym.isRest ? '- Rest Day\n' : gym.picks.map((w, i) => (i + 1) + '. ' + w.name + ' - ' + w.meta + ' (' + w.target + ')').join('\n') + '\n';
    reply += '\nHOME:\n';
    reply += home.isRest ? '- Rest Day' : home.picks.map((w, i) => (i + 1) + '. ' + w.name + ' - ' + w.meta + ' (' + w.target + ')').join('\n');

    if (userConditions.length > 0 || userCategory) {
      reply += '\n\nNote: Exercises unsuitable for your medical condition(s) and/or BMI category have been excluded for your safety.';
    }
    return reply;
  };

  const getTomorrowReply = (): string => {
    const { userGoal, userConditions, userCategory } = getUserInfo();
    const label = getDayLabel(1);
    const gym = getPicksForDay(gymWorkouts, 1, userGoal, userConditions, userCategory);
    const home = getPicksForDay(homeWorkouts, 1, userGoal, userConditions, userCategory);

    if (gym.isRest && home.isRest) {
      return label + ': Rest Day. Rest up for the next day.';
    }

    let reply = 'Here is your plan for ' + label.toLowerCase() + ':\n\n';
    reply += 'GYM:\n';
    reply += gym.isRest ? '- Rest Day\n' : gym.picks.map((w, i) => (i + 1) + '. ' + w.name + ' - ' + w.meta + ' (' + w.target + ')').join('\n') + '\n';
    reply += '\nHOME:\n';
    reply += home.isRest ? '- Rest Day' : home.picks.map((w, i) => (i + 1) + '. ' + w.name + ' - ' + w.meta + ' (' + w.target + ')').join('\n');
    return reply;
  };

  const getWeekReply = (): string => {
    const { userGoal, userConditions, userCategory } = getUserInfo();
    let reply = 'Here is your 7-day workout plan (Gym / Home):\n\n';
    for (let i = 0; i < 7; i++) {
      reply += buildDaySection(i, userGoal, userConditions, userCategory) + '\n\n';
    }
    return reply.trim();
  };

  const getMonthReply = (): string => {
    const { userGoal, userConditions, userCategory } = getUserInfo();
    let reply = '1-Month Plan (goal: ' + userGoal + '):\n\n';
    reply += 'Week 1:\n\n';
    for (let i = 0; i < 7; i++) {
      reply += buildDaySection(i, userGoal, userConditions, userCategory) + '\n\n';
    }
    reply += 'Weeks 2–4 will rotate through a wider variety automatically as the dates progress — check back each week for updated picks.\n';
    reply += 'Tip: Each week, try adding a bit more reps/sets or time (progressive overload) for continued improvement.';
    return reply.trim();
  };

  const generateReply = (userText: string): string => {
    const text = userText.toLowerCase();

    if (text.includes('month')) {
      return getMonthReply();
    }
    if (text.includes('week')) {
      return getWeekReply();
    }
    if (text.includes('tomorrow')) {
      return getTomorrowReply();
    }
    if (text.includes('today') || text.includes('my workout') || text.includes('workout')) {
      return getTodayReply();
    }

    return FALLBACK_REPLY;
  };

  const handleSend = (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const userMsg: ChatMessage = { from: 'user', text: messageText };
    const botMsg: ChatMessage = { from: 'bot', text: generateReply(messageText) };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput('');
  };

  return (
    <>
      {!hideFab && (
        <button className="cb-fab" onClick={() => setIsOpen(!isOpen)} aria-label="Open chat">
          {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        </button>
      )}

      {isOpen && (
        <div className="cb-window">
          <div className="cb-header">
            <span>AI Fitness Assistant</span>
          </div>

          <div className="cb-messages">
            {messages.map((msg, i) => (
              <div key={i} className={'cb-msg ' + (msg.from === 'user' ? 'cb-msg-user' : 'cb-msg-bot')}>
                {msg.text.split('\n').map((line, j) => (
                  <div key={j}>{line}</div>
                ))}
              </div>
            ))}
          </div>

          <div className="cb-quick">
            <button onClick={() => handleSend('What is my workout today?')}>Today</button>
            <button onClick={() => handleSend('What is my workout tomorrow?')}>Tomorrow</button>
            <button onClick={() => handleSend('What is my workout for this week?')}>This Week</button>
            <button onClick={() => handleSend('What is my workout for this month?')}>This Month</button>
          </div>

          <div className="cb-input-row">
            <input
              type="text"
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button className="cb-send-btn" onClick={() => handleSend()} aria-label="Send">
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
export default ChatBot;