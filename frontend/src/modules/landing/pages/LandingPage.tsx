import { LandingAudiences } from '../components/LandingAudiences'
import { LandingCapabilities } from '../components/LandingCapabilities'
import { LandingFinalCta } from '../components/LandingFinalCta'
import { LandingHeader } from '../components/LandingHeader'
import { ScrollStory } from '../components/ScrollStory'
import '../landing.css'

export function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-[#020617]">
      <LandingHeader />
      <main>
        <ScrollStory />
        <LandingCapabilities />
        <LandingAudiences />
        <LandingFinalCta />
      </main>
    </div>
  )
}
