
import { GoogleGenAI, Type } from "@google/genai";
import type { FoundItemReport, LostItemReport, MatchResult } from '../types';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    matches: {
      type: Type.ARRAY,
      description: "List of potential matches with confidence scores and reasoning.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "The ID of the lost item." },
          confidence: { type: Type.NUMBER, description: "A confidence score between 0 and 100 indicating the likelihood of a match." },
          reasoning: { type: Type.STRING, description: "A brief explanation of why this item is considered a match, comparing visual features and description." }
        },
        required: ["id", "confidence", "reasoning"]
      }
    }
  },
  required: ["matches"]
};

/**
 * Converts an image string (base64 or URL) into a format suitable for the Gemini API.
 */
const prepareImagePart = async (imageStr: string) => {
  let base64Data = imageStr;

  // If it's a URL, fetch and convert to base64
  if (imageStr.startsWith('http')) {
    try {
      const response = await fetch(imageStr);
      if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
      const blob = await response.blob();
      base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error fetching image from URL:", error);
      return null;
    }
  }

  const match = base64Data.match(/^data:(image\/[a-z]+);base64,(.*)$/);
  if (!match) {
    console.error("Invalid image data format.");
    return null;
  }

  return {
    inlineData: {
      mimeType: match[1],
      data: match[2],
    },
  };
};


export const findMatches = async (foundItem: FoundItemReport, allLostItems: LostItemReport[]): Promise<MatchResult[]> => {
  if (!process.env.API_KEY) {
    throw new Error("Gemini API key is not configured.");
  }
  
  if (allLostItems.length === 0) {
    return [];
  }

  // Prepare the parts for the prompt
  const parts: any[] = [];

  // 1. Context and Instructions
  parts.push({
    text: `You are an intelligent lost and found matching system for a university.
    Your task is to identify potential matches for a found item from a list of lost item reports.
    
    CRITICAL INSTRUCTION: You must visually compare the image of the found item with the images provided for the candidate lost items.
    Also analyze the text descriptions (name, color, brand, location, date).
    
    FOUND ITEM DETAILS:
    - Name: "${foundItem.itemName}"
    - Description: "${foundItem.description}"
    - Location Found: "${foundItem.locationFound}"
    - Date Found: "${foundItem.dateFound}"
    
    Below is the image of the found item:`
  });

  // 2. Found Item Image
  const foundImagePart = await prepareImagePart(foundItem.image);
  if (foundImagePart) {
    parts.push(foundImagePart);
  } else {
    parts.push({ text: "[Image of found item is unavailable]" });
  }

  parts.push({ text: `\n--------------------------------------------------\nCANDIDATE LOST ITEMS:\nAnalyze each candidate below and determine if it matches the found item.` });

  // 3. Candidate Items (Text + Image)
  // Limit to 20 items to avoid payload limits if the list grows large
  const candidates = allLostItems.slice(0, 20); 
  
  for (const item of candidates) {
    parts.push({
      text: `\n--- Candidate ID: ${item.id} ---
      - Name: ${item.itemName}
      - Description: ${item.description}
      - Date Lost: ${item.dateLost}
      - Last Known Location: ${item.lastKnownLocation}
      - Image:`
    });

    const lostImagePart = await prepareImagePart(item.image);
    if (lostImagePart) {
      parts.push(lostImagePart);
    } else {
      parts.push({ text: "[Image unavailable]" });
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
          parts: parts
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    
    if (result && Array.isArray(result.matches)) {
      return result.matches;
    }
    
    return [];

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return [];
  }
};
