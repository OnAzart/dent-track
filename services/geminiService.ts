import { GoogleGenAI } from "@google/genai";
import { Treatment, Tooth } from '../types';

let genAI: GoogleGenAI | null = null;

const initializeGenAI = () => {
  if (!genAI && process.env.API_KEY) {
    genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
};

export const getDentalAdvice = async (
  treatments: Treatment[],
  teeth: Tooth[],
  userQuery?: string
): Promise<string> => {
  initializeGenAI();

  if (!genAI) {
    return "API Key is missing. Please check your configuration.";
  }

  const model = "gemini-2.5-flash";
  
  // Construct context
  const historySummary = treatments.map(t => 
    `- ${t.date}: ${t.type} on Tooth ${t.toothId || 'General'} (${t.notes})`
  ).join('\n');

  const statusSummary = teeth
    .filter(t => t.status !== 'Healthy')
    .map(t => `- Tooth ${t.label}: ${t.status}`)
    .join('\n');

  const prompt = `
    You are an expert dental assistant AI. 
    Analyze the following patient dental record.
    
    Current Dental Status (Non-Healthy teeth only):
    ${statusSummary || "All teeth are currently marked healthy."}

    Treatment History:
    ${historySummary || "No treatment history recorded."}

    User Question: ${userQuery || "Please provide a brief summary of my dental health and any maintenance recommendations based on my history."}

    Provide a concise, friendly, and professional response. Do not give medical diagnoses, but provide general advice and explanations of procedures. Format with Markdown.
  `;

  try {
    const response = await genAI.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text || "I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Sorry, I encountered an error while analyzing your data.";
  }
};