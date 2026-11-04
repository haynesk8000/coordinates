export interface EducationalResource {
  type: 'website' | 'video';
  url: string;
}

export interface WelcomeScreenResource {
  image: string;
  subject: string;
  resources: readonly EducationalResource[];
}

export const welcomeScreenResources: readonly WelcomeScreenResource[] = [
  {
    image: '1927.png',
    subject: 'Fifth Solvay Conference (1927)',
    resources: [
      { type: 'website', url: 'https://marinamaral.com/portfolio/solvay-conference/' },
      { type: 'video', url: 'https://www.youtube.com/watch?v=ckmSC-qSkkc' },
    ],
  },
  {
    image: 'Galileo.png',
    subject: 'Galileo Galilei',
    resources: [
      { type: 'website', url: 'https://www.britannica.com/biography/Galileo-Galilei' },
      { type: 'video', url: 'https://www.history.com/videos/galileo-galilei' },
    ],
  },
  {
    image: 'Hawkings.png',
    subject: 'Stephen Hawking',
    resources: [
      { type: 'website', url: 'https://www.hawking.org.uk/biography' },
      { type: 'video', url: 'https://www.ted.com/talks/stephen_hawking_questioning_the_universe' },
    ],
  },
  {
    image: 'KatherineJohnson.png',
    subject: 'Katherine Johnson',
    resources: [
      { type: 'website', url: 'https://www.nasa.gov/centers-and-facilities/langley/katherine-johnson-biography/' },
      { type: 'video', url: 'https://www.youtube.com/watch?v=nKxgieXQ82w' },
    ],
  },
  {
    image: 'MaeJemison.png',
    subject: 'Mae Jemison',
    resources: [
      { type: 'website', url: 'https://www.nasa.gov/people/mae-jemison-m-d/' },
      { type: 'video', url: 'https://www.youtube.com/watch?v=rWxGAogqr4M' },
    ],
  },
  {
    image: 'MarieCurie.png',
    subject: 'Marie Curie',
    resources: [
      { type: 'website', url: 'https://www.nobelprize.org/prizes/chemistry/1911/marie-curie/biographical/' },
      { type: 'video', url: 'https://ed.ted.com/lessons/the-genius-of-marie-curie-shohini-ghose' },
    ],
  },
  {
    image: 'MaxPlank.png',
    subject: 'Max Planck',
    resources: [
      { type: 'website', url: 'https://www.nobelprize.org/prizes/physics/1918/planck/facts/' },
      { type: 'video', url: 'https://www.youtube.com/watch?v=XqeOu9y5BjQ' },
    ],
  },
  {
    image: 'MichaelFaraday.png',
    subject: 'Michael Faraday',
    resources: [
      { type: 'website', url: 'https://www.rigb.org/explore-science/explore/person/michael-faraday-1791-1867' },
      { type: 'video', url: 'https://www.rigb.org/explore-science/explore/video/discoveries-faradays-laboratory-david-ricketts' },
    ],
  },
  {
    image: 'Mo.png',
    subject: 'Professor Mo',
    resources: [
      { type: 'website', url: 'https://sc.edu/study/colleges_schools/artsandsciences/physics_and_astronomy/our_people/directory/crittenden_scott.php' },
    ],
  },
  {
    image: 'Newton.png',
    subject: 'Isaac Newton',
    resources: [
      { type: 'website', url: 'https://www.newtonproject.ox.ac.uk/his-life-and-work-at-a-glance' },
      { type: 'video', url: 'https://www.youtube.com/watch?v=n6lRdH1EzIo' },
    ],
  },
  {
    image: 'Oppenheimer.png',
    subject: 'J. Robert Oppenheimer',
    resources: [
      { type: 'website', url: 'https://ahf.nuclearmuseum.org/ahf/profile/j-robert-oppenheimer/' },
      { type: 'video', url: 'https://www.youtube.com/watch?v=SL-btRhoJyM' },
    ],
  },
  {
    image: 'AlbertEinstein.png',
    subject: 'Albert Einstein',
    resources: [
      { type: 'website', url: 'https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/' },
      { type: 'video', url: 'https://ed.ted.com/lessons/the-physics-behind-einsteins-most-famous-equation-lindsay-demarchi-and-fabio-pacucci' },
    ],
  },
  {
    image: 'Rutherford.png',
    subject: 'Ernest Rutherford',
    resources: [
      { type: 'website', url: 'https://www.nobelprize.org/prizes/chemistry/1908/rutherford/biographical' },
      { type: 'video', url: 'https://www.youtube.com/watch?v=W7t7u-epT3g' },
    ],
  },
  {
    image: 'nancy_grace_roman.png',
    subject: 'Nancy Grace Roman',
    resources: [
      { type: 'website', url: 'https://science.nasa.gov/people/nancy-grace-roman-for-hubble/' },
      { type: 'video', url: 'https://www.youtube.com/watch?v=m5fC3FIUngk' },
    ],
  },
];
