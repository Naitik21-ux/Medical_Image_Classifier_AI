import { GoogleGenAI, Type } from "@google/genai";
import type { DiagnosisResult } from '../types';

// Schema for the expected JSON response from the Gemini API
const diagnosisSchema = {
    type: Type.OBJECT,
    properties: {
        diagnoses: {
            type: Type.ARRAY,
            description: "A list of potential diagnoses based on the X-ray.",
            items: {
                type: Type.OBJECT,
                properties: {
                    condition: {
                        type: Type.STRING,
                        description: "The name of the medical condition.",
                    },
                    probability: {
                        type: Type.NUMBER,
                        description: "The probability of this condition, from 0.0 to 1.0.",
                    },
                    attentionArea: {
                        type: Type.OBJECT,
                        description: "The area of the image the model focused on for this diagnosis.",
                        properties: {
                            x: {
                                type: Type.NUMBER,
                                description: "The x-coordinate of the center of the attention circle, as a percentage of image width (0-100).",
                            },
                            y: {
                                type: Type.NUMBER,
                                description: "The y-coordinate of the center of the attention circle, as a percentage of image height (0-100).",
                            },
                            radius: {
                                type: Type.NUMBER,
                                description: "The radius of the attention circle, as a percentage of image width (0-100).",
                            },
                        },
                        required: ["x", "y", "radius"],
                    },
                },
                required: ["condition", "probability", "attentionArea"],
            },
        },
        radiologistReport: {
            type: Type.STRING,
            description: "A detailed narrative report in the style of a radiologist, summarizing the findings, potential conditions, and reasoning based on the attention areas. Should be 2-3 paragraphs long."
        }
    },
    required: ["diagnoses", "radiologistReport"],
};

/**
 * Calls the Gemini API to analyze an X-ray image.
 * @param base64Image - The base64 encoded image string (with data URI header).
 * @param bodyPart - The body part the user selected.
 * @returns A promise that resolves to a DiagnosisResult.
 * @throws An error if the analysis fails or the API key is missing.
 */
export async function getDiagnosis(base64Image: string, bodyPart: string): Promise<DiagnosisResult> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API key is not configured. The application cannot contact the analysis service.");
  }
  
  const ai = new GoogleGenAI({ apiKey });

  // Extract mime type and pure base64 data from the data URI
  const mimeType = base64Image.substring(base64Image.indexOf(":") + 1, base64Image.indexOf(";"));
  const imageData = base64Image.split(',')[1];

  const imagePart = {
    inlineData: {
      mimeType,
      data: imageData,
    },
  };

  // --- Step 1: Smart Verification Call ---
  try {
    const verificationTextPart = {
      text: `Briefly identify the primary human body part shown in this X-ray. Respond with only the name of the body part (e.g., "Chest", "Skull", "Hand").`,
    };

    const verificationResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [verificationTextPart, imagePart] },
        // Use thinkingConfig to make this simple check faster.
        config: { thinkingConfig: { thinkingBudget: 0 } } 
    });

    const identifiedBodyPart = verificationResponse.text.trim();
    
    // Compare the AI's identification with the user's selection.
    // We use .includes() to allow for some flexibility (e.g., user selects "Hand", AI says "Hand and Wrist").
    if (!identifiedBodyPart.toLowerCase().includes(bodyPart.toLowerCase())) {
      throw new Error(`Image Mismatch: You selected ${bodyPart}, but the AI identified the image as a ${identifiedBodyPart}. Please select the correct body part or upload a different image.`);
    }

  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Image Mismatch:')) {
      throw error; // Re-throw our specific user-facing error
    }
    // For other API errors during verification, throw a generic message.
    console.error("Error during image verification step:", error);
    throw new Error("The AI model failed to verify the image type. Please try again.");
  }

  // --- Step 2: Diagnosis Call (if verification passed) ---
  const diagnosisTextPart = {
    text: `You are an expert radiology assistant AI. Analyze this X-ray of a human ${bodyPart}. 
    Based on the image, provide a list of up to 4 potential medical conditions, their probabilities, and the key area of attention for each diagnosis.
    Sort the diagnoses in descending order of probability.
    Also, provide a detailed "radiologistReport". This report should be a narrative summary (2-3 paragraphs) of your findings, written in a professional, clinical tone. It should mention the potential conditions and refer to the areas of interest you identified.
    Do not add any introductory text or explanation outside of the requested JSON format.
    `,
  };

  try {
    const diagnosisResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [diagnosisTextPart, imagePart] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: diagnosisSchema,
      }
    });

    const jsonString = diagnosisResponse.text;
    const result = JSON.parse(jsonString) as DiagnosisResult;

    // The model should already sort, but we sort here again to be certain.
    if (result.diagnoses) {
      result.diagnoses.sort((a, b) => b.probability - a.probability);
    } else {
      // Ensure diagnoses is always an array
      return { diagnoses: [], radiologistReport: "No definitive findings could be established from the provided image." };
    }

    return result;

  } catch (error) {
    console.error("Error calling Gemini API for diagnosis:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
       throw new Error("The provided API key is invalid. Please check your configuration.");
    }
    throw new Error("The AI model failed to process the image. Please try again or use a different image.");
  }
}
