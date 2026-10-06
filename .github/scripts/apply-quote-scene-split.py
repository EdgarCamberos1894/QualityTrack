from pathlib import Path
import json
import textwrap

section_path = Path('frontend/src/modules/landing/components/QuoteSection.tsx')
source = section_path.read_text(encoding='utf-8')

trace_start_marker = '''        <div\n          className="pointer-events-none absolute inset-0 z-[3] hidden lg:block"\n          aria-hidden="true"\n        >'''
grid_marker = '        <div className="relative z-10 mx-auto grid h-full w-full max-w-[1440px]'
intro_start_marker = '          <div className="order-1 lg:order-2 lg:pl-2">'

trace_start = source.index(trace_start_marker)
grid_start = source.index(grid_marker, trace_start)
intro_start = source.index(intro_start_marker, grid_start)
intro_end = source.index('        </div>\n      </div>\n    </section>', intro_start)

trace_block = source[trace_start:grid_start].rstrip()
intro_block = source[intro_start:intro_end].rstrip()
trace_body = textwrap.dedent(trace_block).strip()
intro_body = textwrap.dedent(intro_block).strip()

trace_component = f'''import {{ rangeProgress }} from '../hooks/usePinnedSectionProgress'\n\ninterface QuoteTraceProps {{\n  entryProgress: number\n  exitProgress: number\n}}\n\nconst quoteEntryPath =\n  'M 900 0 C 895 72, 808 86, 728 126 C 640 169, 575 205, 458 232'\nconst quoteExitPath =\n  'M 360 715 C 360 794, 315 842, 337 890 C 354 928, 337 963, 340 1000'\n\nexport function QuoteTrace({{ entryProgress, exitProgress }}: QuoteTraceProps) {{\n  return (\n{textwrap.indent(trace_body, '    ')}\n  )\n}}\n'''

intro_component = f'''import type {{ LandingStoryStage }} from '../model/landingStory'\n\ninterface QuoteIntroProps {{\n  stage: LandingStoryStage\n  reducedMotion: boolean\n  scrollProgress: number\n  phase: string\n}}\n\nexport function QuoteIntro({{\n  stage,\n  reducedMotion,\n  scrollProgress,\n  phase,\n}}: QuoteIntroProps) {{\n  return (\n{textwrap.indent(intro_body, '    ')}\n  )\n}}\n'''

constants = '''  const quoteEntryPath =\n    'M 900 0 C 895 72, 808 86, 728 126 C 640 169, 575 205, 458 232'\n  const quoteExitPath =\n    'M 360 715 C 360 794, 315 842, 337 890 C 354 928, 337 963, 340 1000'\n\n'''
source = source.replace(constants, '')
source = source.replace(
    "import { QuoteReviewBadge } from './QuoteReviewBadge'\nimport '../quoteSection.css'",
    "import { QuoteIntro } from './QuoteIntro'\nimport { QuoteReviewBadge } from './QuoteReviewBadge'\nimport { QuoteTrace } from './QuoteTrace'\nimport '../quoteSection.css'",
)
source = source.replace(
    trace_block,
    '''        <QuoteTrace entryProgress={entryProgress} exitProgress={exitProgress} />''',
)
source = source.replace(
    intro_block,
    '''          <QuoteIntro\n            stage={stage}\n            reducedMotion={reducedMotion}\n            scrollProgress={scrollProgress}\n            phase={phase}\n          />''',
)

section_path.write_text(source, encoding='utf-8')
Path('frontend/src/modules/landing/components/QuoteTrace.tsx').write_text(
    trace_component,
    encoding='utf-8',
)
Path('frontend/src/modules/landing/components/QuoteIntro.tsx').write_text(
    intro_component,
    encoding='utf-8',
)

baseline_path = Path('frontend/scripts/architecture-baseline.json')
baseline = json.loads(baseline_path.read_text(encoding='utf-8'))
baseline.pop('modules/landing/components/QuoteSection.tsx', None)
baseline_path.write_text(json.dumps(baseline, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
