import type { VisualizationBlock } from '../types/index';

export function useVisualization() {
  /**
   * Splits the rectangle a×b into 1, 2, or 4 blocks using the
   * "5-block + remainder" scheme on both axes.
   * Assumption V5: a, b ∈ 1..9. (Extension for 1..20 in Iter. 7.)
   */
  function partition(a: number, b: number): VisualizationBlock[] {
    const aFives = a >= 5 ? 5 : 0;
    const aRest = a >= 5 ? a - 5 : a;
    const bFives = b >= 5 ? 5 : 0;
    const bRest = b >= 5 ? b - 5 : b;

    const blocks: VisualizationBlock[] = [];

    if (aFives > 0 && bFives > 0) {
      blocks.push({ x: 0, y: 0, width: aFives, height: bFives, colorSlot: 'A', label: aFives * bFives });
    }
    if (aRest > 0 && bFives > 0) {
      blocks.push({ x: aFives, y: 0, width: aRest, height: bFives, colorSlot: 'B', label: aRest * bFives });
    }
    if (aFives > 0 && bRest > 0) {
      blocks.push({ x: 0, y: bFives, width: aFives, height: bRest, colorSlot: 'C', label: aFives * bRest });
    }
    if (aRest > 0 && bRest > 0) {
      blocks.push({ x: aFives, y: bFives, width: aRest, height: bRest, colorSlot: 'D', label: aRest * bRest });
    }

    return blocks;
  }

  return { partition };
}
