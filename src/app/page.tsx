import { HeroSection } from '@/sections/HeroSection'
import { CategoryCircles } from '@/components/CategoryCircles'
import { NewArrivalsSection } from '@/sections/NewArrivalsSection'
import { ElegantCategoriesSection } from '@/sections/ElegantCategoriesSection'
import { MissionValuesVisionSection } from '@/sections/MissionValuesVisionSection'
import { TestimonialsSection } from '@/sections/TestimonialsSection'
import { NewsletterSection } from '@/sections/NewsletterSection'

export default function Home() {
  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      <HeroSection />
      <CategoryCircles />
      <NewArrivalsSection />
      <ElegantCategoriesSection />
      <MissionValuesVisionSection />
      <TestimonialsSection />
      <NewsletterSection />
    </main>
  )
}
