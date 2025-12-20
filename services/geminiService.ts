
import { GoogleGenAI, Type } from "@google/genai";
import { AssessmentData, DiagnosticReport } from "../types";

export const generateFinalReport = async (data: AssessmentData): Promise<DiagnosticReport & { citations?: any[], isDemo?: boolean }> => {
  const API_KEY = process.env.API_KEY;

  // Fallback if API key is missing to prevent Vercel deployment crashes
  if (!API_KEY || API_KEY === 'undefined' || API_KEY === '') {
    console.warn("NeuroLens: No API Key found. Running in simulation mode.");
    
    // Artificial delay to simulate heavy processing
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    // Updated object to satisfy the DiagnosticReport interface requirements
    return {
      overallRisk: 'Low',
      confidence: 0.92,
      analysis: {
        speech: "SIMULATED: Vocal patterns show standard frequency distribution. No micro-tremors detected in the 50Hz range.",
        visual: "SIMULATED: Gaze tracking stable with standard saccadic latency of 210ms.",
        cognitive: "SIMULATED: Linguistic variability suggests high executive function and working memory stability."
      },
      recommendations: [
        "Continue routine cognitive monitoring.",
        "Maintain current physical activity levels.",
        "Ensure consistent 7-9 hour sleep cycles."
      ],
      medicalGrounding: "DEMO MODE: In a production environment, this analysis is grounded in real-time medical literature via Google Search. Currently displaying baseline metrics.",
      isDemo: true,
      citations: [
        { web: { title: "Standard Cognitive Baselines", uri: "https://example.com/demo" } }
      ]
    };
  }

  // Use the recommended Gemini model for complex reasoning and grounding tasks
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const modelName = "gemini-3-pro-preview";

  const prompt = `
    ACT AS A SENIOR NEUROLOGICAL DIAGNOSTIC AI SYSTEM.
    Analyze the following multimodal digital biomarker data for indicators of neurodegenerative risk (specifically targeting Alzheimer's and Parkinson's patterns).

    DATA PACKAGE:
    - ACOUSTIC (Speech/Pause patterns): ${JSON.stringify(data.audioMetrics)}
    - OCULOMOTOR (Eye tracking/Gaze stability): ${JSON.stringify(data.visualMetrics)}
    - LINGUISTIC (Typing cadence/Accuracy): ${JSON.stringify(data.textMetrics)}
    - BEHAVIORAL CONTEXT: ${JSON.stringify(data.behavioralData)}
    
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
            medicalGrounding: { type: Type.STRING }
          },
          required: ["overallRisk", "confidence", "analysis", "recommendations", "medicalGrounding"]
        }
      }
    });

    // Directly access the text property as per @google/genai guidelines
    const result = JSON.parse(response.text || '{}');
    // Extract search grounding citations if available
    const citations = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    return { ...result, citations, isDemo: false };
  } catch (error) {
    console.error("AI Engine Error:", error);
    throw error;
  }
};
