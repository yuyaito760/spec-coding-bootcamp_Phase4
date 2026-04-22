import { createVertex } from "@ai-sdk/google-vertex";

const vertex = createVertex({
  project: "project-c05b16ad-d16c-46e7-bef",
  location: "us-central1",
});

export const geminiModel = vertex("gemini-2.5-flash");