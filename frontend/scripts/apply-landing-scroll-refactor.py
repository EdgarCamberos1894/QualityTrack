from pathlib import Path
import re

root = Path('frontend/src/modules/landing/components')
files = {
    'RequestSection.tsx': ('linkProgress', False, 'scrollReveal', 14),
    'CaseSection.tsx': ('entryProgress', True, 'reveal', 12),
    'QuoteSection.tsx': ('entryProgress', True, 'reveal', 12),
    'WorkOrderSection.tsx': ('entryProgress', True, 'reveal', 12),
    'ProductionSection.tsx': ('entryProgress', True, 'reveal', 12),
    'QualitySection.tsx': ('entryProgress', True, 'reveal', 12),
    'DeliverySection.tsx': ('entryProgress', True, 'reveal', 12),
}

for name, (first_progress, reverse, reveal_name, distance) in files.items():
    path = root / name
    text = path.read_text(encoding='utf-8')

    text = text.replace("import { useEffect, useRef, useState } from 'react'\n", '')
    text = text.replace("import type { CSSProperties } from 'react'\n", '')

    marker = "import type { LandingStoryStage } from '../model/landingStory'\n"
    hook_import = (
        "import {\n"
        "  rangeProgress,\n"
        "  usePinnedSectionProgress,\n"
        "} from '../hooks/usePinnedSectionProgress'\n"
    )
    text = text.replace(marker, hook_import + marker, 1)

    text, count = re.subn(
        r"\nfunction clamp\(value: number\) \{\n  return Math\.min\(1, Math\.max\(0, value\)\)\n\}\n\nfunction rangeProgress\(progress: number, start: number, end: number\) \{\n  if \(end <= start\) return progress >= end \? 1 : 0\n  return clamp\(\(progress - start\) / \(end - start\)\)\n\}\n",
        "\n",
        text,
        count=1,
    )
    if count != 1:
        raise RuntimeError(f'{name}: utility block count {count}')

    start = text.index('  const sectionRef = useRef<HTMLElement | null>(null)')
    end = text.index(f'  const {first_progress} = reducedMotion', start)

    options = ['    reducedMotion,']
    if reverse:
        options.append('    accelerateReverse: true,')
    if distance != 12:
        options.append(f'    revealDistance: {distance},')

    if reveal_name == 'scrollReveal':
        destructure = (
            '  const {\n'
            '    sectionRef,\n'
            '    scrollProgress,\n'
            '    reveal: scrollReveal,\n'
            '  } = usePinnedSectionProgress({\n'
        )
    else:
        destructure = '  const { sectionRef, scrollProgress, reveal } = usePinnedSectionProgress({\n'

    replacement = destructure + '\n'.join(options) + '\n  })\n\n'
    text = text[:start] + replacement + text[end:]
    path.write_text(text, encoding='utf-8')
