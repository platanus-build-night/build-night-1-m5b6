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
exports.articleAnalysisWorkflow = void 0;
const core_1 = require("@mastra/core");
const types_1 = require("../types");
const articleAnalyzerAgent_1 = require("../agents/articleAnalyzerAgent");
const analyzeArticleStep = new core_1.Step({
    id: "analyzeArticleStep",
    execute(context) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const article = (_a = context.context.triggerData) === null || _a === void 0 ? void 0 : _a.article;
            if (!article) {
                throw new Error("Article not found in trigger data");
            }
            const result = yield articleAnalyzerAgent_1.articleAnalyzerAgent.generate(`Perform a full analysis (sentiment, topic, digest) of the following article text and report using the tool:
\n---\n${article.content}\n---"`, {
                toolChoice: "required",
            });
            console.log("Analysis Result(Agent):", result);
            return result;
        });
    },
});
exports.articleAnalysisWorkflow = new core_1.Workflow({
    name: "ArticleAnalysisWorkflow",
    triggerSchema: types_1.ArticleAnalysisInputSchema,
    retryConfig: {
        attempts: 1,
    },
});
exports.articleAnalysisWorkflow.step(analyzeArticleStep).commit();
