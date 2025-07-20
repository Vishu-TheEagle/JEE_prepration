import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Language } from '../types';

// Simple translation dictionary
const translations: Record<Language, Record<string, string>> = {
    en: {
        dashboard: 'Dashboard',
        aiDoubtSolver: 'AI Doubt Solver',
        testGenerator: 'Test Generator',
        ocrPractice: 'Practice from Image',
        aiNotes: 'AI Notes',
        mistakeJournal: 'Mistake Journal',
        learningPlan: 'Learning Plan',
        examSimulation: 'Exam Simulation',
        collaboration: 'Collaboration',
        communityQA: 'Community Q&A',
        careerCounseling: 'Career Counseling',
        leaderboard: 'Leaderboard',
        settings: 'Settings',
        language: 'Language',
        examMode: 'Exam Mode',
        appearance: 'Appearance',
        theme: 'Theme',
        reduceAnimations: 'Reduce Animations',
        reduceAnimationsDesc: 'Disables UI animations for a smoother experience on low-end devices.',
        notifications: 'Notifications',
        studyReminders: 'Study Reminders',
        studyRemindersDesc: 'Get browser notifications for your study plan.',
        parentMentorAccess: 'Parent/Mentor Access',
        parentMentorAccessDesc: 'Generate a single-use code to grant read-only access to a mentor.',
        generateInviteCode: 'Generate Invite Code',
        shareInviteCode: 'Share this code and your email ({email}) with your mentor.',
        linkedMentors: 'Linked Mentors',
        noLinkedMentors: 'No mentors have been linked yet.',
        dangerZone: 'Danger Zone',
        resetAccount: 'Reset Account',
        resetAccountDesc: 'Permanently delete all your progress and data.',
    },
    hi: {
        dashboard: 'डैशबोर्ड',
        aiDoubtSolver: 'एआई संदेह समाधान',
        testGenerator: 'टेस्ट जेनरेटर',
        ocrPractice: 'छवि से अभ्यास',
        aiNotes: 'एआई नोट्स',
        mistakeJournal: 'गलती जर्नल',
        learningPlan: 'सीखने की योजना',
        examSimulation: 'परीक्षा सिमुलेशन',
        collaboration: 'सहयोग',
        communityQA: 'सामुदायिक प्रश्नोत्तर',
        careerCounseling: 'करियर परामर्श',
        leaderboard: 'लीडरबोर्ड',
        settings: 'सेटिंग्स',
        language: 'भाषा',
        examMode: 'परीक्षा मोड',
        appearance: 'दिखावट',
        theme: 'थीम',
        reduceAnimations: 'एनिमेशन कम करें',
        reduceAnimationsDesc: 'कम क्षमता वाले उपकरणों पर बेहतर अनुभव के लिए यूआई एनिमेशन अक्षम करता है।',
        notifications: 'सूचनाएं',
        studyReminders: 'अध्ययन अनुस्मारक',
        studyRemindersDesc: 'अपनी अध्ययन योजना के लिए ब्राउज़र सूचनाएं प्राप्त करें।',
        parentMentorAccess: 'अभिभावक/मेंटर एक्सेस',
        parentMentorAccessDesc: 'एक मेंटर को केवल-पढ़ने के लिए एक्सेस देने के लिए एक बार उपयोग होने वाला कोड बनाएं।',
        generateInviteCode: 'आमंत्रण कोड बनाएं',
        shareInviteCode: 'यह कोड और अपना ईमेल ({email}) अपने मेंटर के साथ साझा करें।',
        linkedMentors: 'जुड़े हुए मेंटर्स',
        noLinkedMentors: 'अभी तक कोई मेंटर नहीं जोड़ा गया है।',
        dangerZone: 'खतरनाक क्षेत्र',
        resetAccount: 'अकाउंट रीसेट करें',
        resetAccountDesc: 'अपनी सभी प्रगति और डेटा को स्थायी रूप से हटा दें।',
    }
};

interface LocaleContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, replacements?: Record<string, string>) => string;
}

export const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

const LOCALE_STORAGE_KEY = 'jee-genius-locale';

export const LocaleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const storedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) as Language | null;
    if (storedLocale && ['en', 'hi'].includes(storedLocale)) {
      setLanguageState(storedLocale);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LOCALE_STORAGE_KEY, lang);
  };

  const t = useCallback((key: string, replacements?: Record<string, string>): string => {
    let translation = translations[language]?.[key] || key;
    if (replacements) {
        Object.keys(replacements).forEach(rKey => {
            translation = translation.replace(`{${rKey}}`, replacements[rKey]);
        });
    }
    return translation;
  }, [language]);

  return (
    <LocaleContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LocaleContext.Provider>
  );
};
