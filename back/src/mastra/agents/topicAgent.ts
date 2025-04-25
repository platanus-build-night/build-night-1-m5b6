import { Agent } from "@mastra/core";
import { openai } from "@ai-sdk/openai";
import { Topic } from "../types";

const topics = Object.values(Topic);

export const topicAgent = new Agent({
  name: "TopicAgent",
  instructions: `You are an agent that analyzes text content and determines its main topic. Respond ONLY with one of the following words: ${topics.join(
    ", "
  )}.`,
  model: openai("gpt-4.1-nano"), 
});
