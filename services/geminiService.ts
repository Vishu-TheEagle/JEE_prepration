

import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { GEMINI_MODEL } from "../constants";
import { DoubtRequest, DoubtType, TestQuestion, LearningPlan, DailyPlan, ExamMode } from "../types";

// Ensure the API key is available, otherwise throw an error.
if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
}

export const solveDoubt = async (request: DoubtRequest): Promise<string> => {
    try {
        const systemInstruction = `You are an expert tutor for India's engineering entrance exams (JEE, BITSAT, VITEEE). Your goal is to provide clear, step-by-step solutions.
1.  **Analyze the question:** Identify the core concepts from Physics, Chemistry, Mathematics, or English/Logical Reasoning.
2.  **Provide a step-by-step solution:** Break down the problem logically. Use markdown for formulas, equations, and code blocks. Use LaTeX for math notation within $$...$$.
3.  **Explain the 'Why':** Briefly explain the principles or formulas used in each step.
4.  **Final Answer:** Clearly state the final answer.
5.  **Pro-Tip/Common Mistake:** Add a small tip or warn about a common pitfall related to the question.
DO NOT mention that you are an AI. Be a helpful, direct, and expert tutor.`;

        let contents: any;

        if (request.type === DoubtType.IMAGE && request.imageData) {
           const imagePart = {
                inlineData: {
                    mimeType: 'image/jpeg', // Assuming jpeg, could be dynamic
                    data: request.imageData,
                },
           };
           const textPart = { text: request.content || "Explain the problem in this image." };
           contents = { parts: [textPart, imagePart] };
        } else {
            contents = request.content;
        }

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.5,
            }
        });

        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            return `An error occurred while fetching the solution: ${error.message}. Please check your API key and network connection.`;
        }
        return "An unknown error occurred."
    }
};

export const generateNotes = async (topic: string): Promise<string> => {
    try {
        const systemInstruction = `You are an expert tutor for India's engineering entrance exams. Your goal is to provide comprehensive, well-structured, and easy-to-understand notes on a given topic. Use clear headings, bullet points, lists, and formulas. Format the entire response using markdown, including LaTeX for mathematical equations within $$...$$.`;
        
        const contents = `Please generate detailed study notes for the topic: "${topic}". The notes should cover all important concepts, formulas, and examples relevant to the syllabus of exams like JEE, BITSAT, and VITEEE.`;

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.6,
            }
        });

        return response.text;
    } catch (error) {
        console.error("Error generating notes with Gemini API:", error);
         if (error instanceof Error) {
            return `An error occurred while generating notes: ${error.message}.`;
        }
        return "An unknown error occurred while generating notes."
    }
};

interface TestConfig {
  count: number;
  topics: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  examMode: ExamMode;
}

const testQuestionSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            id: {
                type: Type.STRING,
                description: "A unique identifier for the question."
            },
            topic: {
                type: Type.STRING,
                description: "The primary topic this question belongs to."
            },
            question: {
                type: Type.STRING,
                description: "The question text."
            },
            options: {
                type: Type.ARRAY,
                items: {
                    type: Type.STRING
                },
                description: "An array of 4 possible answers."
            },
            answer: {
                type: Type.STRING,
                description: "The correct answer, which must be one of the strings in the options array."
            }
        },
        required: ["id", "topic", "question", "options", "answer"]
    }
};

const parseJsonResponse = (responseText: string): any[] => {
    const jsonText = responseText.trim();
    const parsedJson = JSON.parse(jsonText);

    if (Array.isArray(parsedJson)) {
        return parsedJson;
    }
    
    // Handle cases where the top-level response is an object with the array inside
    const key = Object.keys(parsedJson)[0];
    if (Array.isArray(parsedJson[key])) {
        return parsedJson[key];
    }
    
    throw new Error("The API response was not in the expected format of a JSON array.");
};


export const generateTestQuestions = async (config: TestConfig): Promise<TestQuestion[]> => {
    try {
        const systemInstruction = `You are an expert question setter for India's engineering entrance exams. Generate high-quality multiple-choice questions (MCQs) for the specified exam: ${config.examMode}. The output must be a valid JSON array of objects as per the provided schema. Ensure questions are relevant and accurately reflect the specified difficulty and exam pattern.`;

        const contents = `Generate a JSON array of ${config.count} multiple-choice questions for the ${config.examMode} exam. Topics: ${config.topics.join(', ')}. The difficulty level should be ${config.difficulty}. Each question object must have these properties: 'id' (a unique string), 'topic' (a string from the requested topics), 'question' (string), 'options' (an array of 4 strings), and 'answer' (a string matching one of the options).`;

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.8,
                responseMimeType: "application/json",
                responseSchema: testQuestionSchema
            }
        });
        
        return parseJsonResponse(response.text) as TestQuestion[];

    } catch (error) {
        console.error("Error generating test questions with Gemini API:", error);
        throw new Error("Failed to generate test questions. The AI may be unable to produce questions for the selected combination of topics and difficulty.");
    }
};

export const generatePracticeFromImage = async (imageData: string): Promise<TestQuestion[]> => {
    try {
        const systemInstruction = `You are an expert OCR and question-creation tool for JEE aspirants. Your task is to analyze an image of a textbook page or handwritten notes, identify all multiple-choice questions, and format them into a valid JSON array of objects. If there are no clear MCQs, state that by returning an empty array.`;
        
        const contents = {
            parts: [
                { text: `Extract all multiple-choice questions from this image and format them as a JSON array. Each object must have 'id' (a unique string), 'topic' (infer the topic from the question content, e.g., "Physics" or "Calculus"), 'question', 'options' (an array of 4 strings), and 'answer'. If no MCQs are found, return an empty array.` },
                { inlineData: { mimeType: 'image/jpeg', data: imageData } }
            ]
        };

        const response = await ai.models.generateContent({
             model: GEMINI_MODEL,
             contents: contents,
             config: {
                systemInstruction: systemInstruction,
                temperature: 0.4,
                responseMimeType: "application/json",
                responseSchema: testQuestionSchema,
             }
        });

        return parseJsonResponse(response.text) as TestQuestion[];

    } catch (error) {
        console.error("Error generating practice from image with Gemini API:", error);
        throw new Error("Failed to generate a practice test from the image. The AI may not have been able to identify questions in the image.");
    }
};


export const generateLearningPlan = async (weakTopics: string[]): Promise<LearningPlan> => {
    try {
        const systemInstruction = `You are an expert JEE exam coach. Your task is to create a personalized, 7-day study plan to help a student improve on their specific weak topics. The output must be a valid JSON object following the provided schema. The plan should be encouraging and actionable.`;

        const contents = `A student is weak in the following topics: ${weakTopics.join(', ')}. Create a structured 7-day study plan to help them improve. For each day, suggest a primary topic to focus on, a specific task (e.g., 'Review theory', 'Solve 15 MCQs', 'Watch a concept video'), and provide a bit more detail on the task. Also, provide an overall motivational goal for the week.`;
        
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        week_goal: {
                            type: Type.STRING,
                            description: "A motivational goal for the week."
                        },
                        daily_plans: {
                            type: Type.ARRAY,
                            description: "An array of daily plans for 7 days.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    day: { type: Type.INTEGER },
                                    topic: { type: Type.STRING },
                                    task: { type: Type.STRING },
                                    details: { type: Type.STRING }
                                },
                                required: ["day", "topic", "task", "details"]
                            }
                        }
                    },
                    required: ["week_goal", "daily_plans"]
                }
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as LearningPlan;

    } catch (error) {
        console.error("Error generating learning plan with Gemini API:", error);
        throw new Error("Failed to generate a learning plan. The AI may have had an issue with the provided topics.");
    }
};

export const generateCareerCounseling = async (performanceSummary: {strongest: string[], weakest: string[]}): Promise<any> => {
     try {
        const systemInstruction = `You are an expert career counselor for Indian engineering aspirants. Based on a student's strongest and weakest JEE subjects, provide a detailed and encouraging report in JSON format. Recommend suitable engineering branches and top colleges (IITs/NITs), and give a strategic plan for improvement.`;

        const contents = `A student has the following performance profile: Strongest Topics: ${performanceSummary.strongest.join(', ') || 'None listed'}. Weakest Topics: ${performanceSummary.weakest.join(', ') || 'None listed'}.
        Please generate a career counseling report with the following structure:
        - "analysis": A brief summary of their performance.
        - "recommended_branches": An array of objects, each with "branch_name" and "reason" (why it fits their strengths).
        - "top_colleges": An array of objects, each with "college_name" and "notes" (why it's a good choice for the recommended branches).
        - "improvement_plan": A brief strategic plan to tackle their weak areas.`;
        
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        analysis: { type: Type.STRING },
                        recommended_branches: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    branch_name: { type: Type.STRING },
                                    reason: { type: Type.STRING }
                                },
                                required: ["branch_name", "reason"]
                            }
                        },
                        top_colleges: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    college_name: { type: Type.STRING },
                                    notes: { type: Type.STRING }
                                },
                                required: ["college_name", "notes"]
                            }
                        },
                        improvement_plan: { type: Type.STRING }
                    },
                    required: ["analysis", "recommended_branches", "top_colleges", "improvement_plan"]
                }
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);

    } catch (error) {
        console.error("Error generating career counseling with Gemini API:", error);
        throw new Error("Failed to generate career counseling report.");
    }
}