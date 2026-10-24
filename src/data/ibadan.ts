import { ibadanSources } from './ibadan-sources'
export { ibadanSources }
export type EvidenceStatus =
  | 'Documented'
  | 'Conventional date'
  | 'Oral tradition / disputed chronology'
  | 'Creative reconstruction'
  | 'Needs verification'
export type IbadanForm =
  | 'landscape'
  | 'arrival'
  | 'compound'
  | 'regional'
  | 'school'
  | 'market'
  | 'treaty'
  | 'rail'
  | 'mapo'
  | 'university'
  | 'broadcast'
  | 'mbari'
  | 'unrest'
  | 'tower'
  | 'city'
  | 'water'
export type IbadanFocus = 'place' | 'people' | 'routes'
export interface IbadanChapter {
  id: string
  act: number
  dateLabel: string
  sortYear: number | null
  title: string
  question: string
  locations: { name: string; coordinates: null }[]
  form: IbadanForm
  text: string
  historicalClaims: { text: string; sourceIds: string[]; evidenceStatus: EvidenceStatus }[]
  people: {
    name: string
    role: string
    historicalOrComposite: 'Historical person' | 'Historical group' | 'Composite viewpoint'
  }[]
  viewpoints: { id: string; label: string; title: string; text: string; focus: IbadanFocus }[]
  narration: string
  sceneProposal: { spatialAction: string; camera: string; sound: string }
  assets: { description: string; period: string; reference: string; verificationStatus: string }[]
  uncertainties: string[]
  accessibilityNotes: string
}
export const ibadanActs = [
  {
    id: 1,
    title: 'Finding a place',
    years: 'Origins–1829',
    question: 'Where can a new life begin?',
  },
  { id: 2, title: 'Building power', years: '1830s–1840', question: 'Who gets to shape a city?' },
  {
    id: 3,
    title: 'Living under power',
    years: '1851–1893',
    question: 'Whose work, whose freedom?',
  },
  { id: 4, title: 'Changing the rules', years: '1893–1929', question: 'Who sets the terms?' },
  {
    id: 5,
    title: 'Making a modern public',
    years: '1948–1966',
    question: 'Who gets to speak, learn and create?',
  },
  {
    id: 6,
    title: 'The unfinished city',
    years: '1976–an open present',
    question: 'Whose priorities shape what comes next?',
  },
] as const
export const ibadanEdition = {
  title: 'Ibadan: A City Made and Remade',
  status: 'A source-led history · interpretive spaces',
  notice:
    'Based on the historical research supplied by the owner on 24 October 2026. Source consultation and access limits are preserved in the register. The brief is the research foundation; this build does not claim independent archive visits or full-text retrieval of every source. Spatial scenes and anonymous figures are creative reconstructions, not authenticated buildings, historical portraits or eyewitness accounts. Conventional dates and oral traditions are labelled separately. No invented historical quotations are used.',
}
export const ibadanChapters: IbadanChapter[] = [
  {
    id: 'origins',
    act: 1,
    dateLabel: 'Before 1829',
    sortYear: null,
    title: 'More than one beginning',
    question: 'Can a city have more than one beginning?',
    locations: [
      {
        name: 'Earlier Ibadan settlement traditions',
        coordinates: null,
      },
    ],
    form: 'landscape',
    text: 'Traditions associate earlier Ibadan settlements with Lagelu, migration from Ile-Ife, destruction and resettlement. Their chronologies differ. These inherited accounts are part of the city’s history, rather than a single certain date for the founding of the modern settlement.',
    historicalClaims: [
      {
        text: 'Traditions associate earlier Ibadan settlements with Lagelu, migration from Ile-Ife, destruction and resettlement. Their chronologies differ. These inherited accounts are part of the city’s history, rather than a single certain date for the founding of the modern settlement.',
        sourceIds: ['S01', 'S02'],
        evidenceStatus: 'Oral tradition / disputed chronology',
      },
    ],
    people: [
      {
        name: 'Lagelu',
        role: 'Figure in founding traditions; not assigned a precise likeness or founding year',
        historicalOrComposite: 'Historical person',
      },
      {
        name: 'Custodians of memory',
        role: 'Families and communities who preserve and sometimes dispute accounts',
        historicalOrComposite: 'Historical group',
      },
    ],
    viewpoints: [
      {
        id: 'place',
        label: 'Read the place',
        title: 'Can a city have more than one beginning?',
        text: 'Traditions associate earlier Ibadan settlements with Lagelu, migration from Ile-Ife, destruction and resettlement. Their chronologies differ. These inherited accounts are part of the city’s history, rather than a single certain date for the founding of the modern settlement.',
        focus: 'place',
      },
      {
        id: 'people',
        label: 'Meet the people',
        title: 'Who makes this history?',
        text: 'Lagelu: Figure in founding traditions; not assigned a precise likeness or founding year. Custodians of memory: Families and communities who preserve and sometimes dispute accounts.',
        focus: 'people',
      },
      {
        id: 'connections',
        label: 'Follow the consequences',
        title: 'What changes for the people here?',
        text: 'Keeping different accounts visible makes room for memory without turning disagreement into a fabricated consensus. The landscape is deliberately incomplete: a place held open for more than one beginning.',
        focus: 'routes',
      },
    ],
    narration:
      'Traditions associate earlier Ibadan settlements with Lagelu, migration from Ile-Ife, destruction and resettlement. Their chronologies differ. These inherited accounts are part of the city’s history, rather than a single certain date for the founding of the modern settlement. Keeping different accounts visible makes room for memory without turning disagreement into a fabricated consensus. The landscape is deliberately incomplete: a place held open for more than one beginning.',
    sceneProposal: {
      spatialAction:
        'Change viewpoint to follow people, institutions and consequences in an interpretive space.',
      camera:
        'A restrained ground-level approach, then deliberate reframing around the selected viewpoint. No continuous orbit or random flight.',
      sound:
        'Original wind, quiet material textures and an optional spoken reading. No archival authenticity is claimed.',
    },
    assets: [
      {
        description: 'Particle landscape environment and anonymous human figures',
        period: 'Before 1829',
        reference: 'Supplied brief, sections 3–6; S01, S02',
        verificationStatus:
          'Creative reconstruction. Schematic geometry; figures are composites, not historical portrait likenesses.',
      },
    ],
    uncertainties: [
      'Exact early dates, migration routes and a likeness of Lagelu are not established here.',
    ],
    accessibilityNotes:
      'The same narrative, people, evidence and viewpoints remain available in the text edition, without WebGL, motion or audio.',
  },
  {
    id: 'arrival',
    act: 1,
    dateLabel: 'c.1829',
    sortYear: 1829,
    title: 'A place to begin again',
    question: 'What does it take to turn a place of refuge into a city?',
    locations: [
      {
        name: 'The emerging Ibadan settlement',
        coordinates: null,
      },
    ],
    form: 'arrival',
    text: 'Modern Ibadan’s conventional starting point is a military settlement formed around 1829, during the upheavals associated with the Owu wars and the breakdown of the old Oyo order. Migrants, soldiers and displaced families from different Yoruba communities helped make the new settlement.',
    historicalClaims: [
      {
        text: 'Modern Ibadan’s conventional starting point is a military settlement formed around 1829, during the upheavals associated with the Owu wars and the breakdown of the old Oyo order. Migrants, soldiers and displaced families from different Yoruba communities helped make the new settlement.',
        sourceIds: ['S02', 'S03'],
        evidenceStatus: 'Conventional date',
      },
    ],
    people: [
      {
        name: 'Arriving household',
        role: 'An explicitly fictional composite viewpoint, carrying possessions and seeking shelter',
        historicalOrComposite: 'Composite viewpoint',
      },
      {
        name: 'Migrants and soldiers',
        role: 'People from different Yoruba communities who shaped the settlement',
        historicalOrComposite: 'Historical group',
      },
    ],
    viewpoints: [
      {
        id: 'household',
        label: 'Follow a household',
        title: 'What can you carry into a new life?',
        text: 'Follow the small group approaching the courtyard. This household is a creative composite, not a recovered family biography. Their carried possessions make displacement and the search for shelter visible without inventing an eyewitness account.',
        focus: 'people',
      },
      {
        id: 'settlement',
        label: 'Read the settlement',
        title: 'Shelter for whom, security for whom?',
        text: 'The emerging settlement brought together people seeking refuge and commanders concerned with security. The open courtyard is a schematic way to explore those different needs, not a reconstruction of an identified 1829 compound.',
        focus: 'place',
      },
      {
        id: 'paths',
        label: 'Follow the paths',
        title: 'A beginning made from many arrivals',
        text: 'Migration and military organisation helped shape the new city. The illuminated paths are an editorial diagram of connection; they are not surveyed routes or evidence that the landscape was previously uninhabited.',
        focus: 'routes',
      },
    ],
    narration:
      'Modern Ibadan’s conventional starting point is a military settlement formed around 1829, during the upheavals associated with the Owu wars and the breakdown of the old Oyo order. Migrants, soldiers and displaced families from different Yoruba communities helped make the new settlement. A household’s need for shelter and a commander’s concern for security can occupy the same space without being the same story. The land was not simply empty before they arrived.',
    sceneProposal: {
      spatialAction:
        'Change viewpoint to follow people, institutions and consequences in an interpretive space.',
      camera:
        'A restrained ground-level approach, then deliberate reframing around the selected viewpoint. No continuous orbit or random flight.',
      sound:
        'Original wind, quiet material textures and an optional spoken reading. No archival authenticity is claimed.',
    },
    assets: [
      {
        description: 'Particle arrival environment and anonymous human figures',
        period: 'c.1829',
        reference: 'Supplied brief, sections 3–6; S02, S03',
        verificationStatus:
          'Creative reconstruction. Schematic geometry; figures are composites, not historical portrait likenesses.',
      },
    ],
    uncertainties: [
      'The household, possessions, path and compound layout are invented staging. Earlier settlement is not erased.',
    ],
    accessibilityNotes:
      'The same narrative, people, evidence and viewpoints remain available in the text edition, without WebGL, motion or audio.',
  },
  {
    id: 'command',
    act: 2,
    dateLabel: '1830s',
    sortYear: 1830,
    title: 'Who commands the city?',
    question: 'Who gets to decide how a new settlement is governed?',
    locations: [
      {
        name: 'Early Ibadan compounds',
        coordinates: null,
      },
    ],
    form: 'compound',
    text: 'Rival groups competed for leadership in the early settlement. The ascendancy of Oyo elements and Oluyole helped shape Ibadan’s emerging political order. Leadership grew through relationships among commanders, compound heads and dependants.',
    historicalClaims: [
      {
        text: 'Rival groups competed for leadership in the early settlement. The ascendancy of Oyo elements and Oluyole helped shape Ibadan’s emerging political order. Leadership grew through relationships among commanders, compound heads and dependants.',
        sourceIds: ['S03'],
        evidenceStatus: 'Documented',
      },
    ],
    people: [
      {
        name: 'Maye',
        role: 'A leader in the early struggle over authority',
        historicalOrComposite: 'Historical person',
      },
      {
        name: 'Oluyole',
        role: 'Associated with early leadership and consolidation',
        historicalOrComposite: 'Historical person',
      },
      {
        name: 'Compound heads and dependants',
        role: 'People inside networks of allegiance and authority',
        historicalOrComposite: 'Historical group',
      },
    ],
    viewpoints: [
      {
        id: 'place',
        label: 'Read the place',
        title: 'Who gets to decide how a new settlement is governed?',
        text: 'Rival groups competed for leadership in the early settlement. The ascendancy of Oyo elements and Oluyole helped shape Ibadan’s emerging political order. Leadership grew through relationships among commanders, compound heads and dependants.',
        focus: 'place',
      },
      {
        id: 'people',
        label: 'Meet the people',
        title: 'Who makes this history?',
        text: 'Maye: A leader in the early struggle over authority. Oluyole: Associated with early leadership and consolidation. Compound heads and dependants: People inside networks of allegiance and authority.',
        focus: 'people',
      },
      {
        id: 'connections',
        label: 'Follow the consequences',
        title: 'What changes for the people here?',
        text: 'Security could create belonging while also concentrating power. Look across the courtyard to see institutions as relationships between people, rather than a procession of heroic rulers.',
        focus: 'routes',
      },
    ],
    narration:
      'Rival groups competed for leadership in the early settlement. The ascendancy of Oyo elements and Oluyole helped shape Ibadan’s emerging political order. Leadership grew through relationships among commanders, compound heads and dependants. Security could create belonging while also concentrating power. Look across the courtyard to see institutions as relationships between people, rather than a procession of heroic rulers.',
    sceneProposal: {
      spatialAction:
        'Change viewpoint to follow people, institutions and consequences in an interpretive space.',
      camera:
        'A restrained ground-level approach, then deliberate reframing around the selected viewpoint. No continuous orbit or random flight.',
      sound:
        'Original wind, quiet material textures and an optional spoken reading. No archival authenticity is claimed.',
    },
    assets: [
      {
        description: 'Particle compound environment and anonymous human figures',
        period: '1830s',
        reference: 'Supplied brief, sections 3–6; S03',
        verificationStatus:
          'Creative reconstruction. Schematic geometry; figures are composites, not historical portrait likenesses.',
      },
    ],
    uncertainties: [
      'The full sequence of leadership turnovers, exact titles on each date and individual biographical details require checking against the full historical works.',
    ],
    accessibilityNotes:
      'The same narrative, people, evidence and viewpoints remain available in the text edition, without WebGL, motion or audio.',
  },
  {
    id: 'osogbo',
    act: 2,
    dateLabel: '1840',
    sortYear: 1840,
    title: 'Power beyond the city',
    question: 'What did victory change, and for whom?',
    locations: [
      {
        name: 'Osogbo — a regional setting outside Ibadan',
        coordinates: null,
      },
    ],
    form: 'regional',
    text: 'In 1840, Ibadan forces under Balogun Oderinlo defeated an Ilorin force at Osogbo. The campaign was a major episode in the regional balance of power. Osogbo is part of Ibadan’s regional story, not a location inside the city.',
    historicalClaims: [
      {
        text: 'In 1840, Ibadan forces under Balogun Oderinlo defeated an Ilorin force at Osogbo. The campaign was a major episode in the regional balance of power. Osogbo is part of Ibadan’s regional story, not a location inside the city.',
        sourceIds: ['S03'],
        evidenceStatus: 'Documented',
      },
    ],
    people: [
      {
        name: 'Balogun Oderinlo',
        role: 'Commander associated with the Osogbo campaign',
        historicalOrComposite: 'Historical person',
      },
      {
        name: 'Osogbo residents',
        role: 'People living in the place where the campaign unfolded',
        historicalOrComposite: 'Historical group',
      },
      {
        name: 'Returning messenger',
        role: 'A composite viewpoint for considering consequences, not an eyewitness testimony',
        historicalOrComposite: 'Composite viewpoint',
      },
    ],
    viewpoints: [
      {
        id: 'place',
        label: 'Read the place',
        title: 'What did victory change, and for whom?',
        text: 'In 1840, Ibadan forces under Balogun Oderinlo defeated an Ilorin force at Osogbo. The campaign was a major episode in the regional balance of power. Osogbo is part of Ibadan’s regional story, not a location inside the city.',
        focus: 'place',
      },
      {
        id: 'people',
        label: 'Meet the people',
        title: 'Who makes this history?',
        text: 'Balogun Oderinlo: Commander associated with the Osogbo campaign. Osogbo residents: People living in the place where the campaign unfolded. Returning messenger: A composite viewpoint for considering consequences, not an eyewitness testimony.',
        focus: 'people',
      },
      {
        id: 'connections',
        label: 'Follow the consequences',
        title: 'What changes for the people here?',
        text: 'Military success expanded influence, but its meaning depended on whether one was protected, displaced, commanded or required to support the wider system. The regional connections are schematic, not a tactical map.',
        focus: 'routes',
      },
    ],
    narration:
      'In 1840, Ibadan forces under Balogun Oderinlo defeated an Ilorin force at Osogbo. The campaign was a major episode in the regional balance of power. Osogbo is part of Ibadan’s regional story, not a location inside the city. Military success expanded influence, but its meaning depended on whether one was protected, displaced, commanded or required to support the wider system. The regional connections are schematic, not a tactical map.',
    sceneProposal: {
      spatialAction:
        'Change viewpoint to follow people, institutions and consequences in an interpretive space.',
      camera:
        'A restrained ground-level approach, then deliberate reframing around the selected viewpoint. No continuous orbit or random flight.',
      sound:
        'Original wind, quiet material textures and an optional spoken reading. No archival authenticity is claimed.',
    },
    assets: [
      {
        description: 'Particle regional environment and anonymous human figures',
        period: '1840',
        reference: 'Supplied brief, sections 3–6; S03',
        verificationStatus:
          'Creative reconstruction. Schematic geometry; figures are composites, not historical portrait likenesses.',
      },
    ],
    uncertainties: [
      'No troop totals, precise battle plan, invented dispatch or single-cause claim about all subsequent Yoruba history is supplied.',
    ],
    accessibilityNotes:
      'The same narrative, people, evidence and viewpoints remain available in the text edition, without WebGL, motion or audio.',
  },
  {
    id: 'learning',
    act: 3,
    dateLabel: '1851 onward',
    sortYear: 1851,
    title: 'Learning, belief, translation',
    question: 'Who teaches, who translates, and who chooses?',
    locations: [
      {
        name: 'Ibadan’s changing religious and educational life',
        coordinates: null,
      },
    ],
    form: 'school',
    text: 'David Hinderer visited Ibadan in 1851. His missionary activity and later work with Anna Hinderer belonged to a wider landscape of religious and educational change. Local pupils, interpreters and converts had agency; education and belief did not begin with Europeans.',
    historicalClaims: [
      {
        text: 'David Hinderer visited Ibadan in 1851. His missionary activity and later work with Anna Hinderer belonged to a wider landscape of religious and educational change. Local pupils, interpreters and converts had agency; education and belief did not begin with Europeans.',
        sourceIds: ['S04', 'S23'],
        evidenceStatus: 'Documented',
      },
    ],
    people: [
      {
        name: 'David and Anna Hinderer',
        role: 'Missionary figures whose work must be read in its own perspective',
        historicalOrComposite: 'Historical person',
      },
      {
        name: 'Local pupils, interpreters and teachers',
        role: 'African participants in learning, translation and religious change',
        historicalOrComposite: 'Historical group',
      },
      {
        name: 'Muslim and indigenous Yoruba communities',
        role: 'Part of the city’s lived religious and intellectual world',
        historicalOrComposite: 'Historical group',
      },
    ],
    viewpoints: [
      {
        id: 'place',
        label: 'Read the place',
        title: 'Who teaches, who translates, and who chooses?',
        text: 'David Hinderer visited Ibadan in 1851. His missionary activity and later work with Anna Hinderer belonged to a wider landscape of religious and educational change. Local pupils, interpreters and converts had agency; education and belief did not begin with Europeans.',
        focus: 'place',
      },
      {
        id: 'people',
        label: 'Meet the people',
        title: 'Who makes this history?',
        text: 'David and Anna Hinderer: Missionary figures whose work must be read in its own perspective. Local pupils, interpreters and teachers: African participants in learning, translation and religious change. Muslim and indigenous Yoruba communities: Part of the city’s lived religious and intellectual world.',
        focus: 'people',
      },
      {
        id: 'connections',
        label: 'Follow the consequences',
        title: 'What changes for the people here?',
        text: 'Christianity, Islam and indigenous Yoruba religious life belong in the same account of a changing city. A first visit is different from a permanent mission, and a missionary source is not the whole social history.',
        focus: 'routes',
      },
    ],
    narration:
      'David Hinderer visited Ibadan in 1851. His missionary activity and later work with Anna Hinderer belonged to a wider landscape of religious and educational change. Local pupils, interpreters and converts had agency; education and belief did not begin with Europeans. Christianity, Islam and indigenous Yoruba religious life belong in the same account of a changing city. A first visit is different from a permanent mission, and a missionary source is not the whole social history.',
    sceneProposal: {
      spatialAction:
        'Change viewpoint to follow people, institutions and consequences in an interpretive space.',
      camera:
        'A restrained ground-level approach, then deliberate reframing around the selected viewpoint. No continuous orbit or random flight.',
      sound:
        'Original wind, quiet material textures and an optional spoken reading. No archival authenticity is claimed.',
    },
    assets: [
      {
        description: 'Particle school environment and anonymous human figures',
        period: '1851 onward',
        reference: 'Supplied brief, sections 3–6; S04, S23',
        verificationStatus:
          'Creative reconstruction. Schematic geometry; figures are composites, not historical portrait likenesses.',
      },
    ],
    uncertainties: [
      'Named rites, mosque dates, exact classroom layouts and conversations are not reconstructed. The Islamic education study concerns 1893–1960, not a dated 1851 institution.',
    ],
    accessibilityNotes:
      'The same narrative, people, evidence and viewpoints remain available in the text edition, without WebGL, motion or audio.',
  },
  {
    id: 'ijaiye',
    act: 3,
    dateLabel: '1860–1862',
    sortYear: 1860,
    title: 'A route interrupted',
    question: 'How does a struggle for authority reach an ordinary household?',
    locations: [
      {
        name: 'Ibadan and Ijaiye — separate regional places',
        coordinates: null,
      },
    ],
    form: 'regional',
    text: 'Rivalry between Ibadan and Ijaiye culminated in Ijaiye’s destruction in 1862. Regional power, allegiance to Oyo and political conflict were central to the struggle. Wider conflict continued beyond this core episode in some historical accounts.',
    historicalClaims: [
      {
        text: 'Rivalry between Ibadan and Ijaiye culminated in Ijaiye’s destruction in 1862. Regional power, allegiance to Oyo and political conflict were central to the struggle. Wider conflict continued beyond this core episode in some historical accounts.',
        sourceIds: ['S05'],
        evidenceStatus: 'Documented',
      },
    ],
    people: [
      {
        name: 'Kurunmi of Ijaiye',
        role: 'A leader within the regional conflict',
        historicalOrComposite: 'Historical person',
      },
      {
        name: 'Ogunmola and Ibikunle',
        role: 'Ibadan figures associated with the struggle',
        historicalOrComposite: 'Historical person',
      },
      {
        name: 'Displaced families',
        role: 'People whose routes, supplies and homes were affected',
        historicalOrComposite: 'Historical group',
      },
    ],
    viewpoints: [
      {
        id: 'place',
        label: 'Read the place',
        title: 'How does a struggle for authority reach an ordinary household?',
        text: 'Rivalry between Ibadan and Ijaiye culminated in Ijaiye’s destruction in 1862. Regional power, allegiance to Oyo and political conflict were central to the struggle. Wider conflict continued beyond this core episode in some historical accounts.',
        focus: 'place',
      },
      {
        id: 'people',
        label: 'Meet the people',
        title: 'Who makes this history?',
        text: 'Kurunmi of Ijaiye: A leader within the regional conflict. Ogunmola and Ibikunle: Ibadan figures associated with the struggle. Displaced families: People whose routes, supplies and homes were affected.',
        focus: 'people',
      },
      {
        id: 'connections',
        label: 'Follow the consequences',
        title: 'What changes for the people here?',
        text: 'Follow the broken connection rather than a battlefield score. Interrupted food supplies and forced movement make the consequences legible without reducing the conflict to a personal insult.',
        focus: 'routes',
      },
    ],
    narration:
      'Rivalry between Ibadan and Ijaiye culminated in Ijaiye’s destruction in 1862. Regional power, allegiance to Oyo and political conflict were central to the struggle. Wider conflict continued beyond this core episode in some historical accounts. Follow the broken connection rather than a battlefield score. Interrupted food supplies and forced movement make the consequences legible without reducing the conflict to a personal insult.',
    sceneProposal: {
      spatialAction:
        'Change viewpoint to follow people, institutions and consequences in an interpretive space.',
      camera:
        'A restrained ground-level approach, then deliberate reframing around the selected viewpoint. No continuous orbit or random flight.',
      sound:
        'Original wind, quiet material textures and an optional spoken reading. No archival authenticity is claimed.',
    },
    assets: [
      {
        description: 'Particle regional environment and anonymous human figures',
        period: '1860–1862',
        reference: 'Supplied brief, sections 3–6; S05',
        verificationStatus:
          'Creative reconstruction. Schematic geometry; figures are composites, not historical portrait likenesses.',
      },
    ],
    uncertainties: [
      'Some histories extend the wider conflict to 1865. Precise military staging and invented civilian testimony are omitted.',
    ],
    accessibilityNotes:
      'The same narrative, people, evidence and viewpoints remain available in the text edition, without WebGL, motion or audio.',
  },
  {
    id: 'efunsetan',
    act: 3,
    dateLabel: '1860s–1874',
    sortYear: null,
    title: 'Efunsetan’s world',
    question: 'How do wealth, gender and coercion meet in one compound?',
    locations: [
      {
        name: 'A schematic commercial compound in Ibadan',
        coordinates: null,
      },
    ],
    form: 'market',
    text: 'Efunsetan Aniwura was a powerful Iyalode and commercial figure involved in Ibadan politics. Scholarship identifies her death on 30 June 1874 as murder and challenges familiar dramatic portrayals. Her influence must be considered alongside the enslaved labour embedded in elite economies.',
    historicalClaims: [
      {
        text: 'Efunsetan Aniwura was a powerful Iyalode and commercial figure involved in Ibadan politics. Scholarship identifies her death on 30 June 1874 as murder and challenges familiar dramatic portrayals. Her influence must be considered alongside the enslaved labour embedded in elite economies.',
        sourceIds: ['S06'],
        evidenceStatus: 'Documented',
      },
    ],
    people: [
      {
        name: 'Efunsetan Aniwura',
        role: 'Iyalode, commercial figure and political actor; no invented portrait or private thoughts',
        historicalOrComposite: 'Historical person',
      },
      {
        name: 'Aare Latoosa',
        role: 'A political authority within the world of the episode',
        historicalOrComposite: 'Historical person',
      },
      {
        name: 'Traders and enslaved people',
        role: 'People whose agency and constrained choices must not be erased',
        historicalOrComposite: 'Historical group',
      },
    ],
    viewpoints: [
      {
        id: 'commerce',
        label: 'Follow the trade',
        title: 'A commercial world, built through relationships',
        text: 'The compound connects trade, credit, storage and political influence. Efunsetan’s position as Iyalode and commercial figure gives the scene its historical subject; the bales and paths are schematic illustrations, not an inventory of her property.',
        focus: 'routes',
      },
      {
        id: 'labour',
        label: 'Look at the labour',
        title: 'Whose work makes wealth possible?',
        text: 'Enslaved people sustained elite households and production. The figures here are composite human viewpoints, never resources to collect or command. Commercial achievement is shown alongside coercion and constrained choice.',
        focus: 'people',
      },
      {
        id: 'authority',
        label: 'Read the power',
        title: 'A woman’s influence in a contested political world',
        text: 'Read Efunsetan’s political and commercial agency alongside military authority and the gendered ways her story was later told. The evidence panel distinguishes historical scholarship from stage and screen portrayals.',
        focus: 'place',
      },
    ],
    narration:
      'Efunsetan Aniwura was a powerful Iyalode and commercial figure involved in Ibadan politics. Scholarship identifies her death on 30 June 1874 as murder and challenges familiar dramatic portrayals. Her influence must be considered alongside the enslaved labour embedded in elite economies. A dramatic character is not a transparent biography. Look at commerce, labour and authority together: neither a villain from a film nor a sanitised success story is enough to understand her world.',
    sceneProposal: {
      spatialAction:
        'Change viewpoint to follow people, institutions and consequences in an interpretive space.',
      camera:
        'A restrained ground-level approach, then deliberate reframing around the selected viewpoint. No continuous orbit or random flight.',
      sound:
        'Original wind, quiet material textures and an optional spoken reading. No archival authenticity is claimed.',
    },
    assets: [
      {
        description: 'Particle market environment and anonymous human figures',
        period: '1860s–1874',
        reference: 'Supplied brief, sections 3–6; S06',
        verificationStatus:
          'Creative reconstruction. Schematic geometry; figures are composites, not historical portrait likenesses.',
      },
    ],
    uncertainties: [
      'Exact compound plans, a portrait likeness, private dialogue and theatrical plot details are not treated as historical evidence.',
    ],
    accessibilityNotes:
      'The same narrative, people, evidence and viewpoints remain available in the text edition, without WebGL, motion or audio.',
  },
  {
    id: 'kiriji',
    act: 3,
    dateLabel: '1877–1893',
    sortYear: 1877,
    title: 'The limits of empire',
    question: 'What happens when other communities refuse domination?',
    locations: [
      {
        name: 'Ibadan and eastern Yoruba communities — regional connections',
        coordinates: null,
      },
    ],
    form: 'regional',
    text: 'The Ekiti-Parapo or Kiriji struggle challenged Ibadan’s regional domination. Latoosa, Ogedengbe and Fabunmi belong to a history of imperial ambition and demands for autonomy. The 1886 peace settlement was a milestone within a longer conflict that wound down by 1893.',
    historicalClaims: [
      {
        text: 'The Ekiti-Parapo or Kiriji struggle challenged Ibadan’s regional domination. Latoosa, Ogedengbe and Fabunmi belong to a history of imperial ambition and demands for autonomy. The 1886 peace settlement was a milestone within a longer conflict that wound down by 1893.',
        sourceIds: ['S07'],
        evidenceStatus: 'Documented',
      },
    ],
    people: [
      {
        name: 'Aare Latoosa',
        role: 'Associated with Ibadan’s authority during the conflict',
        historicalOrComposite: 'Historical person',
      },
      {
        name: 'Ogedengbe and Fabunmi',
        role: 'Figures associated with resistance and regional struggle',
        historicalOrComposite: 'Historical person',
      },
      {
        name: 'Residents subject to tribute and warfare',
        role: 'Communities with interests distinct from those of commanders',
        historicalOrComposite: 'Historical group',
      },
    ],
    viewpoints: [
      {
        id: 'place',
        label: 'Read the place',
        title: 'What happens when other communities refuse domination?',
        text: 'The Ekiti-Parapo or Kiriji struggle challenged Ibadan’s regional domination. Latoosa, Ogedengbe and Fabunmi belong to a history of imperial ambition and demands for autonomy. The 1886 peace settlement was a milestone within a longer conflict that wound down by 1893.',
        focus: 'place',
      },
      {
        id: 'people',
        label: 'Meet the people',
        title: 'Who makes this history?',
        text: 'Aare Latoosa: Associated with Ibadan’s authority during the conflict. Ogedengbe and Fabunmi: Figures associated with resistance and regional struggle. Residents subject to tribute and warfare: Communities with interests distinct from those of commanders.',
        focus: 'people',
      },
      {
        id: 'connections',
        label: 'Follow the consequences',
        title: 'What changes for the people here?',
        text: 'Change viewpoint to consider the system from the city and from communities resisting it. One agreement did not instantly end all hostilities. The dates 1886 and 1893 remain distinct.',
        focus: 'routes',
      },
    ],
    narration:
      'The Ekiti-Parapo or Kiriji struggle challenged Ibadan’s regional domination. Latoosa, Ogedengbe and Fabunmi belong to a history of imperial ambition and demands for autonomy. The 1886 peace settlement was a milestone within a longer conflict that wound down by 1893. Change viewpoint to consider the system from the city and from communities resisting it. One agreement did not instantly end all hostilities. The dates 1886 and 1893 remain distinct.',
    sceneProposal: {
      spatialAction:
        'Change viewpoint to follow people, institutions and consequences in an interpretive space.',
      camera:
        'A restrained ground-level approach, then deliberate reframing around the selected viewpoint. No continuous orbit or random flight.',
      sound:
        'Original wind, quiet material textures and an optional spoken reading. No archival authenticity is claimed.',
    },
    assets: [
      {
        description: 'Particle regional environment and anonymous human figures',
        period: '1877–1893',
        reference: 'Supplied brief, sections 3–6; S07',
        verificationStatus:
          'Creative reconstruction. Schematic geometry; figures are composites, not historical portrait likenesses.',
      },
    ],
    uncertainties: [
      'Disputed origin anecdotes, troop totals and “world’s longest war” claims are excluded.',
    ],
    accessibilityNotes:
      'The same narrative, people, evidence and viewpoints remain available in the text edition, without WebGL, motion or audio.',
  },
  {
    id: 'agreement',
    act: 4,
    dateLabel: '15 August 1893',
    sortYear: 1893,
    title: 'What the agreement leaves out',
    question: 'Who is represented at a negotiating table?',
    locations: [
      {
        name: 'Ibadan — the colonial agreement',
        coordinates: null,
      },
    ],
    form: 'treaty',
    text: 'On 15 August 1893, Baale Fijabi and Ibadan authorities entered an agreement with Acting Governor G. C. Denton. Negotiations exposed concerns about land, local authority and slavery. Correspondence reproduced by Samuel Johnson includes British assurances concerning the continuation of domestic slavery.',
    historicalClaims: [
      {
        text: 'On 15 August 1893, Baale Fijabi and Ibadan authorities entered an agreement with Acting Governor G. C. Denton. Negotiations exposed concerns about land, local authority and slavery. Correspondence reproduced by Samuel Johnson includes British assurances concerning the continuation of domestic slavery.',
        sourceIds: ['S08', 'S09'],
        evidenceStatus: 'Documented',
      },
    ],
    people: [
      {
        name: 'Baale Fijabi',
        role: 'Ibadan authority involved in the agreement',
        historicalOrComposite: 'Historical person',
      },
      {
        name: 'G. C. Denton',
        role: 'Acting Governor involved in the colonial agreement',
        historicalOrComposite: 'Historical person',
      },
      {
        name: 'Interpreters and people excluded from negotiation',
        role: 'Unequal access to the power of the document',
        historicalOrComposite: 'Historical group',
      },
    ],
    viewpoints: [
      {
        id: 'place',
        label: 'Read the place',
        title: 'Who is represented at a negotiating table?',
        text: 'On 15 August 1893, Baale Fijabi and Ibadan authorities entered an agreement with Acting Governor G. C. Denton. Negotiations exposed concerns about land, local authority and slavery. Correspondence reproduced by Samuel Johnson includes British assurances concerning the continuation of domestic slavery.',
        focus: 'place',
      },
      {
        id: 'people',
        label: 'Meet the people',
        title: 'Who makes this history?',
        text: 'Baale Fijabi: Ibadan authority involved in the agreement. G. C. Denton: Acting Governor involved in the colonial agreement. Interpreters and people excluded from negotiation: Unequal access to the power of the document.',
        focus: 'people',
      },
      {
        id: 'connections',
        label: 'Follow the consequences',
        title: 'What changes for the people here?',
        text: 'The agreement was not a simple exchange in which Britain immediately abolished slavery. The scene asks visitors to consider whose interests entered the document and whose voices did not.',
        focus: 'routes',
      },
    ],
    narration:
      'On 15 August 1893, Baale Fijabi and Ibadan authorities entered an agreement with Acting Governor G. C. Denton. Negotiations exposed concerns about land, local authority and slavery. Correspondence reproduced by Samuel Johnson includes British assurances concerning the continuation of domestic slavery. The agreement was not a simple exchange in which Britain immediately abolished slavery. The scene asks visitors to consider whose interests entered the document and whose voices did not.',
    sceneProposal: {
      spatialAction:
        'Change viewpoint to follow people, institutions and consequences in an interpretive space.',
      camera:
        'A restrained ground-level approach, then deliberate reframing around the selected viewpoint. No continuous orbit or random flight.',
      sound:
        'Original wind, quiet material textures and an optional spoken reading. No archival authenticity is claimed.',
    },
    assets: [
      {
        description: 'Particle treaty environment and anonymous human figures',
        period: '15 August 1893',
        reference: 'Supplied brief, sections 3–6; S08, S09',
        verificationStatus:
          'Creative reconstruction. Schematic geometry; figures are composites, not historical portrait likenesses.',
      },
    ],
    uncertainties: [
      'No text on the schematic document is a fabricated historical quotation. Johnson’s interpretations and reproduced correspondence must be distinguished.',
    ],
    accessibilityNotes:
      'The same narrative, people, evidence and viewpoints remain available in the text edition, without WebGL, motion or audio.',
  },
  {
    id: 'rail',
    act: 4,
    dateLabel: '1898–1901',
    sortYear: 1898,
    title: 'A consignment, many hands',
    question: 'Who handles the things that make a city’s commerce?',
    locations: [
      {
        name: 'Dugbe, Ogunpa and Old Gbagi',
        coordinates: null,
      },
    ],
    form: 'rail',
    text: 'The Nigerian Railway Corporation dates construction of the Lagos–Ibadan line to 1898–1901. Research connects railway access with commercial concentration around Dugbe, Ogunpa and Old Gbagi. Labourers, porters, women traders and Lebanese merchants participated in changing networks of trade.',
    historicalClaims: [
      {
        text: 'The Nigerian Railway Corporation dates construction of the Lagos–Ibadan line to 1898–1901. Research connects railway access with commercial concentration around Dugbe, Ogunpa and Old Gbagi. Labourers, porters, women traders and Lebanese merchants participated in changing networks of trade.',
        sourceIds: ['S10', 'S11'],
        evidenceStatus: 'Documented',
      },
    ],
    people: [
      {
        name: 'Railway labourers and porters',
        role: 'People who built and moved the network’s goods',
        historicalOrComposite: 'Historical group',
      },
      {
        name: 'Market women',
        role: 'Commercial agents within the changing city',
        historicalOrComposite: 'Historical group',
      },
      {
        name: 'Lebanese merchants',
        role: 'Participants in the documented trading relationships',
        historicalOrComposite: 'Historical group',
      },
    ],
    viewpoints: [
      {
        id: 'place',
        label: 'Read the place',
        title: 'Who handles the things that make a city’s commerce?',
        text: 'The Nigerian Railway Corporation dates construction of the Lagos–Ibadan line to 1898–1901. Research connects railway access with commercial concentration around Dugbe, Ogunpa and Old Gbagi. Labourers, porters, women traders and Lebanese merchants participated in changing networks of trade.',
        focus: 'place',
      },
      {
        id: 'people',
        label: 'Meet the people',
        title: 'Who makes this history?',
        text: 'Railway labourers and porters: People who built and moved the network’s goods. Market women: Commercial agents within the changing city. Lebanese merchants: Participants in the documented trading relationships.',
        focus: 'people',
      },
      {
        id: 'connections',
        label: 'Follow the consequences',
        title: 'What changes for the people here?',
        text: 'Follow the route from arrival to exchange. Access changed where commerce concentrated, but the railway’s effects were made through human work and unequal colonial relationships.',
        focus: 'routes',
      },
    ],
    narration:
      'The Nigerian Railway Corporation dates construction of the Lagos–Ibadan line to 1898–1901. Research connects railway access with commercial concentration around Dugbe, Ogunpa and Old Gbagi. Labourers, porters, women traders and Lebanese merchants participated in changing networks of trade. Follow the route from arrival to exchange. Access changed where commerce concentrated, but the railway’s effects were made through human work and unequal colonial relationships.',
    sceneProposal: {
      spatialAction:
        'Change viewpoint to follow people, institutions and consequences in an interpretive space.',
      camera:
        'A restrained ground-level approach, then deliberate reframing around the selected viewpoint. No continuous orbit or random flight.',
      sound:
        'Original wind, quiet material textures and an optional spoken reading. No archival authenticity is claimed.',
    },
    assets: [
      {
        description: 'Particle rail environment and anonymous human figures',
        period: '1898–1901',
        reference: 'Supplied brief, sections 3–6; S10, S11',
        verificationStatus:
          'Creative reconstruction. Schematic geometry; figures are composites, not historical portrait likenesses.',
      },
    ],
    uncertainties: [
      'The railway alignment, engine, station, freight packaging and the specific consignment are schematic rather than authenticated period assets.',
    ],
    accessibilityNotes:
      'The same narrative, people, evidence and viewpoints remain available in the text edition, without WebGL, motion or audio.',
  },
  {
    id: 'mapo',
    act: 4,
    dateLabel: '1929',
    sortYear: 1929,
    title: 'Authority on the hill',
    question: 'How does a civic building speak to the city around it?',
    locations: [
      {
        name: 'Mapo Hill, Ibadan',
        coordinates: null,
      },
    ],
    form: 'mapo',
    text: 'Mapo Hall became a prominent colonial-era civic building on Mapo Hill. The broad milestone is its commissioning in 1929, which should be distinguished from its construction history. The surrounding city connected civic authority with commercial and everyday life.',
    historicalClaims: [
      {
        text: 'Mapo Hall became a prominent colonial-era civic building on Mapo Hill. The broad milestone is its commissioning in 1929, which should be distinguished from its construction history. The surrounding city connected civic authority with commercial and everyday life.',
        sourceIds: ['S12'],
        evidenceStatus: 'Documented',
      },
    ],
    people: [
      {
        name: 'Builders and residents',
        role: 'People whose work and lives surrounded the civic institution',
        historicalOrComposite: 'Historical group',
      },
      {
        name: 'Municipal and traditional authorities',
        role: 'Different forms of authority within the city',
        historicalOrComposite: 'Historical group',
      },
    ],
    viewpoints: [
      {
        id: 'place',
        label: 'Read the place',
        title: 'How does a civic building speak to the city around it?',
        text: 'Mapo Hall became a prominent colonial-era civic building on Mapo Hill. The broad milestone is its commissioning in 1929, which should be distinguished from its construction history. The surrounding city connected civic authority with commercial and everyday life.',
        focus: 'place',
      },
      {
        id: 'people',
        label: 'Meet the people',
        title: 'Who makes this history?',
        text: 'Builders and residents: People whose work and lives surrounded the civic institution. Municipal and traditional authorities: Different forms of authority within the city.',
        focus: 'people',
      },
      {
        id: 'connections',
        label: 'Follow the consequences',
        title: 'What changes for the people here?',
        text: 'Move between the civic façade and the life below it. The hall belongs to a twentieth-century chapter; it is never projected backwards into the 1829 settlement or the 1840 campaign.',
        focus: 'routes',
      },
    ],
    narration:
      'Mapo Hall became a prominent colonial-era civic building on Mapo Hill. The broad milestone is its commissioning in 1929, which should be distinguished from its construction history. The surrounding city connected civic authority with commercial and everyday life. Move between the civic façade and the life below it. The hall belongs to a twentieth-century chapter; it is never projected backwards into the 1829 settlement or the 1840 campaign.',
    sceneProposal: {
      spatialAction:
        'Change viewpoint to follow people, institutions and consequences in an interpretive space.',
      camera:
        'A restrained ground-level approach, then deliberate reframing around the selected viewpoint. No continuous orbit or random flight.',
      sound:
        'Original wind, quiet material textures and an optional spoken reading. No archival authenticity is claimed.',
    },
    assets: [
      {
        description: 'Particle mapo environment and anonymous human figures',
        period: '1929',
        reference: 'Supplied brief, sections 3–6; S12',
        verificationStatus:
          'Creative reconstruction. Schematic geometry; figures are composites, not historical portrait likenesses.',
      },
    ],
    uncertainties: [
      'The façade is explicitly schematic. Original construction records, dated photographs and a measured architectural survey have not been supplied.',
    ],
    accessibilityNotes:
      'The same narrative, people, evidence and viewpoints remain available in the text edition, without WebGL, motion or audio.',
  },
  {
    id: 'university',
    act: 5,
    dateLabel: '1948–1962',
    sortYear: 1948,
    title: 'Who produces knowledge?',
    question: 'Whose questions belong in a university?',
    locations: [
      {
        name: 'University College Ibadan / University of Ibadan',
        coordinates: null,
      },
    ],
    form: 'university',
    text: 'University College Ibadan began in 1948 in a special relationship with the University of London. It became an independent university in 1962. Its history includes students, lecturers, librarians, technicians and campus workers, alongside the public life of research and debate.',
    historicalClaims: [
      {
        text: 'University College Ibadan began in 1948 in a special relationship with the University of London. It became an independent university in 1962. Its history includes students, lecturers, librarians, technicians and campus workers, alongside the public life of research and debate.',
        sourceIds: ['S15'],
        evidenceStatus: 'Documented',
      },
    ],
    people: [
      {
        name: 'Students and lecturers',
        role: 'People producing, questioning and transmitting knowledge',
        historicalOrComposite: 'Historical group',
      },
      {
        name: 'Librarians, technicians and campus workers',
        role: 'People sustaining the institution’s daily life',
        historicalOrComposite: 'Historical group',
      },
    ],
    viewpoints: [
      {
        id: 'place',
        label: 'Read the place',
        title: 'Whose questions belong in a university?',
        text: 'University College Ibadan began in 1948 in a special relationship with the University of London. It became an independent university in 1962. Its history includes students, lecturers, librarians, technicians and campus workers, alongside the public life of research and debate.',
        focus: 'place',
      },
      {
        id: 'people',
        label: 'Meet the people',
        title: 'Who makes this history?',
        text: 'Students and lecturers: People producing, questioning and transmitting knowledge. Librarians, technicians and campus workers: People sustaining the institution’s daily life.',
        focus: 'people',
      },
      {
        id: 'connections',
        label: 'Follow the consequences',
        title: 'What changes for the people here?',
        text: 'The opening of a reading room leads to a question about who produces knowledge about Africa. The institution’s beginning and its autonomy are two milestones rather than one event.',
        focus: 'routes',
      },
    ],
    narration:
      'University College Ibadan began in 1948 in a special relationship with the University of London. It became an independent university in 1962. Its history includes students, lecturers, librarians, technicians and campus workers, alongside the public life of research and debate. The opening of a reading room leads to a question about who produces knowledge about Africa. The institution’s beginning and its autonomy are two milestones rather than one event.',
    sceneProposal: {
      spatialAction:
        'Change viewpoint to follow people, institutions and consequences in an interpretive space.',
      camera:
        'A restrained ground-level approach, then deliberate reframing around the selected viewpoint. No continuous orbit or random flight.',
      sound:
        'Original wind, quiet material textures and an optional spoken reading. No archival authenticity is claimed.',
    },
    assets: [
      {
        description: 'Particle university environment and anonymous human figures',
        period: '1948–1962',
        reference: 'Supplied brief, sections 3–6; S15',
        verificationStatus:
          'Creative reconstruction. Schematic geometry; figures are composites, not historical portrait likenesses.',
      },
    ],
    uncertainties: [
      'The reading room is a creative reconstruction. Today’s campus layout is not used as evidence for the 1948 campus.',
    ],
    accessibilityNotes:
      'The same narrative, people, evidence and viewpoints remain available in the text edition, without WebGL, motion or audio.',
  },
  {
    id: 'wntv',
    act: 5,
    dateLabel: '31 October 1959',
    sortYear: 1959,
    title: 'The city sends a signal',
    question: 'Who makes a broadcast, and who gets to watch?',
    locations: [
      {
        name: 'WNTV, Ibadan',
        coordinates: null,
      },
    ],
    form: 'broadcast',
    text: 'Western Nigeria Television went on air from Ibadan on 31 October 1959. Broadcasting linked regional political ambition, education and a new medium for public life. Technicians, performers and viewers belong alongside the officials associated with its establishment.',
    historicalClaims: [
      {
        text: 'Western Nigeria Television went on air from Ibadan on 31 October 1959. Broadcasting linked regional political ambition, education and a new medium for public life. Technicians, performers and viewers belong alongside the officials associated with its establishment.',
        sourceIds: ['S13', 'S14'],
        evidenceStatus: 'Documented',
      },
    ],
    people: [
      {
        name: 'Obafemi Awolowo and Anthony Enahoro',
        role: 'Political figures associated with the broadcasting initiative',
        historicalOrComposite: 'Historical person',
      },
      {
        name: 'Technicians, performers and viewers',
        role: 'People making and receiving a new public medium',
        historicalOrComposite: 'Historical group',
      },
    ],
    viewpoints: [
      {
        id: 'place',
        label: 'Read the place',
        title: 'Who makes a broadcast, and who gets to watch?',
        text: 'Western Nigeria Television went on air from Ibadan on 31 October 1959. Broadcasting linked regional political ambition, education and a new medium for public life. Technicians, performers and viewers belong alongside the officials associated with its establishment.',
        focus: 'place',
      },
      {
        id: 'people',
        label: 'Meet the people',
        title: 'Who makes this history?',
        text: 'Obafemi Awolowo and Anthony Enahoro: Political figures associated with the broadcasting initiative. Technicians, performers and viewers: People making and receiving a new public medium.',
        focus: 'people',
      },
      {
        id: 'connections',
        label: 'Follow the consequences',
        title: 'What changes for the people here?',
        text: 'Change viewpoint between production and reception. This account uses the documented launch date and avoids an unqualified “Africa’s first television station” claim, because earlier North African broadcasting needs to be considered.',
        focus: 'routes',
      },
    ],
    narration:
      'Western Nigeria Television went on air from Ibadan on 31 October 1959. Broadcasting linked regional political ambition, education and a new medium for public life. Technicians, performers and viewers belong alongside the officials associated with its establishment. Change viewpoint between production and reception. This account uses the documented launch date and avoids an unqualified “Africa’s first television station” claim, because earlier North African broadcasting needs to be considered.',
    sceneProposal: {
      spatialAction:
        'Change viewpoint to follow people, institutions and consequences in an interpretive space.',
      camera:
        'A restrained ground-level approach, then deliberate reframing around the selected viewpoint. No continuous orbit or random flight.',
      sound:
        'Original wind, quiet material textures and an optional spoken reading. No archival authenticity is claimed.',
    },
    assets: [
      {
        description: 'Particle broadcast environment and anonymous human figures',
        period: '31 October 1959',
        reference: 'Supplied brief, sections 3–6; S13, S14',
        verificationStatus:
          'Creative reconstruction. Schematic geometry; figures are composites, not historical portrait likenesses.',
      },
    ],
    uncertainties: [
      'The studio and viewing group are illustrative. No archive footage, authentic equipment model or invented broadcast speech is reproduced.',
    ],
    accessibilityNotes:
      'The same narrative, people, evidence and viewpoints remain available in the text edition, without WebGL, motion or audio.',
  },
  {
    id: 'mbari',
    act: 5,
    dateLabel: '1961',
    sortYear: 1961,
    title: 'A courtyard for the possible',
    question: 'What kind of public can artists make together?',
    locations: [
      {
        name: 'Mbari, Onireke Road near Dugbe',
        coordinates: null,
      },
    ],
    form: 'mbari',
    text: 'The Mbari Artists’ and Writers’ Club formed in Ibadan in 1961, bringing literary, visual and performing arts together. The V&A locates its premises on Onireke Road near Dugbe. This Ibadan club must be distinguished from Osogbo’s Mbari Mbayo.',
    historicalClaims: [
      {
        text: 'The Mbari Artists’ and Writers’ Club formed in Ibadan in 1961, bringing literary, visual and performing arts together. The V&A locates its premises on Onireke Road near Dugbe. This Ibadan club must be distinguished from Osogbo’s Mbari Mbayo.',
        sourceIds: ['S17'],
        evidenceStatus: 'Documented',
      },
    ],
    people: [
      {
        name: 'Wole Soyinka, J. P. Clark and Christopher Okigbo',
        role: 'Writers associated with Mbari’s artistic exchange',
        historicalOrComposite: 'Historical person',
      },
      {
        name: 'Es’kia Mphahlele, Uche Okeke and Demas Nwoko',
        role: 'Participants in the club’s wider literary and visual world',
        historicalOrComposite: 'Historical person',
      },
      {
        name: 'Ulli Beier',
        role: 'Associated with the club’s formation and exchange',
        historicalOrComposite: 'Historical person',
      },
      {
        name: 'Performer and audience',
        role: 'Clearly labelled composite staging, not portraits or a documented rehearsal',
        historicalOrComposite: 'Composite viewpoint',
      },
    ],
    viewpoints: [
      {
        id: 'rehearsal',
        label: 'Enter the rehearsal',
        title: 'An experiment needs a place to happen',
        text: 'A performer and listeners gather in an interpretive courtyard. Their movement is invented staging. The historical anchor is Mbari’s meeting of literary, visual and performing arts in Ibadan in 1961.',
        focus: 'people',
      },
      {
        id: 'table',
        label: 'Around the table',
        title: 'Ideas travel between people and media',
        text: 'The publishing and exhibition table stands for exchange between writers and artists. The displayed forms are original studies, not reproduced Mbari works or quotations attributed to its participants.',
        focus: 'place',
      },
      {
        id: 'audience',
        label: 'Join the audience',
        title: 'A club also makes a public',
        text: 'Move to the audience side of the courtyard. Artistic exchange depends on people who rehearse, publish, watch, discuss and make space for the next experiment. This shared viewing is a composite reconstruction.',
        focus: 'routes',
      },
    ],
    narration:
      'The Mbari Artists’ and Writers’ Club formed in Ibadan in 1961, bringing literary, visual and performing arts together. The V&A locates its premises on Onireke Road near Dugbe. This Ibadan club must be distinguished from Osogbo’s Mbari Mbayo. A rehearsal, a publishing table and an audience reveal different parts of a shared artistic space. The scene uses original abstract studies; it does not reproduce protected artworks or substantial literary passages.',
    sceneProposal: {
      spatialAction:
        'Change viewpoint to follow people, institutions and consequences in an interpretive space.',
      camera:
        'A restrained ground-level approach, then deliberate reframing around the selected viewpoint. No continuous orbit or random flight.',
      sound:
        'Original wind, quiet material textures and an optional spoken reading. No archival authenticity is claimed.',
    },
    assets: [
      {
        description: 'Particle mbari environment and anonymous human figures',
        period: '1961',
        reference: 'Supplied brief, sections 3–6; S17',
        verificationStatus:
          'Creative reconstruction. Schematic geometry; figures are composites, not historical portrait likenesses.',
      },
    ],
    uncertainties: [
      'The courtyard, figures and rehearsal are creative reconstructions. No exact building layout, likeness, conversation or performance is authenticated.',
    ],
    accessibilityNotes:
      'The same narrative, people, evidence and viewpoints remain available in the text edition, without WebGL, motion or audio.',
  },
  {
    id: 'crisis',
    act: 5,
    dateLabel: '1962–1966',
    sortYear: 1962,
    title: 'A public life under strain',
    question: 'How does political conflict enter a person’s daily route?',
    locations: [
      {
        name: 'Ibadan in the Western Region crisis',
        coordinates: null,
      },
    ],
    form: 'unrest',
    text: 'The Western Region political crisis profoundly affected Ibadan. The Awolowo–Akintola rupture and subsequent instability belong beside the same era’s institutional and cultural achievements. Households, traders and political organisers experienced insecurity from different positions.',
    historicalClaims: [
      {
        text: 'The Western Region political crisis profoundly affected Ibadan. The Awolowo–Akintola rupture and subsequent instability belong beside the same era’s institutional and cultural achievements. Households, traders and political organisers experienced insecurity from different positions.',
        sourceIds: ['S18', 'S19'],
        evidenceStatus: 'Documented',
      },
    ],
    people: [
      {
        name: 'Obafemi Awolowo and Samuel Ladoke Akintola',
        role: 'Figures in the regional political conflict',
        historicalOrComposite: 'Historical person',
      },
      {
        name: 'Households, traders and organisers',
        role: 'People with differing experiences of instability',
        historicalOrComposite: 'Historical group',
      },
    ],
    viewpoints: [
      {
        id: 'place',
        label: 'Read the place',
        title: 'How does political conflict enter a person’s daily route?',
        text: 'The Western Region political crisis profoundly affected Ibadan. The Awolowo–Akintola rupture and subsequent instability belong beside the same era’s institutional and cultural achievements. Households, traders and political organisers experienced insecurity from different positions.',
        focus: 'place',
      },
      {
        id: 'people',
        label: 'Meet the people',
        title: 'Who makes this history?',
        text: 'Obafemi Awolowo and Samuel Ladoke Akintola: Figures in the regional political conflict. Households, traders and organisers: People with differing experiences of instability.',
        focus: 'people',
      },
      {
        id: 'connections',
        label: 'Follow the consequences',
        title: 'What changes for the people here?',
        text: 'An interrupted route and a closed threshold suggest civilian uncertainty. They do not reconstruct a particular documented street incident or turn competing political accounts into one unquestioned version.',
        focus: 'routes',
      },
    ],
    narration:
      'The Western Region political crisis profoundly affected Ibadan. The Awolowo–Akintola rupture and subsequent instability belong beside the same era’s institutional and cultural achievements. Households, traders and political organisers experienced insecurity from different positions. An interrupted route and a closed threshold suggest civilian uncertainty. They do not reconstruct a particular documented street incident or turn competing political accounts into one unquestioned version.',
    sceneProposal: {
      spatialAction:
        'Change viewpoint to follow people, institutions and consequences in an interpretive space.',
      camera:
        'A restrained ground-level approach, then deliberate reframing around the selected viewpoint. No continuous orbit or random flight.',
      sound:
        'Original wind, quiet material textures and an optional spoken reading. No archival authenticity is claimed.',
    },
    assets: [
      {
        description: 'Particle unrest environment and anonymous human figures',
        period: '1962–1966',
        reference: 'Supplied brief, sections 3–6; S18, S19',
        verificationStatus:
          'Creative reconstruction. Schematic geometry; figures are composites, not historical portrait likenesses.',
      },
    ],
    uncertainties: [
      'Fine chronology, specific incidents and partisan claims require deeper verification. No invented attack, casualty figure or witness statement is staged.',
    ],
    accessibilityNotes:
      'The same narrative, people, evidence and viewpoints remain available in the text edition, without WebGL, motion or audio.',
  },
  {
    id: 'cocoa',
    act: 5,
    dateLabel: '1964–1965',
    sortYear: 1964,
    title: 'From the land to the skyline',
    question: 'Whose labour is visible in a landmark?',
    locations: [
      {
        name: 'Cocoa House, Ibadan',
        coordinates: null,
      },
    ],
    form: 'tower',
    text: 'Cocoa House’s owner distinguishes completion in 1964 from commissioning in 1965. The building expressed the Western Region’s investment ambitions and its agricultural economic base. Agricultural producers, construction workers and regional officials belong within the same frame.',
    historicalClaims: [
      {
        text: 'Cocoa House’s owner distinguishes completion in 1964 from commissioning in 1965. The building expressed the Western Region’s investment ambitions and its agricultural economic base. Agricultural producers, construction workers and regional officials belong within the same frame.',
        sourceIds: ['S16'],
        evidenceStatus: 'Documented',
      },
    ],
    people: [
      {
        name: 'Agricultural producers and construction workers',
        role: 'People sustaining the economy and building the landmark',
        historicalOrComposite: 'Historical group',
      },
      {
        name: 'Samuel Ladoke Akintola',
        role: 'Associated with the commissioning in 1965',
        historicalOrComposite: 'Historical person',
      },
    ],
    viewpoints: [
      {
        id: 'place',
        label: 'Read the place',
        title: 'Whose labour is visible in a landmark?',
        text: 'Cocoa House’s owner distinguishes completion in 1964 from commissioning in 1965. The building expressed the Western Region’s investment ambitions and its agricultural economic base. Agricultural producers, construction workers and regional officials belong within the same frame.',
        focus: 'place',
      },
      {
        id: 'people',
        label: 'Meet the people',
        title: 'Who makes this history?',
        text: 'Agricultural producers and construction workers: People sustaining the economy and building the landmark. Samuel Ladoke Akintola: Associated with the commissioning in 1965.',
        focus: 'people',
      },
      {
        id: 'connections',
        label: 'Follow the consequences',
        title: 'What changes for the people here?',
        text: 'Follow the relationship between agricultural work, commerce and urban investment, then look upward. A landmark can remember a political ambition while also obscuring the labour that made it possible.',
        focus: 'routes',
      },
    ],
    narration:
      'Cocoa House’s owner distinguishes completion in 1964 from commissioning in 1965. The building expressed the Western Region’s investment ambitions and its agricultural economic base. Agricultural producers, construction workers and regional officials belong within the same frame. Follow the relationship between agricultural work, commerce and urban investment, then look upward. A landmark can remember a political ambition while also obscuring the labour that made it possible.',
    sceneProposal: {
      spatialAction:
        'Change viewpoint to follow people, institutions and consequences in an interpretive space.',
      camera:
        'A restrained ground-level approach, then deliberate reframing around the selected viewpoint. No continuous orbit or random flight.',
      sound:
        'Original wind, quiet material textures and an optional spoken reading. No archival authenticity is claimed.',
    },
    assets: [
      {
        description: 'Particle tower environment and anonymous human figures',
        period: '1964–1965',
        reference: 'Supplied brief, sections 3–6; S16',
        verificationStatus:
          'Creative reconstruction. Schematic geometry; figures are composites, not historical portrait likenesses.',
      },
    ],
    uncertainties: [
      'The tower is a schematic construction study. No literal one-bag-to-one-brick accounting, measured plan or unsupported “first in Africa” claim is made.',
    ],
    accessibilityNotes:
      'The same narrative, people, evidence and viewpoints remain available in the text edition, without WebGL, motion or audio.',
  },
  {
    id: 'state',
    act: 6,
    dateLabel: '1976 onward',
    sortYear: 1976,
    title: 'The everyday capital',
    question: 'Who keeps an expanding city working?',
    locations: [
      {
        name: 'Ibadan; modern Bodija in its own period',
        coordinates: null,
      },
    ],
    form: 'city',
    text: 'Oyo State was created in 1976 with Ibadan as its capital. Later urban change included new commercial spaces and changing livelihoods. Research on Bodija documents market leadership and class relations from the 1980s into the 1990s.',
    historicalClaims: [
      {
        text: 'Oyo State was created in 1976 with Ibadan as its capital. Later urban change included new commercial spaces and changing livelihoods. Research on Bodija documents market leadership and class relations from the 1980s into the 1990s.',
        sourceIds: ['S20', 'S21'],
        evidenceStatus: 'Documented',
      },
    ],
    people: [
      {
        name: 'Civil servants and transport workers',
        role: 'People inside the capital’s changing institutions and journeys',
        historicalOrComposite: 'Historical group',
      },
      {
        name: 'Bodija traders and market leaders',
        role: 'People whose authority and livelihoods changed within a modern market',
        historicalOrComposite: 'Historical group',
      },
    ],
    viewpoints: [
      {
        id: 'place',
        label: 'Read the place',
        title: 'Who keeps an expanding city working?',
        text: 'Oyo State was created in 1976 with Ibadan as its capital. Later urban change included new commercial spaces and changing livelihoods. Research on Bodija documents market leadership and class relations from the 1980s into the 1990s.',
        focus: 'place',
      },
      {
        id: 'people',
        label: 'Meet the people',
        title: 'Who makes this history?',
        text: 'Civil servants and transport workers: People inside the capital’s changing institutions and journeys. Bodija traders and market leaders: People whose authority and livelihoods changed within a modern market.',
        focus: 'people',
      },
      {
        id: 'connections',
        label: 'Follow the consequences',
        title: 'What changes for the people here?',
        text: 'The city continues through work as well as administrative dates. Modern Bodija belongs in its own era, not inside the nineteenth-century settlement.',
        focus: 'routes',
      },
    ],
    narration:
      'Oyo State was created in 1976 with Ibadan as its capital. Later urban change included new commercial spaces and changing livelihoods. Research on Bodija documents market leadership and class relations from the 1980s into the 1990s. The city continues through work as well as administrative dates. Modern Bodija belongs in its own era, not inside the nineteenth-century settlement.',
    sceneProposal: {
      spatialAction:
        'Change viewpoint to follow people, institutions and consequences in an interpretive space.',
      camera:
        'A restrained ground-level approach, then deliberate reframing around the selected viewpoint. No continuous orbit or random flight.',
      sound:
        'Original wind, quiet material textures and an optional spoken reading. No archival authenticity is claimed.',
    },
    assets: [
      {
        description: 'Particle city environment and anonymous human figures',
        period: '1976 onward',
        reference: 'Supplied brief, sections 3–6; S20, S21',
        verificationStatus:
          'Creative reconstruction. Schematic geometry; figures are composites, not historical portrait likenesses.',
      },
    ],
    uncertainties: [
      'The urban journey and market figures are composites. No surveyed route, official population model or exact historic market layout is supplied.',
    ],
    accessibilityNotes:
      'The same narrative, people, evidence and viewpoints remain available in the text edition, without WebGL, motion or audio.',
  },
  {
    id: 'water',
    act: 6,
    dateLabel: '26 August 2011 → an open present',
    sortYear: 2011,
    title: 'The city is still being made',
    question: 'Whose priorities shape the city’s next chapter?',
    locations: [
      {
        name: 'Ibadan’s waterways and lived neighbourhoods',
        coordinates: null,
      },
    ],
    form: 'water',
    text: 'Severe flooding on 26 August 2011 exposed the city’s vulnerability. Subsequent planning focused on drainage, infrastructure and flood-risk management. Affected residents, rescuers, engineers and traders belong at the centre of the account.',
    historicalClaims: [
      {
        text: 'Severe flooding on 26 August 2011 exposed the city’s vulnerability. Subsequent planning focused on drainage, infrastructure and flood-risk management. Affected residents, rescuers, engineers and traders belong at the centre of the account.',
        sourceIds: ['S22'],
        evidenceStatus: 'Documented',
      },
    ],
    people: [
      {
        name: 'Affected residents and rescuers',
        role: 'People confronting the flood and its consequences',
        historicalOrComposite: 'Historical group',
      },
      {
        name: 'Engineers and traders',
        role: 'People involved in infrastructure and everyday recovery',
        historicalOrComposite: 'Historical group',
      },
    ],
    viewpoints: [
      {
        id: 'place',
        label: 'Read the place',
        title: 'Whose priorities shape the city’s next chapter?',
        text: 'Severe flooding on 26 August 2011 exposed the city’s vulnerability. Subsequent planning focused on drainage, infrastructure and flood-risk management. Affected residents, rescuers, engineers and traders belong at the centre of the account.',
        focus: 'place',
      },
      {
        id: 'people',
        label: 'Meet the people',
        title: 'Who makes this history?',
        text: 'Affected residents and rescuers: People confronting the flood and its consequences. Engineers and traders: People involved in infrastructure and everyday recovery.',
        focus: 'people',
      },
      {
        id: 'connections',
        label: 'Follow the consequences',
        title: 'What changes for the people here?',
        text: 'The water layer reconnects the ending to the landscape at the beginning. It is a demonstration of relationships, not a calibrated flood simulation. The future remains open to the priorities and memories of the people who live here.',
        focus: 'routes',
      },
    ],
    narration:
      'Severe flooding on 26 August 2011 exposed the city’s vulnerability. Subsequent planning focused on drainage, infrastructure and flood-risk management. Affected residents, rescuers, engineers and traders belong at the centre of the account. The water layer reconnects the ending to the landscape at the beginning. It is a demonstration of relationships, not a calibrated flood simulation. The future remains open to the priorities and memories of the people who live here.',
    sceneProposal: {
      spatialAction:
        'Change viewpoint to follow people, institutions and consequences in an interpretive space.',
      camera:
        'A restrained ground-level approach, then deliberate reframing around the selected viewpoint. No continuous orbit or random flight.',
      sound:
        'Original wind, quiet material textures and an optional spoken reading. No archival authenticity is claimed.',
    },
    assets: [
      {
        description: 'Particle water environment and anonymous human figures',
        period: '26 August 2011 → an open present',
        reference: 'Supplied brief, sections 3–6; S22',
        verificationStatus:
          'Creative reconstruction. Schematic geometry; figures are composites, not historical portrait likenesses.',
      },
    ],
    uncertainties: [
      'No casualty total, invented eyewitness testimony, calibrated flood prediction or claim to document every event through 2026 is made.',
    ],
    accessibilityNotes:
      'The same narrative, people, evidence and viewpoints remain available in the text edition, without WebGL, motion or audio.',
  },
]
