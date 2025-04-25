import { Step, Workflow } from "@mastra/core";
import { z } from "zod";
import { ArticleAnalysisInputSchema, Sentiment, Topic } from "../types";
import {
  ArticleAnalysisOutput,
  ArticleAnalysisOutputSchema,
  articleAnalyzerAgent,
} from "../agents/articleAnalyzerAgent";
import { ScrapedArticleDetail } from "../../scrapers/types";

const analyzeArticleStep = new Step({
  id: "analyzeArticleStep",
  async execute(context: any) {
    const article = context.context.triggerData?.article;
    if (!article) {
      throw new Error("Article not found in trigger data");
    }

    const result = await articleAnalyzerAgent.generate(
      `Perform a full analysis (sentiment, topic, digest) of the following article text and report using the tool:
\n---\n${article.content}\n---"`,
      {
        toolChoice: "required",
      }
    );

    console.log("Analysis Result(Agent):", result);
    return result;
  },
});

export const articleAnalysisWorkflow = new Workflow({
  name: "ArticleAnalysisWorkflow",
  triggerSchema: ArticleAnalysisInputSchema,
  retryConfig: {
    attempts: 1,
  },
});

articleAnalysisWorkflow.step(analyzeArticleStep).commit();
