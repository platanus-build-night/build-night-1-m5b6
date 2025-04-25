export interface Article {
  id: string
  title: string
  summary: string
  content: string
  date: string
  imageUrl?: string
}

export interface Category {
  id: string
  name: string
  gradient: string
  icon?: string
  articles: Article[]
}

export interface FeaturedHeadline {
  headline: string
  digest: string
}
