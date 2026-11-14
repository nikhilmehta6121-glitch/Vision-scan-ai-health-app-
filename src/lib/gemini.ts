import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client with secure environment variable
const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

// Supported, verified model alias
export const GEMINI_MODEL = "gemini-2.5-flash";

export type GeminiErrorCategory = 
  | "AUTH_ERROR" 
  | "QUOTA_ERROR" 
  | "NETWORK_ERROR" 
  | "IMAGE_FORMAT_ERROR" 
  | "SERVER_ERROR" 
  | "UNKNOWN_ERROR";

export interface GeminiApiLog {
  timestamp: string;
  feature: string;
  model: string;
  status: "SUCCESS" | "FAILED";
  errorCategory?: GeminiErrorCategory;
  message?: string;
}

// Developer-side audit logs (Zero sensitive credentials)
const apiLogs: GeminiApiLog[] = [];

export function logGeminiApiCall(
  feature: string,
  status: "SUCCESS" | "FAILED",
  errorCategory?: GeminiErrorCategory,
  message?: string
) {
  const entry: GeminiApiLog = {
    timestamp: new Date().toISOString(),
    feature,
    model: GEMINI_MODEL,
    status,
    errorCategory,
    message,
  };
  apiLogs.push(entry);
  if (apiLogs.length > 50) apiLogs.shift();
  // Safe developer logging (never logs API keys, passwords, or image buffers)
  if (status === "FAILED") {
    console.warn(`[Gemini Diagnostics] ${feature} failed (${errorCategory}): ${message}`);
  }
}

export function getGeminiDiagnosticsLogs(): GeminiApiLog[] {
  return [...apiLogs];
}

// Helper to normalize base64: strip any 'data:image/...;base64,' prefix
export function sanitizeBase64(rawBase64: string): { cleanBase64: string; detectedMime: string } {
  let cleanBase64 = rawBase64.trim();
  let detectedMime = "image/jpeg";

  const prefixMatch = cleanBase64.match(/^data:([^;]+);base64,/);
  if (prefixMatch) {
    detectedMime = prefixMatch[1];
    cleanBase64 = cleanBase64.substring(prefixMatch[0].length);
  }

  // Remove whitespace or linebreaks
  cleanBase64 = cleanBase64.replace(/\s/g, "");
  return { cleanBase64, detectedMime };
}

// Translate raw Gemini error into user-friendly message & category
export function categorizeGeminiError(err: any): { category: GeminiErrorCategory; userMessage: string } {
  const errMsg = err?.message ? String(err.message).toLowerCase() : "";
  const errStatus = err?.status || err?.statusCode || 0;

  if (errMsg.includes("api_key") || errMsg.includes("api key") || errMsg.includes("unauthorized") || errStatus === 401 || errStatus === 403) {
    return {
      category: "AUTH_ERROR",
      userMessage: "AI service configuration error.",
    };
  }

  if (errMsg.includes("quota") || errMsg.includes("rate limit") || errMsg.includes("resource_exhausted") || errStatus === 429) {
    return {
      category: "QUOTA_ERROR",
      userMessage: "AI scan limit reached. Please try again later.",
    };
  }

  if (errMsg.includes("network") || errMsg.includes("fetch failed") || errMsg.includes("failed to fetch") || errMsg.includes("offline") || errMsg.includes("socket")) {
    return {
      category: "NETWORK_ERROR",
      userMessage: "Internet connection problem. Please try again.",
    };
  }

  if (errMsg.includes("image") || errMsg.includes("base64") || errMsg.includes("mime") || errMsg.includes("invalid argument")) {
    return {
      category: "IMAGE_FORMAT_ERROR",
      userMessage: "Please upload a clearer image.",
    };
  }

  if (errStatus >= 500 || errMsg.includes("internal") || errMsg.includes("unavailable")) {
    return {
      category: "SERVER_ERROR",
      userMessage: "AI service temporarily unavailable.",
    };
  }

  return {
    category: "UNKNOWN_ERROR",
    userMessage: "AI service temporarily unavailable.",
  };
}

// Safe Single-Retry Helper
async function executeWithSingleRetry<T>(
  feature: string,
  operation: () => Promise<T>
): Promise<T> {
  try {
    const result = await operation();
    logGeminiApiCall(feature, "SUCCESS");
    return result;
  } catch (firstErr: any) {
    const { category, userMessage } = categorizeGeminiError(firstErr);
    
    // If it's a transient network or server error, wait 1.2s and retry ONCE
    if (category === "NETWORK_ERROR" || category === "SERVER_ERROR") {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        const retryResult = await operation();
        logGeminiApiCall(feature, "SUCCESS", undefined, "Succeeded on retry 1");
        return retryResult;
      } catch (retryErr: any) {
        const finalError = categorizeGeminiError(retryErr);
        logGeminiApiCall(feature, "FAILED", finalError.category, retryErr.message);
        throw new Error(finalError.userMessage);
      }
    }

    logGeminiApiCall(feature, "FAILED", category, firstErr.message);
    throw new Error(userMessage);
  }
}

// 1. Image Analysis (Multimodal Gemini Vision)
export async function analyzeImage(
  base64Data: string,
  mimeType: string,
  prompt: string
): Promise<string> {
  const { cleanBase64, detectedMime } = sanitizeBase64(base64Data);
  const effectiveMime = mimeType || detectedMime;

  return executeWithSingleRetry("analyzeImage", async () => {
    const contents = [
      {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: effectiveMime,
            },
          },
          { text: prompt },
        ],
      },
    ];

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: contents,
    });

    return response.text || "No analysis generated.";
  });
}

// 2. Chat with Image Context
export async function chatWithImage(
  base64Data: string,
  mimeType: string,
  question: string,
  previousContext: string
): Promise<string> {
  const { cleanBase64, detectedMime } = sanitizeBase64(base64Data);
  const effectiveMime = mimeType || detectedMime;

  return executeWithSingleRetry("chatWithImage", async () => {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          parts: [
            { inlineData: { data: cleanBase64, mimeType: effectiveMime } },
            { text: `Context from previous analysis: ${previousContext}\n\nUser Question: ${question}` },
          ],
        },
      ],
    });

    return response.text || "I couldn't find an answer to that.";
  });
}

// 3. Text-Only Health Consultation (Strictly Non-Medical)
export async function askGeminiText(
  prompt: string,
  systemInstruction?: string
): Promise<string> {
  return executeWithSingleRetry("askGeminiText", async () => {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: systemInstruction ? { systemInstruction } : undefined,
    });

    return response.text || "";
  });
}
