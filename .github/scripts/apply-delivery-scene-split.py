from pathlib import Path
import json
import textwrap

section_path = Path('frontend/src/modules/landing/components/DeliverySection.tsx')
source = section_path.read_text(encoding='utf-8')

trace_start_marker = '''        <div\n          className="pointer-events-none absolute inset-0 z-[3] hidden lg:block"\n          aria-hidden="true"\n        >'''
grid_marker = '        <div className="relative z-10 mx-auto grid h-full w-full max-w-[1440px]'
intro_start_marker = '          <div className="order-1 lg:pr-4">'
scene_start_marker = '          <div className="order-2 min-h-0">'

trace_start = source.index(trace_start_marker)
grid_start = source.index(grid_marker, trace_start)
intro_start = source.index(intro_start_marker, grid_start)
scene_start = source.index(scene_start_marker, intro_start)

trace_block = source[trace_start:grid_start].rstrip()
intro_block = source[intro_start:scene_start].rstrip()
trace_body = textwrap.dedent(trace_block).strip()
intro_body = textwrap.dedent(intro_block).strip()

trace_component = f'''import {{ rangeProgress }} from '../hooks/usePinnedSectionProgress'\n\ninterface DeliveryTraceProps {{\n  entryProgress: number\n}}\n\nconst entryPath =\n  'M 760 0 C 760 72, 727 98, 713 144 C 698 194, 718 219, 716 252'\n\nexport function DeliveryTrace({{ entryProgress }}: DeliveryTraceProps) {{\n  return (\n{textwrap.indent(trace_body, '    ')}\n  )\n}}\n'''

intro_component = f'''import type {{ CSSProperties }} from 'react'\nimport type {{ LandingStoryStage }} from '../model/landingStory'\n\ninterface DeliveryIntroProps {{\n  stage: LandingStoryStage\n  reducedMotion: boolean\n  scrollProgress: number\n  phase: string\n  reveal: (start: number, end: number, distance?: number) => CSSProperties\n}}\n\nexport function DeliveryIntro({{\n  stage,\n  reducedMotion,\n  scrollProgress,\n  phase,\n  reveal,\n}}: DeliveryIntroProps) {{\n  return (\n{textwrap.indent(intro_body, '    ')}\n  )\n}}\n'''

constants = '''  const entryPath =\n    'M 760 0 C 760 72, 727 98, 713 144 C 698 194, 718 219, 716 252'\n\n'''
source = source.replace(constants, '')
source = source.replace(
    "import type { LandingStoryStage } from '../model/landingStory'\nimport '../deliverySection.css'",
    "import type { LandingStoryStage } from '../model/landingStory'\nimport { DeliveryIntro } from './DeliveryIntro'\nimport { DeliveryTrace } from './DeliveryTrace'\nimport '../deliverySection.css'",
)
source = source.replace(
    trace_block,
    '''        <DeliveryTrace entryProgress={entryProgress} />''',
)
source = source.replace(
    intro_block,
    '''          <DeliveryIntro\n            stage={stage}\n            reducedMotion={reducedMotion}\n            scrollProgress={scrollProgress}\n            phase={phase}\n            reveal={reveal}\n          />''',
)

section_path.write_text(source, encoding='utf-8')
Path('frontend/src/modules/landing/components/DeliveryTrace.tsx').write_text(trace_component, encoding='utf-8')
Path('frontend/src/modules/landing/components/DeliveryIntro.tsx').write_text(intro_component, encoding='utf-8')

baseline_path = Path('frontend/scripts/architecture-baseline.json')
baseline = json.loads(baseline_path.read_text(encoding='utf-8'))
baseline.pop('modules/landing/components/DeliverySection.tsx', None)
baseline_path.write_text(json.dumps(baseline, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
