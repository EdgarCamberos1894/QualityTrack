from pathlib import Path
import json
import textwrap

section_path = Path('frontend/src/modules/landing/components/RequestSection.tsx')
source = section_path.read_text(encoding='utf-8')

trace_start_marker = '''        <div\n          className="pointer-events-none absolute inset-0 z-[3] hidden lg:block"\n          aria-hidden="true"\n        >'''
grid_marker = '        <div className="relative z-10 mx-auto grid h-full w-full max-w-[1440px]'
intro_start_marker = '          <div className="order-1 lg:order-2 lg:pl-4">'
scene_start_marker = '          <div className="order-2 min-h-0 lg:order-1">'

trace_start = source.index(trace_start_marker)
grid_start = source.index(grid_marker, trace_start)
intro_start = source.index(intro_start_marker, grid_start)
scene_start = source.index(scene_start_marker, intro_start)

trace_block = source[trace_start:grid_start].rstrip()
intro_block = source[intro_start:scene_start].rstrip()
trace_body = textwrap.dedent(trace_block).strip()
intro_body = textwrap.dedent(intro_block).strip()

trace_component = f'''import {{ rangeProgress }} from '../hooks/usePinnedSectionProgress'\n\ninterface RequestTraceProps {{\n  reducedMotion: boolean\n  scrollProgress: number\n  linkProgress: number\n  exitProgress: number\n}}\n\nconst requestTracePath =\n  'M 343 0 C 326 27, 311 61, 329 96 C 352 137, 365 174, 328 206 C 294 236, 245 253, 202 284'\nconst requestHandoffPath =\n  'M 286 505 C 281 588, 190 635, 205 720 C 219 800, 278 858, 250 1000'\n\nexport function RequestTrace({{\n  reducedMotion,\n  scrollProgress,\n  linkProgress,\n  exitProgress,\n}}: RequestTraceProps) {{\n  const handoffLabelProgress = reducedMotion\n    ? 1\n    : rangeProgress(exitProgress, 0.34, 0.72)\n\n  return (\n{textwrap.indent(trace_body, '    ')}\n  )\n}}\n'''

intro_component = f'''import type {{ LandingStoryStage }} from '../model/landingStory'\n\ninterface RequestIntroProps {{\n  stage: LandingStoryStage\n  reducedMotion: boolean\n  scrollProgress: number\n  phase: number\n}}\n\nexport function RequestIntro({{\n  stage,\n  reducedMotion,\n  scrollProgress,\n  phase,\n}}: RequestIntroProps) {{\n  return (\n{textwrap.indent(intro_body, '    ')}\n  )\n}}\n'''

constants = '''  const requestTracePath =\n    'M 343 0 C 326 27, 311 61, 329 96 C 352 137, 365 174, 328 206 C 294 236, 245 253, 202 284'\n  const requestHandoffPath =\n    'M 286 505 C 281 588, 190 635, 205 720 C 219 800, 278 858, 250 1000'\n\n'''
source = source.replace(constants, '')
source = source.replace(
    '''  const handoffLabelProgress = reducedMotion\n    ? 1\n    : rangeProgress(exitProgress, 0.34, 0.72)\n''',
    '',
)
source = source.replace(
    "import type { LandingStoryStage } from '../model/landingStory'\nimport '../requestSection.css'",
    "import type { LandingStoryStage } from '../model/landingStory'\nimport { RequestIntro } from './RequestIntro'\nimport { RequestTrace } from './RequestTrace'\nimport '../requestSection.css'",
)
source = source.replace(
    trace_block,
    '''        <RequestTrace\n          reducedMotion={reducedMotion}\n          scrollProgress={scrollProgress}\n          linkProgress={linkProgress}\n          exitProgress={exitProgress}\n        />''',
)
source = source.replace(
    intro_block,
    '''          <RequestIntro\n            stage={stage}\n            reducedMotion={reducedMotion}\n            scrollProgress={scrollProgress}\n            phase={phase}\n          />''',
)

section_path.write_text(source, encoding='utf-8')
Path('frontend/src/modules/landing/components/RequestTrace.tsx').write_text(trace_component, encoding='utf-8')
Path('frontend/src/modules/landing/components/RequestIntro.tsx').write_text(intro_component, encoding='utf-8')

baseline_path = Path('frontend/scripts/architecture-baseline.json')
baseline = json.loads(baseline_path.read_text(encoding='utf-8'))
baseline.pop('modules/landing/components/RequestSection.tsx', None)
baseline_path.write_text(json.dumps(baseline, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
