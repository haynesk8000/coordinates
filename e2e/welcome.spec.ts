import { expect, test } from '@playwright/test';
import { welcomeScreenResources } from '../src/data/welcomeResources';

for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
  test(`Nancy Grace Roman appears in the welcome rotation with working resource links at ${viewport.width}px`, async ({ page, context }) => {
    await page.setViewportSize(viewport);
    // Nancy's filename is the final entry in Vite's alphabetically ordered image glob.
    await page.addInitScript(() => { Math.random = () => 0.999999; });
    await context.route('https://**/*', (route) => route.fulfill({ contentType: 'text/html', body: '<title>Educational resource</title>' }));
    await page.goto('/');
    const image = page.getByRole('img');
    await expect(image).toBeVisible();
    await expect(image).toHaveAttribute('src', /\/Welcome_images\/nancy_grace_roman\.png/);
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
    for (const [label, url] of [
      ['Learn More', 'https://science.nasa.gov/people/nancy-grace-roman-for-hubble/'],
      ['Watch Video', 'https://www.youtube.com/watch?v=m5fC3FIUngk'],
    ]) {
      const link = page.getByRole('link', { name: new RegExp(`${label}: Nancy Grace Roman`) });
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href', url);
      const popupPromise = page.waitForEvent('popup');
      await link.click();
      const popup = await popupPromise;
      await expect(popup).toHaveURL(url);
      await popup.close();
      await expect(image).toBeVisible();
      await expect(image).toHaveAttribute('src', /\/Welcome_images\/nancy_grace_roman\.png/);
    }
  });

  test(`welcome resources remain accessible at ${viewport.width}px`, async ({ page, context }) => {
    await page.setViewportSize(viewport);
    await page.addInitScript(() => { Math.random = () => 0; });
    // Keep external pages local while exercising a real new-tab click.
    await context.route('https://**/*', (route) => route.fulfill({ contentType: 'text/html', body: '<title>Educational resource</title>' }));
    await page.goto('/');
    const image = page.getByRole('img');
    await expect(image).toBeVisible();
    const source = (await image.getAttribute('src'))!;
    const filename = decodeURIComponent(source.split('/').pop()!.split('?')[0]);
    const configuration = welcomeScreenResources.find(({ image: name }) => name === filename)!;
    expect(configuration).toBeDefined();
    const links = page.getByRole('link');
    await expect(links).toHaveCount(configuration.resources.length);
    const imageBox = (await image.boundingBox())!;
    for (const resource of configuration.resources) {
      const label = resource.type === 'website' ? 'Learn More' : 'Watch Video';
      const link = page.getByRole('link', { name: new RegExp(label) });
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href', resource.url);
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', /noopener/);
      await expect(link).toHaveAttribute('rel', /noreferrer/);
      const box = (await link.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
      expect(box.y).toBeGreaterThanOrEqual(imageBox.y + imageBox.height);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    const firstLink = links.first();
    await firstLink.focus();
    await expect(firstLink).toBeFocused();
    const popupPromise = page.waitForEvent('popup');
    await firstLink.press('Enter');
    const popup = await popupPromise;
    await expect(popup).toHaveURL(configuration.resources[0].url);
    await popup.close();
    await expect(image).toHaveAttribute('src', source);
    await expect(page.getByRole('heading', { name: 'Physics Motion Lab' })).toBeVisible();
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByRole('button', { name: /Back/ }).click();
    await expect(image).toHaveAttribute('src', source);
  });
}
