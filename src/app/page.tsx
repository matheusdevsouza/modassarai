import { HeroSection } from '@/sections/HeroSection'
import { NewArrivalsSection } from '@/sections/NewArrivalsSection'
import { ElegantCategoriesSection } from '@/sections/ElegantCategoriesSection'
import { MissionValuesVisionSection } from '@/sections/MissionValuesVisionSection'
import { TestimonialsSection } from '@/sections/TestimonialsSection'
import { NewsletterSection } from '@/sections/NewsletterSection'
export default function Home() {
  return (
    <main className="min-h-screen bg-sand-100 overflow-x-hidden">
      <HeroSection />
      <NewArrivalsSection />
      <ElegantCategoriesSection />
      <MissionValuesVisionSection />
      <TestimonialsSection />
      <NewsletterSection />
    </main>
  )
}
