from pathlib import Path
import json
import textwrap

section_path = Path('frontend/src/modules/landing/components/CaseSection.tsx')
source = section_path.read_text(encoding='utf-8')

trace_start_marker = '''        <div\n          className="pointer-events-none absolute inset-0 z-[4] hidden lg:block"\n          aria-hidden="true"\n        >'''
grid_marker = '        <div className="relative z-10 mx-auto grid h-full w-full max-w-[1440px]'
intro_start_marker = '          <div className="order-1 lg:pr-4">'
scene_start_marker = '          <div className="order-2 min-h-0 lg:order-2">'

trace_start = source.index(trace_start_marker)
grid_start = source.index(grid_marker, trace_start)
intro_start = source.index(intro_start_marker, grid_start)
scene_start = source.index(scene_start_marker, intro_start)

trace_block = source[trace_start:grid_start].rstrip()
intro_block = source[intro_start:scene_start].rstrip()
trace_body = textwrap.dedent(trace_block).strip()
intro_body = textwrap.dedent(intro_block).strip()

trace_component = f'''import {{ rangeProgress }} from '../hooks/usePinnedSectionProgress'\n\ninterface CaseTraceProps {{\n  exitProgress: number\n}}\n\nconst quoteHandoffPath = 'M 950 900 C 956 940, 924 970, 900 1000'\n\nexport function CaseTrace({{ exitProgress }}: CaseTraceProps) {{\n  return (\n{textwrap.indent(trace_body, '    ')}\n  )\n}}\n'''

intro_component = f'''import type {{ LandingStoryStage }} from '../model/landingStory'\n\ninterface CaseIntroProps {{\n  stage: LandingStoryStage\n  reducedMotion: boolean\n  scrollProgress: number\n  phase: string\n}}\n\nexport function CaseIntro({{\n  stage,\n  reducedMotion,\n  scrollProgress,\n  phase,\n}}: CaseIntroProps) {{\n  return (\n{textwrap.indent(intro_body, '    ')}\n  )\n}}\n'''

source = source.replace(
    "  const quoteHandoffPath = 'M 950 900 C 956 940, 924 970, 900 1000'\n\n",
    '',
)
source = source.replace(
    "import type { LandingStoryStage } from '../model/landingStory'\nimport '../caseSection.css'",
    "import type { LandingStoryStage } from '../model/landingStory'\nimport { CaseIntro } from './CaseIntro'\nimport { CaseTrace } from './CaseTrace'\nimport '../caseSection.css'",
)
source = source.replace(trace_block, '        <CaseTrace exitProgress={exitProgress} />')
source = source.replace(
    intro_block,
    '''          <CaseIntro\n            stage={stage}\n            reducedMotion={reducedMotion}\n            scrollProgress={scrollProgress}\n            phase={phase}\n          />''',
)

section_path.write_text(source, encoding='utf-8')
Path('frontend/src/modules/landing/components/CaseTrace.tsx').write_text(trace_component, encoding='utf-8')
Path('frontend/src/modules/landing/components/CaseIntro.tsx').write_text(intro_component, encoding='utf-8')

baseline_path = Path('frontend/scripts/architecture-baseline.json')
baseline = json.loads(baseline_path.read_text(encoding='utf-8'))
baseline.pop('modules/landing/components/CaseSection.tsx', None)
baseline_path.write_text(json.dumps(baseline, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
