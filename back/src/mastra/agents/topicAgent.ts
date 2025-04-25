import { Agent } from "@mastra/core";
import { openai } from "@ai-sdk/openai";
import { Topic } from "../types";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const topics = Object.values(Topic);

const topicOutputTool = createTool({
  id: "categorize-topic",
  description: "Categorize and report the topic of the provided text",
  inputSchema: z.object({
    topic: z.nativeEnum(Topic).describe(`The topic of the text (${topics.join(", ")})`),
  }),
  outputSchema: z.object({
    topic: z.nativeEnum(Topic).describe(`The topic of the text (${topics.join(", ")})`),
  }),
  execute: async ({ context }) => {
    return {
      topic: context.topic,
    };
  },
}); 

export const topicAgent = new Agent({
  name: "TopicAgent",
  instructions: `You are an agent that analyzes text content and determines its main topic.
Analyze the provided text and categorize it into one of the following topics: ${topics.join(", ")}.
Always use the categorize-topic tool to provide your final answer, passing the topic you identified.`,
  model: openai("gpt-4o-mini"),
  tools: { topicOutputTool },
});
