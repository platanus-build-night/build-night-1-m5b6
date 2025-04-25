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
    const result = await sentimentAgent.generate(article.content);

    let parsedSentiment = Sentiment.Neutral;
    const resultText = result.text.trim();
    if (Object.values(Sentiment).includes(resultText as Sentiment)) {
      parsedSentiment = resultText as Sentiment;
    } else {
      console.warn(`Sentiment agent returned unexpected text: ${resultText}`);
    }

    console.log('Sentiment analysis result:', parsedSentiment);
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
    if (sentimentResult?.sentiment === undefined) {
      throw new Error('Sentiment not found from previous step');
    }

    const content = sentimentResult.originalArticle.content;
    const result = await topicAgent.generate(content);

    let parsedTopic = Topic.Social;
    const resultText = result.text.trim();
    if (Object.values(Topic).includes(resultText as Topic)) {
      parsedTopic = resultText as Topic;
    } else {
      console.warn(`Topic agent returned unexpected text: ${resultText}`);
    }

    console.log('Topic analysis result:', parsedTopic);
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