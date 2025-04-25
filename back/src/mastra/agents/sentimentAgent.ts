import { Agent } from '@mastra/core';
import { openai } from '@ai-sdk/openai';
import { Sentiment } from '../types';
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const sentimentOutputTool = createTool({
  id: "analyze-sentiment",
  description: "Analyze and report the sentiment of the provided text",
  inputSchema: z.object({
    sentiment: z.nativeEnum(Sentiment).describe("The sentiment of the text (Positive, Negative, or Neutral)"),
  }),
  outputSchema: z.object({
    sentiment: z.nativeEnum(Sentiment).describe("The sentiment of the text (Positive, Negative, or Neutral)"),
  }),
  execute: async ({ context }) => {
    return {
      sentiment: context.sentiment,
    };
  },
});

export const sentimentAgent = new Agent({
  name: 'SentimentAgent',
  instructions: `You are an agent that analyzes text content and determines its overall sentiment. 
Analyze the provided text and determine whether the sentiment is Positive, Negative, or Neutral.
Always use the analyze-sentiment tool to provide your final answer, passing the sentiment you detected.`,
  model: openai('gpt-4o-mini'),
  tools: { sentimentOutputTool },
}); 