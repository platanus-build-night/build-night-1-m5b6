export enum AuthorSource {
  Emol = 'Emol',
  T13 = 'T13',
}

export interface ScrapedArticleDetail {
    url: string;
    title?: string;
    author: AuthorSource;
    publishedDate?: string; 
    content: string; 
  }
  