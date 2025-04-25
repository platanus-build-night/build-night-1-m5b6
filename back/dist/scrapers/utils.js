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
exports.generateAndAddAnalysisToArticle = void 0;
const articleAnalyzerAgent_1 = require("../mastra/agents/articleAnalyzerAgent");
const generateAndAddAnalysisToArticle = (article) => __awaiter(void 0, void 0, void 0, function* () {
    const agentResult = yield articleAnalyzerAgent_1.articleAnalyzerAgent.generate(`Perform a full analysis (sentiment, topic, digest) of the following article text and report using the tool:
\n---\n${article.content}\n---"`, {
        toolChoice: "required",
        maxRetries: 0,
        maxSteps: 1,
    });
    const toolResult = agentResult.toolResults[0].result;
    return Object.assign(Object.assign({}, article), { sentiment: toolResult.sentiment, topic: toolResult.topic, digest: toolResult.digest });
});
exports.generateAndAddAnalysisToArticle = generateAndAddAnalysisToArticle;
