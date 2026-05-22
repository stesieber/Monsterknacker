import type { ColorSlot, VisualizationBlock } from '../types/index';

/** Zerlegt einen Faktor in Segmente: beliebig viele 10er, dann max ein 5er, dann Rest. */
export function decompose(n: number): number[] {
  const segments: number[] = [];
  let rest = n;
  while (rest >= 10) {
    segments.push(10);
    rest -= 10;
  }
  if (rest >= 5) {
    segments.push(5);
    rest -= 5;
  }
  if (rest > 0) segments.push(rest);
  return segments;
}

/** Bestimmt den Farb-Slot anhand der Segment-Magnituden.
 *  a kann nur 1..9 sein, also nie 10. b kann 10 sein. */
function colorSlotFor(aSeg: number, bSeg: number): ColorSlot {
  const aMag: 'F' | 'R' = aSeg === 5 ? 'F' : 'R';
  const bMag: 'T' | 'F' | 'R' = bSeg === 10 ? 'T' : bSeg === 5 ? 'F' : 'R';
  return `${aMag}${bMag}` as ColorSlot;
}

/** Zerlegt das Rechteck a × b in Blöcke (Kreuzprodukt der Segmente). */
export function partition(a: number, b: number): VisualizationBlock[] {
  const aSegs = decompose(a);
  const bSegs = decompose(b);
  const blocks: VisualizationBlock[] = [];
  let y = 0;
  for (const bSeg of bSegs) {
    let x = 0;
    for (const aSeg of aSegs) {
      blocks.push({
        x,
        y,
        width: aSeg,
        height: bSeg,
        colorSlot: colorSlotFor(aSeg, bSeg),
        label: aSeg * bSeg,
      });
      x += aSeg;
    }
    y += bSeg;
  }
  return blocks;
}
