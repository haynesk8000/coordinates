import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ExplainMode } from '../components/ExplainMode';
import { createPresets } from '../physics/presets';
import { defaultParameters } from '../physics/projectile';

describe('ExplainMode', () => {
  it('uses unique worked-example descriptions below the images', () => {
    const presets = createPresets(defaultParameters);
    const { container } = render(<ExplainMode params={defaultParameters} system={presets[0]} />);
    const captions = Array.from(container.querySelectorAll('.examples-grid figcaption')).map((caption) =>
      caption.textContent?.trim(),
    );

    expect(captions).toHaveLength(4);
    expect(new Set(captions).size).toBe(4);
    expect(captions[0]).toContain('origin is at the launch point');
    expect(captions[1]).toContain('gravity to +g');
    expect(captions[2]).toContain('begins H meters above the origin');
    expect(captions[3]).toContain('coordinate named x is vertical');
  });
});
