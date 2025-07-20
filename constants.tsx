import React from 'react';
import { NavItem, Badge, ExamMode } from './types';
import { HomeIcon, LightBulbIcon, BeakerIcon, BookOpenIcon, PencilIcon, ClockIcon, UsersIcon, AcademicCapIcon, ClipboardDocumentListIcon, Cog6ToothIcon, CheckBadgeIcon, TrophyIcon, ChatBubbleLeftRightIcon, FireIcon, DocumentMagnifyingGlassIcon } from './components/icons/HeroIcons';

export const NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', i18nKey: 'dashboard', path: '/dashboard', icon: (props) => <HomeIcon {...props} /> },
  { name: 'AI Doubt Solver', i18nKey: 'aiDoubtSolver', path: '/doubt-solver', icon: (props) => <LightBulbIcon {...props} /> },
  { name: 'Test Generator', i18nKey: 'testGenerator', path: '/test-generator', icon: (props) => <BeakerIcon {...props} /> },
  { name: 'Practice from Image', i18nKey: 'ocrPractice', path: '/ocr-practice', icon: (props) => <DocumentMagnifyingGlassIcon {...props} /> },
  { name: 'AI Notes', i18nKey: 'aiNotes', path: '/notes-generator', icon: (props) => <ClipboardDocumentListIcon {...props} />},
  { name: 'Mistake Journal', i18nKey: 'mistakeJournal', path: '/mistake-journal', icon: (props) => <BookOpenIcon {...props} /> },
  { name: 'Learning Plan', i18nKey: 'learningPlan', path: '/learning-plan', icon: (props) => <PencilIcon {...props} /> },
  { name: 'Exam Simulation', i18nKey: 'examSimulation', path: '/exam-simulation', icon: (props) => <ClockIcon {...props} /> },
  { name: 'Collaboration', i18nKey: 'collaboration', path: '/collaboration', icon: (props) => <UsersIcon {...props} /> },
  { name: 'Community Q&A', i18nKey: 'communityQA', path: '/community', icon: (props) => <ChatBubbleLeftRightIcon {...props} /> },
  { name: 'Career Counseling', i18nKey: 'careerCounseling', path: '/career-counseling', icon: (props) => <AcademicCapIcon {...props} /> },
  { name: 'Leaderboard', i18nKey: 'leaderboard', path: '/leaderboard', icon: (props) => <TrophyIcon {...props} /> },
  { name: 'Settings', i18nKey: 'settings', path: '/settings', icon: (props) => <Cog6ToothIcon {...props} /> },
];

export const GEMINI_MODEL = 'gemini-2.5-flash';

export const BADGES: { [key: string]: Badge } = {
    'first_doubt': { id: 'first_doubt', name: 'Curious Mind', description: 'Solved your first doubt.', icon: (props) => <LightBulbIcon {...props} /> },
    'test_ace': { id: 'test_ace', name: 'Test Ace', description: 'Scored 90% or more in a test.', icon: (props) => <AcademicCapIcon {...props} /> },
    'marathoner': { id: 'marathoner', name: 'Marathoner', description: 'Completed a full exam simulation.', icon: (props) => <ClockIcon {...props} /> },
    'scholar': { id: 'scholar', name: 'Scholar', description: 'Generated your first learning plan.', icon: (props) => <PencilIcon {...props} /> },
    'perfectionist': { id: 'perfectionist', name: 'Perfectionist', 'description': 'Reviewed 10 mistakes in your journal.', icon: (props) => <BookOpenIcon {...props} /> },
    'streaker': { id: 'streaker', name: 'Streaker', 'description': 'Maintained a 3-day login streak.', icon: (props) => <FireIcon {...props} /> }
};

export const EXAM_CONFIGS: Record<ExamMode, { subjects: Record<string, string[]>, totalQuestions: number, duration: number }> = {
    JEE: {
        subjects: {
            Physics: ['Kinematics', 'Laws of Motion', 'Work, Energy, and Power', 'Rotational Motion', 'Optics', 'Thermodynamics', 'Electrostatics'],
            Chemistry: ['Chemical Bonding', 'Equilibrium', 's-Block Elements', 'p-Block Elements', 'Organic Chemistry - GOC', 'Hydrocarbons', 'Electrochemistry'],
            Mathematics: ['Complex Numbers', 'Quadratic Equations', 'Calculus', 'Trigonometry', 'Conic Sections', 'Vectors', 'Probability'],
        },
        totalQuestions: 75,
        duration: 3 * 60 * 60
    },
    BITSAT: {
        subjects: {
            Physics: ['Units & Measurement', 'Heat & Thermodynamics', 'Wave Motion', 'Current Electricity'],
            Chemistry: ['States of Matter', 'Atomic Structure', 'Chemical Kinetics', 'Biomolecules'],
            'English Proficiency': ['Grammar', 'Vocabulary', 'Reading Comprehension'],
            'Logical Reasoning': ['Verbal Reasoning', 'Non-verbal Reasoning'],
            Mathematics: ['Algebra', 'Trigonometry', 'Two-dimensional Coordinate Geometry', 'Differential calculus']
        },
        totalQuestions: 130,
        duration: 3 * 60 * 60
    },
    VITEEE: {
        subjects: {
            Physics: ['Laws of Motion & Work, Energy and Power', 'Properties of Matter', 'Electrostatics', 'Magnetic Effects of Electric Current'],
            Chemistry: ['Atomic Structure', 'Thermodynamics', 'Organic Chemistry', 'Coordination Chemistry'],
            Mathematics: ['Calculus', 'Vector Algebra', 'Probability and Distributions'],
            'English Aptitude': ['Grammar and Pronunciation', 'Comprehension']
        },
        totalQuestions: 125,
        duration: 2 * 60 * 60 + 30 * 60 // 2.5 hours
    }
}