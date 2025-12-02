import { GoogleGenAI } from "@google/genai";
import { CharacterStats } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCharacterBackstory = async (
  name: string,
  role: string,
  stats: CharacterStats
): Promise<string> => {
  try {
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
