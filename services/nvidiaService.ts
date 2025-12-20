
import { GoogleGenAI, Type } from "@google/genai";
import { AssessmentData, DiagnosticReport } from "../types";

/**
 * Generates a final diagnostic report using Gemini 3 Pro with search grounding.
 * This function performs a multimodal analysis of acoustic, visual, and motor biomarkers.
 */
export const generateFinalReport = async (data: AssessmentData): Promise<DiagnosticReport & { citations?: any[], isDemo?: boolean }> => {
  // Initialize Gemini API client using the environment's API key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    TASK: ANALYZE NEUROLOGICAL BIOMARKERS.
    Interpret early indicators of neurodegenerative diseases (such as Alzheimer's or Parkinson's) 
    based on the following multimodal biometric data points. 
    
    Provide clinical reasoning grounded in current medical research.
    
    INPUT DATA:
    - Audio Metrics (Speech pattern, pauses): ${JSON.stringify(data.audioMetrics)}
    - Visual Metrics (Gaze stability, drift): ${JSON.stringify(data.visualMetrics)}
    - Text Metrics (Typing speed, accuracy, motor cadence): ${JSON.stringify(data.textMetrics)}
    - Lifestyle Factors (Bio-baseline): ${JSON.stringify(data.behavioralData)}
  `;

  try {
    // Using gemini-3-pro-preview for advanced reasoning and Google Search grounding.
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        // High reasoning budget for deep clinical analysis of biomarkers.
        thinkingConfig: { thinkingBudget: 32768 },
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallRisk: { 
              type: Type.STRING, 
              enum: ['Low', 'Moderate', 'Elevated'],
              description: "The estimated risk level for neurodegenerative onset."
            },
            confidence: { 
              type: Type.NUMBER,
              description: "Confidence level of the AI analysis (0.0 to 1.0)."
            },
            analysis: {
              type: Type.OBJECT,
              properties: {
                speech: { type: Type.STRING, description: "Detailed speech and prosody analysis." },
                visual: { type: Type.STRING, description: "Oculomotor and gaze stability interpretation." },
                cognitive: { type: Type.STRING, description: "Motor logic and linguistic complexity summary." }
              },
              required: ['speech', 'visual', 'cognitive']
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Actionable clinical or lifestyle recommendations."
            },
            medicalGrounding: { 
              type: Type.STRING,
              description: "The synthesis of clinical reasoning for this specific patient profile."
            }
          },
          required: ['overallRisk', 'confidence', 'analysis', 'recommendations', 'medicalGrounding']
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("The AI model returned an empty response.");
    }

    // Parse the JSON output from Gemini.
    const result = JSON.parse(text.trim());
    
    // Extract search grounding citations to satisfy medical grounding requirements.
    const citations = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return { 
      ...result, 
      citations, 
      isDemo: false 
    };
  } catch (error) {
    console.error("Neurological Synthesis Pipeline Error:", error);
    throw error;
  }
};
