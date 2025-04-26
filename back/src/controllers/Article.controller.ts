import { JsonController, Get } from "routing-controllers";
import { getArticleRepository } from "../data-source";
import { Article } from "../models/articles.model";

@JsonController("/articles")
export class ArticleController {
  @Get()
  async getAllArticles() {
    try {
      const articleRepository = getArticleRepository();
      const articles = await articleRepository.find();
      console.log(`Retrieved ${articles.length} articles.`);

      return { total: articles.length, articles };
    } catch (error) {
      console.error("Error retrieving articles:", error);
      throw new Error("Failed to retrieve articles");
    }
  }
}
