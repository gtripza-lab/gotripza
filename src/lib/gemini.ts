import "server-only";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const apiKey =
  process.env.GEMINI_API_KEY ?? process.env.NEXT_PUBLIC_GEMINI_API_KEY;
if (!apiKey) {
  console.warn("[gemini] GEMINI_API_KEY is not set");
}

const genAI = new GoogleGenerativeAI(apiKey ?? "");
const MODEL_ID = "gemini-1.5-flash";
