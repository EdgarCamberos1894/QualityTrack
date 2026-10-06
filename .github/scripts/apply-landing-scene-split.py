from pathlib import Path
import json
import textwrap

ROOT = Path(__file__).resolve().parents[2]
COMPONENTS = ROOT / "frontend/src/modules/landing/components"
BASELINE = ROOT / "frontend/scripts/architecture-baseline.json"


def replace_block(source: str, start_marker: str, end_marker: str, replacement: str):
    start = source.index(start_marker)
    end = source.index(end_marker, start)
    block = textwrap.dedent(source[start:end].rstrip())
    return source[:start] + replacement + source[end:], block


def remove_between(source: str, start_marker: str, end_marker: str):
    start = source.index(start_marker)
    end = source.index(end_marker, start)
    return source[:start] + source[end:]


def intro_component(name: str, block: str) -> str:
    return f"""import type {{ CSSProperties }} from 'react'
import type {{ LandingStoryStage }} from '../model/landingStory'

interface {name}Props {{
  stage: LandingStoryStage
  reducedMotion: boolean
  scrollProgress: number
  phase: string
  reveal: (start: number, end: number, distance?: number) => CSSProperties
}}

export function {name}({{
  stage,
  reducedMotion,
  scrollProgress,
  phase,
  reveal,
}}: {name}Props) {{
  return (
{textwrap.indent(block, '    ')}
  )
}}
"""


def production_trace_component(block: str) -> str:
    return f"""import {{ rangeProgress }} from '../hooks/usePinnedSectionProgress'

interface ProductionTraceProps {{
  entryProgress: number
  qualityProgress: number
}}

const entryPath =
  'M 748 0 C 748 72, 714 88, 696 132 C 680 170, 704 194, 706 228'
const qualityExitPath =
  'M 706 690 C 706 780, 670 826, 666 882 C 662 930, 666 968, 666 1000'

export function ProductionTrace({{
  entryProgress,
  qualityProgress,
}}: ProductionTraceProps) {{
  return (
{textwrap.indent(block, '    ')}
  )
}}
"""


def quality_trace_component(block: str) -> str:
    return f"""import {{ rangeProgress }} from '../hooks/usePinnedSectionProgress'

interface QualityTraceProps {{
  entryProgress: number
  exitProgress: number
}}

const entryPath =
  'M 666 0 C 666 74, 690 105, 686 154 C 682 205, 648 225, 650 262'
const exitPath =
  'M 688 735 C 730 786, 760 826, 748 880 C 738 925, 756 964, 760 1000'

export function QualityTrace({{
  entryProgress,
  exitProgress,
}}: QualityTraceProps) {{
  return (
{textwrap.indent(block, '    ')}
  )
}}
"""


def refactor_production():
    path = COMPONENTS / "ProductionSection.tsx"
    source = path.read_text(encoding="utf-8")

    source, trace = replace_block(
        source,
        '        <div\n          className="pointer-events-none absolute inset-0 z-[3] hidden lg:block"',
        '        <div className="relative z-10 mx-auto grid h-full w-full max-w-[1440px]',
        "        <ProductionTrace\n          entryProgress={entryProgress}\n          qualityProgress={qualityProgress}\n        />\n\n",
    )
    source, intro = replace_block(
        source,
        '          <div className="order-1 lg:pr-4">',
        '          <div className="order-2 min-h-0">',
        "          <ProductionIntro\n            stage={stage}\n            reducedMotion={reducedMotion}\n            scrollProgress={scrollProgress}\n            phase={phase}\n            reveal={reveal}\n          />\n\n",
    )

    source = remove_between(
        source,
        "\n  const entryPath =",
        "\n\n  const turnActive =",
    )
    source = source.replace(
        "import '../productionSection.css'\n",
        "import '../productionSection.css'\nimport { ProductionIntro } from './ProductionIntro'\nimport { ProductionTrace } from './ProductionTrace'\n",
        1,
    )

    path.write_text(source, encoding="utf-8")
    (COMPONENTS / "ProductionIntro.tsx").write_text(
        intro_component("ProductionIntro", intro), encoding="utf-8"
    )
    (COMPONENTS / "ProductionTrace.tsx").write_text(
        production_trace_component(trace), encoding="utf-8"
    )


def refactor_quality():
    path = COMPONENTS / "QualitySection.tsx"
    source = path.read_text(encoding="utf-8")

    source, trace = replace_block(
        source,
        '        <div\n          className="pointer-events-none absolute inset-0 z-[3] hidden lg:block"',
        '        <div className="relative z-10 mx-auto grid h-full w-full max-w-[1440px]',
        "        <QualityTrace\n          entryProgress={entryProgress}\n          exitProgress={exitProgress}\n        />\n\n",
    )
    source, intro = replace_block(
        source,
        '          <div className="order-1 lg:pr-4">',
        '          <div className="order-2 min-h-0">',
        "          <QualityIntro\n            stage={stage}\n            reducedMotion={reducedMotion}\n            scrollProgress={scrollProgress}\n            phase={phase}\n            reveal={reveal}\n          />\n\n",
    )

    source = remove_between(
        source,
        "\n  const entryPath =",
        "\n\n  const inspectionOpacity =",
    )
    source = source.replace(
        "import '../qualitySection.css'\n",
        "import '../qualitySection.css'\nimport { QualityIntro } from './QualityIntro'\nimport { QualityTrace } from './QualityTrace'\n",
        1,
    )

    path.write_text(source, encoding="utf-8")
    (COMPONENTS / "QualityIntro.tsx").write_text(
        intro_component("QualityIntro", intro), encoding="utf-8"
    )
    (COMPONENTS / "QualityTrace.tsx").write_text(
        quality_trace_component(trace), encoding="utf-8"
    )


def update_architecture_baseline():
    baseline = json.loads(BASELINE.read_text(encoding="utf-8"))
    baseline.pop("modules/landing/components/ProductionSection.tsx", None)
    baseline.pop("modules/landing/components/QualitySection.tsx", None)
    BASELINE.write_text(
        json.dumps(baseline, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


refactor_production()
refactor_quality()
update_architecture_baseline()
