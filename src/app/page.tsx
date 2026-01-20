import { HeroSection } from '@/sections/HeroSection'
import { PromotionalBannerSection } from '@/sections/PromotionalBannerSection'
import { CategoryCardsSection } from '@/sections/CategoryCardsSection'
import { MasonryCollectionSection } from '@/sections/MasonryCollectionSection'
import { ProductShowcase } from '@/sections/ProductShowcase'
import { NewsletterSection } from '@/sections/NewsletterSection'

export default function Home() {
  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      <HeroSection />

      <CategoryCardsSection />

      <ProductShowcase
        title="Mais Vendidos"
        subtitle="As peças favoritas da nossa comunidade"
        apiFilters={{ is_bestseller: true, limit: 10 }}
        link="/produtos?sort=bestsellers"
        priority={true}
      />

      <MasonryCollectionSection />

      <ProductShowcase
        title="Ofertas Relâmpago"
        subtitle="Aproveite preços especiais por tempo limitado"
        apiFilters={{ is_promotion: true, limit: 10 }} // Assuming 'is_promotion' or similar flag exists, or we use price logic
        link="/produtos?promotion=true"
      />

      <PromotionalBannerSection />

      <NewsletterSection />
    </main>
  )
}
