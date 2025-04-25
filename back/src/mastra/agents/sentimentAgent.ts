import { Agent } from '@mastra/core';
import { openai } from '@ai-sdk/openai';
import { Sentiment } from '../types';

export const sentimentAgent = new Agent({
  name: 'SentimentAgent',
  instructions: `You are an agent that analyzes text content and determines its overall sentiment. Respond ONLY with one of the following words: ${Object.values(Sentiment).join(', ')}.`,
  model: openai('gpt-4.1-nano'), 
}); 