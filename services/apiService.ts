import { LearningPlan, User, Mistake } from "../types";

// Helper to simulate network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

interface TokenPayload {
    role: 'student' | 'parent';
    email: string;
    studentEmail?: string;
}

class MockApiService {
    private currentUser: User | null = null;
    private studentEmailForParent: string | null = null;

    setAuthToken(token: string | null) {
        if (!token) {
            this.currentUser = null;
            this.studentEmailForParent = null;
            return;
        }

        try {
            const payload: TokenPayload = JSON.parse(token);
            const { role, email, studentEmail } = payload;
            
            if (role === 'student' && email) {
                const users = this.getUsers();
                this.currentUser = users[email] || null;
                this.studentEmailForParent = null;
            } else if (role === 'parent' && email && studentEmail) {
                this.currentUser = {
                    name: `Mentor for ${studentEmail.split('@')[0]}`,
                    email: email,
                    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=M`,
                    role: 'parent',
                    studentEmail: studentEmail,
                };
                this.studentEmailForParent = studentEmail;
            } else {
                 this.currentUser = null;
                 this.studentEmailForParent = null;
            }
        } catch (error) {
            console.error("Invalid token format", error);
            // Invalid token format, clear the user
            this.currentUser = null;
            this.studentEmailForParent = null;
        }
    }

    private getUsers(): Record<string, User> {
        try {
            const users = localStorage.getItem('jee-genius-users');
            return users ? JSON.parse(users) : {};
        } catch {
            return {};
        }
    }

    private saveUsers(users: Record<string, User>) {
        localStorage.setItem('jee-genius-users', JSON.stringify(users));
    }

    // --- AUTH ---
    async login(credentials: { email: string, password?: string }) {
        await delay(500);
        const users = this.getUsers();
        let user = users[credentials.email];

        if (!user) {
            // Register if user doesn't exist
            user = {
                name: credentials.email.split('@')[0],
                email: credentials.email,
                avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${credentials.email.split('@')[0]}`,
                role: 'student',
            };
            users[credentials.email] = user;
            this.saveUsers(users);
        }

        const payload: TokenPayload = { role: 'student', email: user.email };
        const token = JSON.stringify(payload);
        return { token, user };
    }

    async loginAsParent(credentials: { studentEmail: string, inviteCode: string }) {
        await delay(500);
        const studentDataKey = `jee-genius-student-data-${credentials.studentEmail}`;
        const studentData = JSON.parse(localStorage.getItem(studentDataKey) || '{}');

        if (studentData.inviteCode && studentData.inviteCode === credentials.inviteCode) {
            // remove invite code after use
            delete studentData.inviteCode;
            localStorage.setItem(studentDataKey, JSON.stringify(studentData));

            const parentEmail = `parent-of-${credentials.studentEmail.split('@')[0]}@demo.com`;
            const user: User = {
                name: `Mentor for ${credentials.studentEmail.split('@')[0]}`,
                email: parentEmail,
                avatar: `https://api.dicebear.com/7.x/initials/svg?seed=M`,
                role: 'parent',
                studentEmail: credentials.studentEmail,
            };
            
            const payload: TokenPayload = { role: 'parent', email: user.email, studentEmail: credentials.studentEmail };
            const token = JSON.stringify(payload);
            return { token, user };
        } else {
            throw new Error('Invalid student email or invite code.');
        }
    }

    async validateSession() {
        await delay(300);
        if (this.currentUser) {
            return this.currentUser;
        }
        throw new Error("Invalid session");
    }

    // --- DATA MANAGEMENT ---
    // Learning Plan
    async getLearningPlan(): Promise<LearningPlan | null> {
        await delay(200);
        if (!this.currentUser || this.currentUser.role !== 'student') return null;
        const key = `jee-genius-plan-${this.currentUser.email}`;
        const plan = localStorage.getItem(key);
        return plan ? JSON.parse(plan) : null;
    }
    
    async saveLearningPlan(plan: LearningPlan): Promise<void> {
        await delay(200);
         if (!this.currentUser || this.currentUser.role !== 'student') return;
        const key = `jee-genius-plan-${this.currentUser.email}`;
        localStorage.setItem(key, JSON.stringify(plan));
    }

    async clearLearningPlan(): Promise<void> {
        await delay(200);
        if (!this.currentUser || this.currentUser.role !== 'student') return;
        const key = `jee-genius-plan-${this.currentUser.email}`;
        localStorage.removeItem(key);
    }
    
    // --- PARENT/MENTOR ---
    private getStudentData(studentEmail: string, key: string): any {
        const fullKey = `${key}-${studentEmail}`;
        const data = localStorage.getItem(fullKey);
        try {
            return data ? JSON.parse(data) : null;
        } catch {
            return null;
        }
    }

    async getStudentDataForParent() {
        await delay(500);
        if (!this.studentEmailForParent) throw new Error("Not logged in as a parent.");

        const gamification = this.getStudentData(this.studentEmailForParent, 'jee-genius-gamification') || { level: 1, xp: 0};
        const mistakes: Mistake[] = this.getStudentData(this.studentEmailForParent, 'jee-genius-mistakes') || [];

        const topicCounts: { [key: string]: number } = {};
        mistakes.forEach(mistake => {
          topicCounts[mistake.question.topic] = (topicCounts[mistake.question.topic] || 0) + 1;
        });

        const weakTopics = Object.entries(topicCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([topic]) => topic);

        return {
            gamification,
            mistakeCount: mistakes.length,
            weakTopics,
        };
    }

    async getStudentMistakesForParent(): Promise<Mistake[]> {
        await delay(500);
        if (!this.studentEmailForParent) throw new Error("Not logged in as a parent.");
        return this.getStudentData(this.studentEmailForParent, 'jee-genius-mistakes') || [];
    }

    async getStudentLearningPlanForParent(): Promise<LearningPlan | null> {
        await delay(500);
        if (!this.studentEmailForParent) throw new Error("Not logged in as a parent.");
        return this.getStudentData(this.studentEmailForParent, 'jee-genius-plan') || null;
    }
    
    async sendEncouragement(message: string): Promise<void> {
        await delay(300);
        if (!this.studentEmailForParent) throw new Error("Not logged in as a parent.");
        localStorage.setItem(`encouragement-for-${this.studentEmailForParent}`, message);
    }
}

export const apiService = new MockApiService();