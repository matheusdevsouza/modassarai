import { HeroSection } from '@/sections/HeroSection'
import { NewArrivalsSection } from '@/sections/NewArrivalsSection'
import { ElegantCategoriesSection } from '@/sections/ElegantCategoriesSection'
import { TestimonialsSection } from '@/sections/TestimonialsSection'
import { NewsletterSection } from '@/sections/NewsletterSection'
export default function Home() {
  return (
    <main className="min-h-screen bg-sand-100 overflow-x-hidden">
      <HeroSection />
      <NewArrivalsSection />
      <ElegantCategoriesSection />
      <TestimonialsSection />
      <NewsletterSection />
    </main>
  )
}
