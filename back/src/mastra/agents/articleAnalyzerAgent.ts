import { Agent } from "@mastra/core";
import { openai } from "@ai-sdk/openai";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { ScrapedArticleDetail, Sentiment, Topic } from "../../scrapers/types";

const topics = Object.values(Topic);
const sentiments = Object.values(Sentiment);

export const ArticleAnalysisOutputSchema = z.object({
  sentiment: z.nativeEnum(Sentiment),
  topic: z.nativeEnum(Topic),
  digest: z
    .string()
    .min(10)
    .max(150)
    .describe(
      "Un resumen corto, positivo y esotérico de la noticia (10-150 caracteres)"
    ),
});

export interface ArticleAnalysisInput {
  article: ScrapedArticleDetail;
}

export interface ArticleAnalysisOutput {
  sentiment: Sentiment;
  topic: Topic;
  digest: string;
}

// Define the single tool for structured output
const analysisReportTool = createTool({
  id: "report-analysis-and-digest",
  description:
    "Reporta el sentimiento, tema y un breve digest del análisis del artículo.",
  inputSchema: ArticleAnalysisOutputSchema,
  execute: async ({ context }) => {
    return context;
  },
});

export const articleAnalyzerAgent = new Agent({
  name: "ArticleAnalyzerAgent",
  instructions: `Eres un analista experto especializado en la interpretación de noticias. Tu misión es procesar el contenido del artículo proporcionado y extraer información clave de manera estructurada.

Sigue estos pasos rigurosamente:

1.  **Análisis de Sentimiento**: Evalúa el tono general del artículo y determina si el sentimiento predominante es estrictamente uno de los siguientes: ${sentiments.join(
    ", "
  )}.
  Debes ser muy sensible a los detalles de la noticia y no clasificarla como positiva si en realidad es negativa o neutra. Ejemplos de noticias negativas son aquellas que incluyen datos de muertes, desastres, robos, delitos, etc. Cualquier noticia que mencione cosas malas o negativas debe ser clasificada como negativa o neutra.

2.  **Clasificación Temática**: Identifica el tema central del artículo y clasifícalo obligatoriamente como uno de estos: ${topics.join(
    ", "
  )}.
3.  **Creación de Digest Esotérico**: Redacta un 'digest' (resumen breve y abstracto) del artículo. Este digest debe cumplir OBLIGATORIAMENTE las siguientes condiciones:
    *   Extensión: Entre 10 y 150 caracteres.
    *   Tono: Positivo o neutro, SIN EXCEPCIÓN, incluso si la noticia original es negativa.
    *   Estilo: Ligeramente abstracto, evocador o esotérico. Evita ser un simple resumen literal.

**IMPRESCINDIBLE**: Debes utilizar la herramienta \`report-analysis-and-digest\` para entregar tu análisis final. Asegúrate de incluir el sentimiento, el tema y el digest generado (cumpliendo todas las condiciones) como parámetros en la llamada a la herramienta. No respondas de ninguna otra forma.`,
  model: openai("gpt-4.1-mini"), // Use a capable model
  tools: { analysisReportTool },
});
