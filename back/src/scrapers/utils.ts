import { articleAnalyzerAgent } from "../mastra/agents/articleAnalyzerAgent";
import { ScrapedArticleDetail } from "./types";

export const generateAndAddAnalysisToArticle = async (
  article: ScrapedArticleDetail
) => {
  const agentResult = await articleAnalyzerAgent.generate(
    `Realiza un análisis completo (sentimiento, tema, puntuación de positividad, digest) del siguiente texto del artículo y repórtalo usando la herramienta:
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
    positivityScore: toolResult.positivityScore,
    digest: toolResult.digest,
  };
};
