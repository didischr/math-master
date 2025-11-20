import { GoogleGenAI, Type } from "@google/genai";
import { MathTipResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMathTip = async (num1: number, num2: number): Promise<MathTipResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Explain how to calculate ${num1} multiplied by ${num2} easily in your head. Provide a simple explanation and a clever mental math trick if possible. Respond in Hebrew.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tip: {
              type: Type.STRING,
              description: "A clear explanation of the calculation step-by-step in Hebrew.",
            },
            trick: {
              type: Type.STRING,
              description: "A mental math shortcut or mnemonic to remember this specific multiplication in Hebrew.",
            }
          },
          required: ["tip", "trick"],
        },
      },
    });

    if (response.text) {
        return JSON.parse(response.text) as MathTipResponse;
    }
    throw new Error("No response text");
  } catch (error) {
    console.error("Error fetching math tip:", error);
    return {
      tip: "נסה לפרק את המספרים לגורמים פשוטים יותר.",
      trick: "אין טיפ זמין כרגע."
    };
  }
};