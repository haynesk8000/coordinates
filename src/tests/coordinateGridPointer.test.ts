import { describe, expect, it } from 'vitest';
import { coordinateFromGridPointer } from '../components/FunZoneMode';

describe('Target Plotter pointer mapping', () => {
  const range = 7;
  const bounds = { left: 40, top: 25, width: 600, height: 360 };
  const renderedScale = 1;
  const horizontalLetterbox = 120;
  const originX = bounds.left + horizontalLetterbox + 180;
  const originY = bounds.top + 180;
  const step = 150 / range;

  it('maps every intersection on the -7 to 7 grid in a letterboxed viewport', () => {
    for (let x = -range; x <= range; x += 1) {
      for (let y = -range; y <= range; y += 1) {
        expect(coordinateFromGridPointer(
          {
            x: originX + x * step * renderedScale,
            y: originY - y * step * renderedScale,
          },
          bounds,
          range,
        )).toEqual({ x, y });
      }
    }
  });

  it.each([
    [3, -4],
    [5, 0],
    [-5, 7],
    [0, 0],
    [-7, -7],
    [7, 7],
  ])('maps the rendered intersection (%i, %i) exactly', (x, y) => {
    expect(coordinateFromGridPointer(
      { x: originX + x * step, y: originY - y * step },
      bounds,
      range,
    )).toEqual({ x, y });
  });
});
