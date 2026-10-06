from pathlib import Path
import json
import textwrap

section_path = Path('frontend/src/modules/landing/components/WorkOrderSection.tsx')
source = section_path.read_text(encoding='utf-8')

trace_start_marker = '''        <div\n          className="pointer-events-none absolute inset-0 z-[3] hidden lg:block"\n          aria-hidden="true"\n        >'''
grid_marker = '        <div className="relative z-10 mx-auto grid h-full w-full max-w-[1440px]'
intro_start_marker = '          <div className="order-1 lg:pr-3">'
scene_start_marker = '          <div className="order-2 min-h-0">'

trace_start = source.index(trace_start_marker)
grid_start = source.index(grid_marker, trace_start)
intro_start = source.index(intro_start_marker, grid_start)
scene_start = source.index(scene_start_marker, intro_start)

trace_block = source[trace_start:grid_start].rstrip()
intro_block = source[intro_start:scene_start].rstrip()
trace_body = textwrap.dedent(trace_block).strip()
intro_body = textwrap.dedent(intro_block).strip()

trace_component = f'''import {{ rangeProgress }} from '../hooks/usePinnedSectionProgress'\n\ninterface WorkOrderTraceProps {{\n  entryProgress: number\n  exitProgress: number\n}}\n\nconst entryPath =\n  'M 340 0 C 342 70, 420 88, 492 126 C 560 162, 575 180, 624 202'\nconst exitPath =\n  'M 720 760 C 722 835, 760 875, 748 924 C 740 956, 748 978, 748 1000'\n\nexport function WorkOrderTrace({{\n  entryProgress,\n  exitProgress,\n}}: WorkOrderTraceProps) {{\n  return (\n{textwrap.indent(trace_body, '    ')}\n  )\n}}\n'''

intro_component = f'''import type {{ LandingStoryStage }} from '../model/landingStory'\n\ninterface WorkOrderIntroProps {{\n  stage: LandingStoryStage\n  reducedMotion: boolean\n  scrollProgress: number\n  phase: string\n}}\n\nexport function WorkOrderIntro({{\n  stage,\n  reducedMotion,\n  scrollProgress,\n  phase,\n}}: WorkOrderIntroProps) {{\n  return (\n{textwrap.indent(intro_body, '    ')}\n  )\n}}\n'''

constants = '''  const entryPath =\n    'M 340 0 C 342 70, 420 88, 492 126 C 560 162, 575 180, 624 202'\n  const exitPath =\n    'M 720 760 C 722 835, 760 875, 748 924 C 740 956, 748 978, 748 1000'\n'''
source = source.replace(constants, '')

source = source.replace(
    "import type { LandingStoryStage } from '../model/landingStory'\nimport '../workOrderSection.css'",
    "import type { LandingStoryStage } from '../model/landingStory'\nimport { WorkOrderIntro } from './WorkOrderIntro'\nimport { WorkOrderTrace } from './WorkOrderTrace'\nimport '../workOrderSection.css'",
)

source = source.replace(
    trace_block,
    '''        <WorkOrderTrace\n          entryProgress={entryProgress}\n          exitProgress={exitProgress}\n        />''',
)
source = source.replace(
    intro_block,
    '''          <WorkOrderIntro\n            stage={stage}\n            reducedMotion={reducedMotion}\n            scrollProgress={scrollProgress}\n            phase={phase}\n          />''',
)

section_path.write_text(source, encoding='utf-8')
Path('frontend/src/modules/landing/components/WorkOrderTrace.tsx').write_text(
    trace_component,
    encoding='utf-8',
)
Path('frontend/src/modules/landing/components/WorkOrderIntro.tsx').write_text(
    intro_component,
    encoding='utf-8',
)

baseline_path = Path('frontend/scripts/architecture-baseline.json')
baseline = json.loads(baseline_path.read_text(encoding='utf-8'))
baseline.pop('modules/landing/components/WorkOrderSection.tsx', None)
baseline_path.write_text(
    json.dumps(baseline, ensure_ascii=False, indent=2) + '\n',
    encoding='utf-8',
)
