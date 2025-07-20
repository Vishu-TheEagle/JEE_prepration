import React from 'react';

export interface User {
  name: string;
  email: string;
  avatar: string;
  role: 'student' | 'parent';
  studentEmail?: string;
}

export type Language = 'en' | 'hi';
export type ExamMode = 'JEE' | 'BITSAT' | 'VITEEE';

export interface NavItem {
  name: string;
  i18nKey: string;
  path: string;
  icon: (props: React.ComponentProps<'svg'>) => React.ReactNode;
}

export enum DoubtType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  AUDIO = 'AUDIO',
}

export interface DoubtRequest {
  type: DoubtType;
  content: string; // text question or prompt for image
  imageData?: string; // base64 image data
}

export interface DoubtSolution {
  id: string;
  request: DoubtRequest;
  solutionText: string;
  relatedVideos: string[]; // URLs or IDs
  timestamp: string;
}

export interface TestQuestion {
  id: string;
  topic: string;
  question: string;
  options: string[];
  answer: string;
}

export interface Mistake {
  question: TestQuestion;
  userAnswer: string;
  timestamp: number;
}

export interface DailyPlan {
  day: number;
  topic: string;
  task: string;
  details: string;
}

export interface LearningPlan {
  week_goal: string;
  daily_plans: DailyPlan[];
}

export type QuestionStatus = 'unanswered' | 'answered' | 'review' | 'unvisited';

export interface ExamQuestion extends TestQuestion {
    status: QuestionStatus;
    userAnswer?: string;
}

export interface ChatMessage {
    sender: 'user' | 'bot' | 'peer';
    name: string;
    text: string;
    timestamp: number;
}

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: (props: React.ComponentProps<'svg'>) => React.ReactNode;
}

export interface GamificationState {
    xp: number;
    level: number;
    unlockedBadges: string[]; // array of badge IDs
    streak: number;
    lastLoginTimestamp: number;
}

export interface LeaderboardUser {
    rank: number;
    name: string;
    level: number;
    xp: number;
    isCurrentUser: boolean;
}

export interface CommunityAnswer {
    id: string;
    author: string;
    content: string;
    timestamp: number;
    upvotes: number;
}

export interface CommunityQuestion {
    id: string;
    author: string;
    title: string;
    body: string;
    tags: string[];
    timestamp: number;
    upvotes: number;
    answers: CommunityAnswer[];
}