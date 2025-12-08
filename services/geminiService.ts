import { GoogleGenAI } from "@google/genai";
import { CharacterStats } from "../types";

// Explicitly declare process to avoid TS errors when @types/node is missing
declare const process: any;

export const generateCharacterBackstory = async (
  name: string,
  role: string,
  stats: CharacterStats
): Promise<string> => {
  // Retrieve API Key exclusively from process.env as per guidelines.
  // Using (process.env as any) to handle potential missing Node types in the client environment.
  const apiKey = (process.env as any).API_KEY;
  
  if (!apiKey) {
    console.warn("API Key is missing.");
    return "Neural link offline. API Key required for bio generation.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      Create a short, immersive, and mysterious backstory (max 100 words) for a video game character with the following details:
      Name: ${name}
      Class/Role: ${role}
      Attributes:
      - Intelligence: ${stats.intelligence}
      - Vitality: ${stats.vitality}
      - Charisma: ${stats.charisma}
      - Skill: ${stats.skill}
      - Wealth: ${stats.wealth}
      - Luck: ${stats.luck}
      
      The tone should be epic and suitable for a high-fantasy or sci-fi RPG character sheet.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "The archives are incomplete. No data found for this entity.";
  } catch (error) {
    console.error("Failed to generate backstory:", error);
    return "Error connecting to the neural network. Bio generation failed.";
  }
};