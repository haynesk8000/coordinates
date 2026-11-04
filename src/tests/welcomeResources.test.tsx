import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { welcomeScreenResources } from '../data/welcomeResources';
import { WelcomeResourceButtons } from '../components/WelcomeResourceButtons';
import { AuthScreen } from '../components/AuthScreen';

const expectedResources = [
  ['1927.png', 'https://marinamaral.com/portfolio/solvay-conference/', 'https://www.youtube.com/watch?v=ckmSC-qSkkc'],
  ['Galileo.png', 'https://www.britannica.com/biography/Galileo-Galilei', 'https://www.history.com/videos/galileo-galilei'],
  ['Hawkings.png', 'https://www.hawking.org.uk/biography', 'https://www.ted.com/talks/stephen_hawking_questioning_the_universe'],
  ['KatherineJohnson.png', 'https://www.nasa.gov/centers-and-facilities/langley/katherine-johnson-biography/', 'https://www.youtube.com/watch?v=nKxgieXQ82w'],
  ['MaeJemison.png', 'https://www.nasa.gov/people/mae-jemison-m-d/', 'https://www.youtube.com/watch?v=rWxGAogqr4M'],
  ['MarieCurie.png', 'https://www.nobelprize.org/prizes/chemistry/1911/marie-curie/biographical/', 'https://ed.ted.com/lessons/the-genius-of-marie-curie-shohini-ghose'],
  ['MaxPlank.png', 'https://www.nobelprize.org/prizes/physics/1918/planck/facts/', 'https://www.youtube.com/watch?v=XqeOu9y5BjQ'],
  ['MichaelFaraday.png', 'https://www.rigb.org/explore-science/explore/person/michael-faraday-1791-1867', 'https://www.rigb.org/explore-science/explore/video/discoveries-faradays-laboratory-david-ricketts'],
  ['Mo.png', 'https://sc.edu/study/colleges_schools/artsandsciences/physics_and_astronomy/our_people/directory/crittenden_scott.php'],
  ['Newton.png', 'https://www.newtonproject.ox.ac.uk/his-life-and-work-at-a-glance', 'https://www.youtube.com/watch?v=n6lRdH1EzIo'],
  ['Oppenheimer.png', 'https://ahf.nuclearmuseum.org/ahf/profile/j-robert-oppenheimer/', 'https://www.youtube.com/watch?v=SL-btRhoJyM'],
  ['AlbertEinstein.png', 'https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/', 'https://ed.ted.com/lessons/the-physics-behind-einsteins-most-famous-equation-lindsay-demarchi-and-fabio-pacucci'],
  ['Rutherford.png', 'https://www.nobelprize.org/prizes/chemistry/1908/rutherford/biographical', 'https://www.youtube.com/watch?v=W7t7u-epT3g'],
  ['nancy_grace_roman.png', 'https://science.nasa.gov/people/nancy-grace-roman-for-hubble/', 'https://www.youtube.com/watch?v=m5fC3FIUngk'],
] as const;

afterEach(() => vi.restoreAllMocks());

describe('welcome educational resources', () => {
  it('includes all 14 exact filenames and explicitly classified URLs from welcome.md', () => {
    expect(welcomeScreenResources).toHaveLength(14);
    expect(new Set(welcomeScreenResources.map(({ image }) => image)).size).toBe(14);
    for (const [image, website, video] of expectedResources) {
      const configuration = welcomeScreenResources.find((entry) => entry.image === image);
      expect(configuration?.subject).toBeTruthy();
      expect(configuration?.resources).toEqual([
        { type: 'website', url: website },
        ...(video ? [{ type: 'video', url: video }] : []),
      ]);
    }
  });

  it.each(expectedResources.map(([image]) => image))('renders the correct external links for %s', (image) => {
    const configuration = welcomeScreenResources.find((entry) => entry.image === image)!;
    render(<WelcomeResourceButtons configuration={configuration} />);
    expect(screen.getAllByRole('link')).toHaveLength(configuration.resources.length);
    for (const resource of configuration.resources) {
      const label = resource.type === 'website' ? 'Learn More' : 'Watch Video';
      const link = screen.getByRole('link', { name: new RegExp(`${label}.*${configuration.subject.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`) });
      expect(link).toHaveTextContent(label);
      expect(link).toHaveAttribute('href', resource.url);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
      expect(link).toHaveAttribute('rel', expect.stringContaining('noreferrer'));
    }
    if (image === 'Mo.png') expect(screen.queryByRole('link', { name: /Watch Video/ })).not.toBeInTheDocument();
  });

  it('distinguishes multiple links of one type and removes stale links on configuration changes', () => {
    const first = welcomeScreenResources.find(({ image }) => image === 'Galileo.png')!;
    const { rerender } = render(<WelcomeResourceButtons configuration={{ ...first, resources: [...first.resources, { type: 'website', url: 'https://example.org/galileo' }] }} />);
    const learnLinks = screen.getAllByRole('link', { name: /Learn More/ });
    expect(learnLinks).toHaveLength(2);
    expect(learnLinks[0].getAttribute('aria-label')).not.toBe(learnLinks[1].getAttribute('aria-label'));

    const mo = welcomeScreenResources.find(({ image }) => image === 'Mo.png')!;
    rerender(<WelcomeResourceButtons configuration={mo} />);
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(screen.queryByRole('link', { name: /Galileo|Watch Video/ })).not.toBeInTheDocument();
    rerender(<WelcomeResourceButtons configuration={{ ...mo, resources: [] }} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    rerender(<WelcomeResourceButtons />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('matches the selected welcome image and preserves it through resource interaction and navigation', () => {
    localStorage.clear();
    sessionStorage.clear();
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    render(<AuthScreen onAuthenticated={vi.fn()} />);
    const source = screen.getByRole('img').getAttribute('src')!;
    const filename = decodeURIComponent(source.split('/').pop()!.split('?')[0]);
    const configuration = welcomeScreenResources.find(({ image }) => image === filename)!;
    expect(configuration).toBeDefined();
    expect(screen.getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual(configuration.resources.map(({ url }) => url));
    const link = screen.getAllByRole('link')[0];
    // Prevent jsdom navigation; the anchor destination and target are checked above.
    link.addEventListener('click', (event) => event.preventDefault(), { once: true });
    fireEvent.click(link);
    expect(screen.getByRole('img')).toHaveAttribute('src', source);
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));
    fireEvent.click(screen.getByRole('button', { name: /Back/ }));
    expect(screen.getByRole('img')).toHaveAttribute('src', source);
    expect(screen.getAllByRole('link').map((entry) => entry.getAttribute('href'))).toEqual(configuration.resources.map(({ url }) => url));
  });
});
