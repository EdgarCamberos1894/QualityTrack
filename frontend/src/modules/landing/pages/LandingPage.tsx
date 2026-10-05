import { CaseChapter } from '../components/CaseChapter'
import { LandingHeader } from '../components/LandingHeader'
import { QuoteChapter } from '../components/QuoteChapter'
import { ScrollStory } from '../components/ScrollStory'
import '../landing.css'

export function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-[#020617]">
      <LandingHeader />
      <main>
        <ScrollStory />
        <CaseChapter />
        <QuoteChapter />
      </main>
    </div>
  )
}
