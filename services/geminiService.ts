
import { GoogleGenAI, Type } from "@google/genai";
import { AssessmentData, DiagnosticReport } from "../types";

const API_KEY = process.env.API_KEY || '';

export const generateFinalReport = async (data: AssessmentData): Promise<DiagnosticReport> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const prompt = `
    Perform a professional cognitive wellness assessment based on the following multimodal data.
    The goal is to identify patterns consistent with early-stage neurodegenerative risk (Alzheimer's, Parkinson's).
    Do NOT provide a clinical diagnosis. Use cautious, probabilistic language.
    
    Data:
    - Audio/Speech: ${JSON.stringify(data.audioMetrics)}
    - Visual/Motor: ${JSON.stringify(data.visualMetrics)}
    - Text/Writing: ${JSON.stringify(data.textMetrics)}
    - Cognitive Micro-tests: ${JSON.stringify(data.cognitiveScores)}
    - Lifestyle Context: ${JSON.stringify(data.behavioralData)}
    
    Output JSON format only.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
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
            }
          },
          required: ["overallRisk", "confidence", "analysis", "recommendations"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Failed to generate report:", error);
    throw error;
  }
};

// Helpers for Live API (abstracted for the component usage)
export const decodeBase64Audio = (base64: string) => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const encodeAudioToBlob = (data: Float32Array) => {
  const int16 = new Int16Array(data.length);
  for (let i = 0; i < data.length; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: btoa(String.fromCharCode(...new Uint8Array(int16.buffer))),
    mimeType: 'audio/pcm;rate=16000',
  };
};
