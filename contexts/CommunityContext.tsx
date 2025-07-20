import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { CommunityQuestion, CommunityAnswer } from '../types';

const mockInitialQuestions: CommunityQuestion[] = [
    {
        id: 'q1',
        author: 'Aarav Sharma',
        title: 'How to solve integration problems involving trigonometric identities?',
        body: 'I always get stuck when I see complex trig functions inside an integral. For example, things like integral of sin^4(x). What is the general strategy to tackle these? Are there specific identities I should always look for?',
        tags: ['mathematics', 'calculus', 'integration'],
        timestamp: Date.now() - 86400000,
        upvotes: 25,
        answers: [
            {
                id: 'a1',
                author: 'Diya Joshi',
                content: 'The key is usually to use power-reduction formulas. For sin^4(x), you can write it as (sin^2(x))^2. Then use sin^2(x) = (1 - cos(2x))/2. So you get ((1 - cos(2x))/2)^2. Expand that and you\'ll have terms you can integrate directly or with another simple substitution. This strategy works for most even powers of sin and cos!',
                timestamp: Date.now() - 86000000,
                upvotes: 15
            },
            {
                id: 'a2',
                author: 'Rohan Mehra',
                content: 'Another good trick is to use substitution if you have an odd power. For example, with sin^3(x), you can write it as sin^2(x) * sin(x) = (1 - cos^2(x)) * sin(x). Then you can substitute u = cos(x), and du = -sin(x)dx. It becomes a simple polynomial integral.',
                timestamp: Date.now() - 76400000,
                upvotes: 8
            }
        ]
    },
    {
        id: 'q2',
        author: 'Ananya Reddy',
        title: 'What is the real-world application of Hess\'s Law in Chemistry?',
        body: 'I understand the concept of adding up enthalpy changes of different reactions to find the total enthalpy change, but why is it so important? Do chemists actually use this in a lab?',
        tags: ['chemistry', 'thermodynamics'],
        timestamp: Date.now() - 172800000,
        upvotes: 18,
        answers: [
            {
                id: 'a3',
                author: 'Dr. Verma (Mentor)',
                content: 'Excellent question! Hess\'s Law is fundamentally important because many reactions are impossible or impractical to measure directly in a calorimeter. For example, the formation of carbon monoxide from graphite (C(s) + 1/2 O2(g) -> CO(g)) is very hard to perform without also creating CO2. But we can easily measure the combustion of C to CO2 and CO to CO2. Using Hess\'s Law, we can calculate the enthalpy of formation of CO without ever running that specific experiment. It\'s a cornerstone of thermochemistry!',
                timestamp: Date.now() - 170800000,
                upvotes: 22
            }
        ]
    }
];

interface CommunityContextType {
  questions: CommunityQuestion[];
  getQuestionById: (id: string) => CommunityQuestion | undefined;
  addQuestion: (question: Omit<CommunityQuestion, 'id' | 'timestamp' | 'upvotes' | 'answers'>) => void;
  addAnswer: (questionId: string, answer: Omit<CommunityAnswer, 'id' | 'timestamp' | 'upvotes'>) => void;
  upvoteQuestion: (questionId: string) => void;
  upvoteAnswer: (questionId: string, answerId: string) => void;
}

export const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

const COMMUNITY_STORAGE_KEY = 'jee-genius-community-questions';

export const CommunityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [questions, setQuestions] = useState<CommunityQuestion[]>([]);

  useEffect(() => {
    try {
      const storedQuestions = localStorage.getItem(COMMUNITY_STORAGE_KEY);
      if (storedQuestions) {
        setQuestions(JSON.parse(storedQuestions));
      } else {
        // First time load, use mock data
        setQuestions(mockInitialQuestions);
        localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(mockInitialQuestions));
      }
    } catch (error) {
      console.error("Failed to parse community questions from localStorage", error);
      localStorage.removeItem(COMMUNITY_STORAGE_KEY);
    }
  }, []);

  const persistQuestions = (newQuestions: CommunityQuestion[]) => {
    setQuestions(newQuestions);
    localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(newQuestions));
  };
  
  const getQuestionById = useCallback((id: string) => {
    return questions.find(q => q.id === id);
  }, [questions]);

  const addQuestion = useCallback((question: Omit<CommunityQuestion, 'id' | 'timestamp' | 'upvotes' | 'answers'>) => {
    const newQuestion: CommunityQuestion = {
        ...question,
        id: `q${Date.now()}`,
        timestamp: Date.now(),
        upvotes: 0,
        answers: []
    };
    persistQuestions([newQuestion, ...questions]);
  }, [questions]);

  const addAnswer = useCallback((questionId: string, answer: Omit<CommunityAnswer, 'id' | 'timestamp' | 'upvotes'>) => {
    const newAnswer: CommunityAnswer = {
        ...answer,
        id: `a${Date.now()}`,
        timestamp: Date.now(),
        upvotes: 0
    };
    const updatedQuestions = questions.map(q => {
        if (q.id === questionId) {
            return { ...q, answers: [...q.answers, newAnswer] };
        }
        return q;
    });
    persistQuestions(updatedQuestions);
  }, [questions]);

  const upvoteQuestion = useCallback((questionId: string) => {
    const updatedQuestions = questions.map(q => {
        if (q.id === questionId) {
            return { ...q, upvotes: q.upvotes + 1 };
        }
        return q;
    });
    persistQuestions(updatedQuestions);
  }, [questions]);
  
  const upvoteAnswer = useCallback((questionId: string, answerId: string) => {
    const updatedQuestions = questions.map(q => {
        if (q.id === questionId) {
            const updatedAnswers = q.answers.map(a => {
                if (a.id === answerId) {
                    return { ...a, upvotes: a.upvotes + 1 };
                }
                return a;
            });
            return { ...q, answers: updatedAnswers };
        }
        return q;
    });
    persistQuestions(updatedQuestions);
  }, [questions]);


  return (
    <CommunityContext.Provider value={{ questions, getQuestionById, addQuestion, addAnswer, upvoteQuestion, upvoteAnswer }}>
      {children}
    </CommunityContext.Provider>
  );
};
