import { articleAnalyzerAgent } from "../mastra/agents/articleAnalyzerAgent";
import { ScrapedArticleDetail } from "./types";

export const generateAndAddAnalysisToArticle = async (
  article: ScrapedArticleDetail
) => {
  const agentResult = await articleAnalyzerAgent.generate(
    `Perform a full analysis (sentiment, topic, digest) of the following article text and report using the tool:
\n---\n${article.content}\n---"`,
    {
      toolChoice: "required",
      maxRetries: 0,
      maxSteps: 1,
      temperature: 0.4,
    }
  );
  const toolResult = agentResult.toolResults[0].result;
  return {
    ...article,
    sentiment: toolResult.sentiment,
    topic: toolResult.topic,
    digest: toolResult.digest,
  };
};
