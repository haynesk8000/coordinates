# Welcome Screen Image Rotation and Educational Links

## 1. Objective

Update the application's existing welcome screen to provide educational resources associated with each image displayed in the welcome screen rotation.

Each welcome screen image represents a scientist, historical figure, or significant scientific event. The application must display buttons that allow users to access websites and educational videos related to the currently displayed image.

**Preserve the existing welcome screen functionality, appearance, and image rotation behavior unless modifications are necessary to implement these requirements.**

## 2. Functional Requirements

### 2.1 Welcome Screen Image Rotation

- Retain the existing welcome screen image rotation functionality.
- Use the image filenames specified in Section 3.
- Display the educational resource buttons associated with the currently visible image.
- When the image changes, automatically update the buttons and their destinations.
- Ensure that buttons from a previously displayed image do not remain visible after the rotation.
- Do not interrupt, restart, or otherwise alter the existing rotation timing when users interact with the resource buttons.
- Preserve the existing image scaling, positioning, and transitions.

### 2.2 Educational Resource Buttons

Each welcome screen must display one button for every resource URL associated with its image.

Use the following button labels:

| Resource Type | Button Label |
|---|---|
| Standard website | Learn More |
| Educational video | Watch Video |

**Button requirements:**

1. Display a separate button for each associated URL.
2. Use the exact button labels specified above.
3. Open the associated URL when the button is clicked.
4. Open external resources in a new browser tab or window, leaving the application running in its original tab.
5. Ensure that the buttons are clearly visible and do not obscure important portions of the image.
6. Use consistent styling, spacing, and alignment across all welcome screens.
7. Support keyboard navigation and accessible button labels.
8. Ensure the layout works on desktop, tablet, and mobile screens.
9. Do not display a button when no corresponding resource URL exists.

For accessibility, distinguish buttons with identical visible labels using descriptive accessible names identifying their associated subjects.

### 2.3 Resource Classification

Classify resources according to the explicit mapping in Section 3 rather than relying exclusively on URL patterns.

Some educational videos are hosted on websites other than YouTube, including TED-Ed, TED, HISTORY, and the Royal Institution.

All video resources must use the label **Watch Video**, regardless of hosting platform.

## 3. Image and Educational Resource Mapping

The following mappings define the required images and associated resources.

### 3.1 1927.png — Fifth Solvay Conference (1927)

**Website — Learn More**

https://marinamaral.com/portfolio/solvay-conference/

**Video — Watch Video**

https://www.youtube.com/watch?v=ckmSC-qSkkc

### 3.2 Galileo.png — Galileo Galilei

**Website — Learn More**

https://www.britannica.com/biography/Galileo-Galilei

**Video — Watch Video**

https://www.history.com/videos/galileo-galilei

### 3.3 Hawkings.png — Stephen Hawking

**Website — Learn More**

https://www.hawking.org.uk/biography

**Video — Watch Video**

https://www.ted.com/talks/stephen_hawking_questioning_the_universe

### 3.4 KatherineJohnson.png — Katherine Johnson

**Website — Learn More**

https://www.nasa.gov/centers-and-facilities/langley/katherine-johnson-biography/

**Video — Watch Video**

https://www.youtube.com/watch?v=nKxgieXQ82w

### 3.5 MaeJemison.png — Mae Jemison

**Website — Learn More**

https://www.nasa.gov/people/mae-jemison-m-d/

**Video — Watch Video**

https://www.youtube.com/watch?v=rWxGAogqr4M

### 3.6 MarieCurie.png — Marie Curie

**Website — Learn More**

https://www.nobelprize.org/prizes/chemistry/1911/marie-curie/biographical/

**Video — Watch Video**

https://ed.ted.com/lessons/the-genius-of-marie-curie-shohini-ghose

### 3.7 MaxPlank.png — Max Planck

**Website — Learn More**

https://www.nobelprize.org/prizes/physics/1918/planck/facts/

**Video — Watch Video**

https://www.youtube.com/watch?v=XqeOu9y5BjQ

### 3.8 MichaelFaraday.png — Michael Faraday

**Website — Learn More**

https://www.rigb.org/explore-science/explore/person/michael-faraday-1791-1867

**Video — Watch Video**

https://www.rigb.org/explore-science/explore/video/discoveries-faradays-laboratory-david-ricketts

### 3.9 Mo.png — Professor Mo

**Website — Learn More**

https://sc.edu/study/colleges_schools/artsandsciences/physics_and_astronomy/our_people/directory/crittenden_scott.php

**Video**

None.

**Special requirement:** Display only the Learn More button. Do not display a Watch Video button.

### 3.10 Newton.png — Isaac Newton

**Website — Learn More**

https://www.newtonproject.ox.ac.uk/his-life-and-work-at-a-glance

**Video — Watch Video**

https://www.youtube.com/watch?v=n6lRdH1EzIo

### 3.11 Oppenheimer.png — J. Robert Oppenheimer

**Website — Learn More**

https://ahf.nuclearmuseum.org/ahf/profile/j-robert-oppenheimer/

**Video — Watch Video**

https://www.youtube.com/watch?v=SL-btRhoJyM

### 3.12 AlbertEinstein.png — Albert Einstein

**Website — Learn More**

https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/

**Video — Watch Video**

https://ed.ted.com/lessons/the-physics-behind-einsteins-most-famous-equation-lindsay-demarchi-and-fabio-pacucci

### 3.13 Rutherford.png — Ernest Rutherford

**Website — Learn More**

https://www.nobelprize.org/prizes/chemistry/1908/rutherford/biographical

**Video — Watch Video**

https://www.youtube.com/watch?v=W7t7u-epT3g

## 4. Implementation Requirements

### 4.1 Centralized Resource Configuration

Create a centralized, data-driven configuration that associates each image filename with its educational resources.

Do not hardcode resource URLs directly into individual welcome screen components.

Recommended TypeScript interface:

```typescript
interface EducationalResource {
  type: "website" | "video";
  url: string;
}

interface WelcomeScreenResource {
  image: string;
  subject: string;
  resources: EducationalResource[];
}
```

The configuration must:

- Use the exact image filenames specified in Section 3.
- Preserve the exact resource URLs.
- Support images with different numbers of resources.
- Allow additional images and resources to be added without modifying the button-rendering logic.
- Keep resource data separate from presentation logic.

### 4.2 Dynamic Button Rendering

Implement a reusable component responsible for displaying the educational resource buttons.

The component must:

1. Receive the resource configuration for the currently displayed image.
2. Generate one button per resource.
3. Determine the visible button label from the resource type.
4. Open the correct destination when clicked.
5. Automatically update when the active image changes.
6. Render no buttons when an image has no associated resources.

Use the application's existing framework and component conventions.

### 4.3 Button Placement and Styling

- Position the buttons consistently on each welcome screen.
- Prefer placement near the bottom of the image or within the existing welcome screen controls area.
- Maintain adequate contrast between buttons and their backgrounds.
- Preserve the existing visual design.
- Avoid covering faces, important historical details, or existing navigation controls.
- Ensure the buttons remain usable on smaller screens.
- Provide visible hover, focus, and active states.

### 4.4 External Link Handling

All external links must:

- Open in a new browser tab.
- Preserve the current application state.
- Use appropriate security attributes, including `rel="noopener noreferrer"` when using `target="_blank"`.
- Avoid triggering the image rotation or other unrelated application actions.

Do not embed external videos unless the application already provides an established video embedding mechanism. Opening the supplied video URL is the default behavior.

### 4.5 Preserve Existing Functionality

Do not modify unrelated application features.

Specifically preserve:

- Welcome screen image rotation.
- Existing rotation timing and transitions.
- Existing navigation.
- Image assets and filenames.
- Existing responsive layout behavior.
- Other welcome screen content and controls.

## 5. Testing and Validation

Verify the following:

- [ ] All 13 specified images are supported by the resource configuration.
- [ ] Each image displays its correct educational resources.
- [ ] Standard website resources display Learn More.
- [ ] Video resources display Watch Video.
- [ ] All buttons open the correct URL.
- [ ] External links open in new tabs.
- [ ] Image rotation continues functioning correctly.
- [ ] Resource buttons update immediately when the active image changes.
- [ ] No stale buttons remain after image transitions.
- [ ] Mo.png displays only Learn More.
- [ ] Button placement is responsive and accessible.
- [ ] Existing application functionality remains unaffected.
- [ ] No unrelated source files or application behavior are changed.

## 6. Acceptance Criteria

The implementation is complete when:

1. All 13 welcome screen images have their specified educational resource mappings.
2. Each displayed image presents the correct Learn More and/or Watch Video buttons.
3. Every button navigates to its associated URL in a new tab.
4. Buttons automatically change with the image rotation.
5. The existing welcome screen appearance and rotation behavior are preserved.
6. The solution uses centralized resource configuration and reusable UI components.
7. All validation checks pass without introducing regressions.

## 7. Implementation Notes for the AI Agent

Before making changes:

1. Inspect the existing welcome screen implementation.
2. Identify how the application stores and rotates welcome screen images.
3. Identify the existing styling conventions and component architecture.
4. Implement the smallest maintainable change necessary.
5. Reuse existing components and utilities wherever practical.
6. Avoid adding unnecessary dependencies.
7. Do not rename image files, even if their filenames contain spelling variations.

After implementation, provide a concise summary identifying:

- Files created or modified.
- How the resource configuration is structured.
- How the buttons are rendered and updated.
- Tests performed and their results.
- Any issues or limitations encountered.

**Important:** Do not replace, remove, or redesign the existing welcome screen. This task is limited to adding contextual educational resource buttons to the existing rotating welcome screen images.