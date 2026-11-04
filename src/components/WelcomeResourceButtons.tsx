import type { WelcomeScreenResource } from '../data/welcomeResources';

export function WelcomeResourceButtons({ configuration }: { configuration?: WelcomeScreenResource }) {
  if (!configuration?.resources.length) return null;

  return (
    <nav className="welcome-resources" aria-label={`Educational resources for ${configuration.subject}`}>
      {configuration.resources.map((resource, index) => {
        const label = resource.type === 'video' ? 'Watch Video' : 'Learn More';
        return (
          <a
            className="welcome-resource-link"
            key={`${resource.type}-${resource.url}-${index}`}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${label}: ${configuration.subject} (resource ${index + 1}, opens in a new tab)`}
          >
            {label}
          </a>
        );
      })}
    </nav>
  );
}
