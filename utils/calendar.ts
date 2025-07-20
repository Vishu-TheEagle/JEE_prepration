import { LearningPlan } from '../types';

// A simple UID generator
const generateUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

export const generateICSFileContent = (plan: LearningPlan): string => {
    let icsString = `BEGIN:VCALENDAR
PRODID:-//JEEGeniusAI//NONSGML v1.0//EN
VERSION:2.0
CALSCALE:GREGORIAN
`;

    const today = new Date();
    today.setHours(9, 0, 0, 0); // Default to 9 AM

    plan.daily_plans.forEach(dayPlan => {
        const eventDate = new Date(today);
        eventDate.setDate(today.getDate() + dayPlan.day - 1);
        
        const startDate = formatDate(eventDate);
        eventDate.setHours(eventDate.getHours() + 1); // Assume 1-hour slots
        const endDate = formatDate(eventDate);

        icsString += `BEGIN:VEVENT
UID:${generateUID()}@jeegenius.ai
DTSTAMP:${formatDate(new Date())}
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:JEE Prep: ${dayPlan.topic}
DESCRIPTION:Task: ${dayPlan.task}\\nDetails: ${dayPlan.details}
END:VEVENT
`;
    });

    icsString += `END:VCALENDAR`;

    return icsString;
};
