
import { GoogleGenAI, Type } from "@google/genai";
import { ReceiptData, ReceiptItem, AssignmentResult } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseReceiptImage = async (base64Image: string): Promise<ReceiptData> => {
  const model = 'gemini-3-pro-preview';
  
  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Image.split(',')[1],
    },
  };

  const prompt = `Analyze this receipt image. Extract all individual items and their prices. 
  Also extract the tax amount and the final total. 
  Ensure the response is a strict JSON object.`;

  const response = await ai.models.generateContent({
    model,
    contents: { parts: [imagePart, { text: prompt }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                price: { type: Type.NUMBER },
              },
              required: ["name", "price"],
            },
          },
          tax: { type: Type.NUMBER },
          total: { type: Type.NUMBER },
        },
        required: ["items", "tax", "total"],
      },
    },
  });

  return JSON.parse(response.text || '{}') as ReceiptData;
};

export const processAssignmentCommand = async (
  command: string, 
  currentItems: ReceiptItem[],
  existingPeople: string[]
): Promise<AssignmentResult> => {
  const model = 'gemini-3-pro-preview';
  
  const prompt = `
  SplitVision AI Logic Engine (Proportional Mode).
  
  CONTEXT:
  - User Command: "${command}"
  - Receipt Items:
    ${currentItems.map(item => `- [ID: ${item.id}] ${item.name} ($${item.price})`).join('\n')}
  - Current People: ${existingPeople.join(', ')}

  GOALS:
  1. Detect weighted assignments: If the user says "Mike got 1 and Danny got 2 out of 3", assign 1 weight to Mike and 2 to Danny for that item.
  2. If no specific quantity is mentioned, default weight is 1 per person.
  3. Fuzzy match command items to receipt IDs.
  4. Flag missing items in reconciliation_alerts.

  STRICT JSON OUTPUT:
  {
    "assignments": [
      { 
        "itemId": "ID", 
        "persons": [
          { "name": "Mike", "weight": 1 },
          { "name": "Danny", "weight": 2 }
        ],
        "action": "pulse"
      }
    ],
    "unassigned_items": ["ID1"],
    "reconciliation_alerts": ["Alert text"]
  }
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          assignments: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                itemId: { type: Type.STRING },
                persons: { 
                  type: Type.ARRAY, 
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      weight: { type: Type.NUMBER }
                    },
                    required: ["name", "weight"]
                  }
                },
                action: { type: Type.STRING, enum: ["highlight", "pulse", "check"] }
              },
              required: ["itemId", "persons"]
            }
          },
          unassigned_items: { type: Type.ARRAY, items: { type: Type.STRING } },
          reconciliation_alerts: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["assignments", "unassigned_items", "reconciliation_alerts"]
      },
    },
  });

  return JSON.parse(response.text || '{"assignments":[], "unassigned_items":[], "reconciliation_alerts":[]}');
};
