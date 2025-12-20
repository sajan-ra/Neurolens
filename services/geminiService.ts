
import { GoogleGenAI, Type } from "@google/genai";
import { AssessmentData, DiagnosticReport } from "../types";

export const generateFinalReport = async (data: AssessmentData): Promise<DiagnosticReport & { citations?: any[] }> => {
  // Create a new instance right before the call to ensure the latest API key is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const modelName = "gemini-3-pro-preview";

  const prompt = `
    ACT AS A SENIOR NEUROLOGICAL DIAGNOSTIC AI SYSTEM.
    Analyze the following multimodal digital biomarker data for indicators of neurodegenerative risk (specifically targeting Alzheimer's and Parkinson's patterns).

    DATA PACKAGE:
    - ACOUSTIC (Speech/Pause patterns): ${JSON.stringify(data.audioMetrics)}
    - OCULOMOTOR (Eye tracking/Gaze stability): ${JSON.stringify(data.visualMetrics)}
    - LINGUISTIC (Typing cadence/Accuracy): ${JSON.stringify(data.textMetrics)}
    - BEHAVIORAL CONTEXT: ${JSON.stringify(data.behavioralData)}

    DIAGNOSTIC CRITERIA:
    1. Evaluate "Pause-to-Speech" ratio for cognitive load indicators.
    2. Analyze "Gaze Drift" variance for oculomotor circuit stability.
    3. Assessment of "Inter-Keystroke Intervals" for motor tremor indicators.
    
    REQUIRED OUTPUT:
    1. A probabilistic risk category (Low, Moderate, Elevated).
    2. High-fidelity clinical reasoning.
    3. Use Google Search to find and cite 2-3 specific clinical studies or medical journal articles linking these digital patterns to neurological conditions.
    
    Format the response as a strict JSON object.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallRisk: { type: Type.STRING, enum: ['Low', 'Moderate', 'Elevated'] },
            confidence: { type: Type.NUMBER },
            analysis: {
              type: Type.OBJECT,
              properties: {
                speech: { type: Type.STRING },
                visual: { type: Type.STRING },
                cognitive: { type: Type.STRING }
              },
              required: ["speech", "visual", "cognitive"]
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            medicalGrounding: {
              type: Type.STRING,
              description: "Summary of research citations used."
            }
          },
          required: ["overallRisk", "confidence", "analysis", "recommendations", "medicalGrounding"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    const citations = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    return { ...result, citations };
  } catch (error) {
    console.error("Diagnostic engine error:", error);
    throw error;
  }
};
