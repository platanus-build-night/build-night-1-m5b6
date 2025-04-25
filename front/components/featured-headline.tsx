interface FeaturedHeadlineProps {
  headline: string
  digest: string
}

export default function FeaturedHeadline({ headline, digest }: FeaturedHeadlineProps) {
  return (
    <div className="w-full bg-gray-50 dark:bg-gray-900 py-10 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-3xl md:text-4xl font-serif mb-4 leading-tight">{headline}</h2>
          <p className="text-lg md:text-xl font-serif text-gray-600 dark:text-gray-300 max-w-2xl">{digest}</p>
        </div>
      </div>
    </div>
  )
}
