"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.articleAnalyzerAgent = exports.ArticleAnalysisOutputSchema = void 0;
const core_1 = require("@mastra/core");
const openai_1 = require("@ai-sdk/openai");
const tools_1 = require("@mastra/core/tools");
const zod_1 = require("zod");
const types_1 = require("../../scrapers/types");
const topics = Object.values(types_1.Topic);
const sentiments = Object.values(types_1.Sentiment);
exports.ArticleAnalysisOutputSchema = zod_1.z.object({
    sentiment: zod_1.z.nativeEnum(types_1.Sentiment),
    topic: zod_1.z.nativeEnum(types_1.Topic),
    positivityScore: zod_1.z
        .number()
        .min(1)
        .max(100)
        .int()
        .describe("Una puntuación de 1 a 100 que indica cuán positiva es la noticia. 1 es extremadamente negativa (muerte, tortura, desastre nuclear), 100 es extremadamente positiva (cura del cáncer, paz mundial)."),
    digest: zod_1.z
        .string()
        .min(10)
        .max(150)
        .describe("Un resumen corto, positivo y un tanto esotérico, abstracto o filosófico de la noticia (10-150 caracteres)"),
});
// Define the single tool for structured output
const analysisReportTool = (0, tools_1.createTool)({
    id: "report-analysis-and-digest",
    description: "Reporta el sentimiento, tema, puntuación de positividad y un breve digest del análisis del artículo.",
    inputSchema: exports.ArticleAnalysisOutputSchema,
    execute: (_a) => __awaiter(void 0, [_a], void 0, function* ({ context }) {
        return context;
    }),
});
exports.articleAnalyzerAgent = new core_1.Agent({
    name: "ArticleAnalyzerAgent",
    instructions: `**IMPORTANTE: Debes comunicarte y pensar EXCLUSIVAMENTE en español.**

Eres un analista experto especializado en la interpretación de noticias en español. Tu misión es procesar el contenido del artículo proporcionado y extraer información clave de manera estructurada.

Sigue estos pasos rigurosamente:

1.  **Análisis de Sentimiento**: Evalúa el tono general del artículo y determina si el sentimiento predominante es estrictamente uno de los siguientes: ${sentiments.join(", ")}. Debes ser muy sensible a los detalles y al contexto completo de la noticia. No clasifiques como positiva una noticia que, aunque tenga algún aspecto positivo, describa eventos fundamentalmente negativos (muertes, delitos, desastres, crisis, etc.). Cualquier noticia que mencione eventos negativos debe ser clasificada como negativa o neutra.

2.  **Clasificación Temática**: Identifica el tema central del artículo y clasifícalo obligatoriamente como uno de estos: ${topics.join(", ")}.

3.  **Cálculo de Puntuación de Positividad**: Basándote en el contenido completo, asigna una puntuación de positividad **entera** entre 1 y 100. Evalúa la magnitud e impacto del evento descrito.
    *   **1-20**: Extremadamente negativo (ej: asesinatos múltiples, desastres naturales devastadores, crímenes atroces, guerra nuclear).
    *   **21-40**: Negativo (ej: crisis económica grave, aumento significativo del desempleo, delitos violentos individuales, corrupción grave).
    *   **41-60**: Neutral o Mixto (ej: informes económicos estándar, debates políticos sin agresiones graves, anuncios gubernamentales rutinarios, resultados deportivos estándar).
    *   **61-80**: Positivo (ej: acuerdos diplomáticos menores, recuperación económica leve, avances científicos menores, historias de superación personal).
    *   **81-100**: Extremadamente positivo (ej: cura definitiva de enfermedad grave como el cáncer, consecución de la paz mundial duradera, descubrimientos científicos revolucionarios con impacto global inmediato).
    Sé objetivo y considera el impacto real de la noticia.

4.  **Creación de Digest Esotérico**: Redacta un 'digest' (resumen breve y abstracto) del artículo. Este digest debe cumplir OBLIGATORIAMENTE las siguientes condiciones:
    *   Extensión: Entre 10 y 150 caracteres.
    *   Tono: Positivo o neutro, SIN EXCEPCIÓN, incluso si la noticia original es negativa.
    *   Estilo: Ligeramente abstracto, evocador o filosófico. Evita ser un simple resumen literal o clichés.

**IMPRESCINDIBLE**: Debes utilizar la herramienta \`report-analysis-and-digest\` para entregar tu análisis final. Asegúrate de incluir el sentimiento, el tema, la puntuación de positividad y el digest generado (cumpliendo todas las condiciones) como parámetros en la llamada a la herramienta. No respondas de ninguna otra forma. Tu respuesta final DEBE ser únicamente la llamada a la herramienta.`,
    model: (0, openai_1.openai)("gpt-4.1-nano"),
    tools: { analysisReportTool },
});
