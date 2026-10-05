import { CaseChapter } from '../components/CaseChapter'
import { DeliveryChapter } from '../components/DeliveryChapter'
import { FinalCta } from '../components/FinalCta'
import { LandingHeader } from '../components/LandingHeader'
import { ProductionChapter } from '../components/ProductionChapter'
import { QualityChapter } from '../components/QualityChapter'
import { QuoteChapter } from '../components/QuoteChapter'
import { ScrollStory } from '../components/ScrollStory'
import { WorkOrderChapter } from '../components/WorkOrderChapter'
import '../landing.css'

export function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-[#020617]">
      <LandingHeader />
      <main>
        <ScrollStory />
        <CaseChapter />
        <QuoteChapter />
        <WorkOrderChapter />
        <ProductionChapter />
        <QualityChapter />
        <DeliveryChapter />
        <FinalCta />
      </main>
    </div>
  )
}
