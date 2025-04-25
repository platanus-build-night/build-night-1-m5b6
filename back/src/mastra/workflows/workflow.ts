import { Step, Workflow } from '@mastra/core';
import { z } from 'zod';
import {
  ArticleAnalysisInputSchema,
  Sentiment,
  Topic,
  ArticleAnalysisOutput,
} from '../types';
import { sentimentAgent } from '../agents/sentimentAgent';
import { topicAgent } from '../agents/topicAgent';
import { ScrapedArticleDetail } from '../../scrapers/types'; // Added for type safety

// Define the shape of the trigger data using the Zod schema
type TriggerData = z.infer<typeof ArticleAnalysisInputSchema>;

// Define the output type for sentiment step
interface SentimentStepOutput {
  sentiment: Sentiment;
  originalArticle: ScrapedArticleDetail;
}

const sentimentStep = new Step({
  id: 'sentimentStep',
  async execute(context: any) {
    const article = context.context.triggerData?.article;
    if (!article) {
      throw new Error('Article not found in trigger data');
    }
    
    // Prompt the agent to analyze sentiment and use the tool
    const result = await sentimentAgent.generate(
      `Analyze the sentiment of this text and use the analyze-sentiment tool to report your findings: ${article.content}`
    );

    console.log('Sentiment analysis result:', result);
    
    // Extract sentiment from the tool usage or text
    let parsedSentiment = Sentiment.Neutral;
    
    // Try to find sentiment in tool results if available
    if (result.toolResults && result.toolResults.length > 0) {
      const sentimentToolResult = result.toolResults.find(r => r.toolName === "analyze-sentiment");
      if (sentimentToolResult && sentimentToolResult.result?.sentiment) {
        parsedSentiment = sentimentToolResult.result.sentiment as Sentiment;
      }
    } 
    // Fallback to parsing from text response
    else if (result.text) {
      const text = result.text.toLowerCase();
      if (text.includes('positive')) {
        parsedSentiment = Sentiment.Positive;
      } else if (text.includes('negative')) {
        parsedSentiment = Sentiment.Negative;
      }
    }

    return {
      sentiment: parsedSentiment,
      originalArticle: article,
    };
  },
});

// Define the topic analysis step
const topicStep = new Step({
  id: 'topicStep',
  async execute(context: any) {
    const sentimentResult = context.context.getStepResult('sentimentStep') as SentimentStepOutput;

    if (!sentimentResult?.originalArticle?.content) {
      throw new Error('Article content not found from previous step');
    }
    
    // Prompt the agent to categorize the topic and use the tool
    const result = await topicAgent.generate(
      `Categorize the topic of this text and use the categorize-topic tool to report your findings: ${sentimentResult.originalArticle.content}`
    );
    
    console.log('Topic analysis result:', result);
    
    // Extract topic from the tool usage or text
    let parsedTopic = Topic.Social;
    
    // Try to find topic in tool results if available
    if (result.toolResults && result.toolResults.length > 0) {
      const topicToolResult = result.toolResults.find(r => r.toolName === "categorize-topic");
      if (topicToolResult && topicToolResult.result?.topic) {
        parsedTopic = topicToolResult.result.topic as Topic;
      }
    }
    // Fallback to parsing from text response
    else if (result.text) {
      const text = result.text.toLowerCase();
      for (const topic of Object.values(Topic)) {
        if (text.includes(topic.toLowerCase())) {
          parsedTopic = topic;
          break;
        }
      }
    }

    return {
      sentiment: sentimentResult.sentiment,
      topic: parsedTopic,
    };
  },
});

// Define the workflow, providing the Zod schema
export const articleAnalysisWorkflow = new Workflow({
  name: 'ArticleAnalysisWorkflow',
  triggerSchema: ArticleAnalysisInputSchema, // Pass the Zod schema object
});

// Chain the steps sequentially
articleAnalysisWorkflow.step(sentimentStep).then(topicStep).commit();

// Example usage (remove or adapt for your actual use case):
/*
async function runExample() {
  const { runId, start } = articleAnalysisWorkflow.createRun();

  const exampleArticle: ScrapedArticleDetail = {
    url: 'http://example.com',
    title: 'Example Article',
    content: 'This is a test article about technology and science. It feels positive.'
  };

  try {
    const res = await start({
      triggerData: { article: exampleArticle },
    });
    console.log('Workflow Results:', res.results);
    // Expected output structure in res.results: { sentiment: Sentiment.Positive, topic: Topic.Technology | Topic.Science }
  } catch (error) {
    console.error('Workflow failed:', error);
  }
}

runExample();
*/ 