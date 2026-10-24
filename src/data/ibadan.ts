export type IbadanForm =
  | 'hills'
  | 'gathering'
  | 'drum'
  | 'hoe'
  | 'shuttle'
  | 'calabash'
  | 'book'
  | 'city'
  | 'wheel'
  | 'television'
  | 'tower'

// Written from general historical knowledge. Retrieval of the reference pages was
// blocked by this environment's HTTP proxy, so verification remains explicit.
export const ibadanReferences = [
  {
    id: 'overview',
    title: 'Encyclopaedia Britannica · Ibadan',
    url: 'https://www.britannica.com/place/Ibadan',
    scope: 'Founding, nineteenth-century power, British rule and the modern city.',
  },
  {
    id: 'university',
    title: 'University of Ibadan · Institutional history',
    url: 'https://www.ui.edu.ng/content/history',
    scope: 'University College Ibadan, 1948, and the autonomous university, 1962.',
  },
  {
    id: 'oyo',
    title: 'Oyo State Government · About Oyo State',
    url: 'https://oyostate.gov.ng/about-oyo-state/',
    scope: 'State creation in 1976 and Ibadan as the state capital.',
  },
  {
    id: 'kiriji',
    title: 'Kiriji War · Reference overview',
    url: 'https://en.wikipedia.org/wiki/Kiriji_War',
    scope: 'The Ekiti–Parapo alliance, the long war and peace negotiations.',
  },
  {
    id: 'television',
    title: 'Western Nigeria Television · Reference overview',
    url: 'https://en.wikipedia.org/wiki/Western_Nigeria_Television',
    scope: 'The beginning of WNTV broadcasting in Ibadan in 1959.',
  },
  {
    id: 'cocoa',
    title: 'Cocoa House · Reference overview',
    url: 'https://en.wikipedia.org/wiki/Cocoa_House',
    scope: 'The 1965 building and its connection with the regional cocoa economy.',
  },
  {
    id: 'rail',
    title: 'Nigerian Railway Corporation',
    url: 'https://nrc.gov.ng/',
    scope: 'The Lagos–Ibadan railway corridor, its early history and the modern service.',
  },
] as const

export const ibadanEdition = {
  title: 'Ibadan — A living memory',
  status: 'Historical study · source verification pending',
  notice:
    'This journey surveys major periods in Ibadan’s history, from oral traditions and the founding of the present city to contemporary life. It is a selective account, not an exhaustive history. Text was prepared from general historical knowledge. This build’s network blocked the reference pages, so they are supplied as reading and verification links, not as sources claimed to have been retrieved. Dates and interpretations remain subject to source review. Oral tradition is distinguished from the founding of the present city.',
}

export const ibadanChapters = [
  {
    id: 'land',
    label: 'Before the city',
    period: 'Origins · oral tradition',
    title: 'Before a name.\nA landscape.',
    text: 'Ibadan’s story reaches beyond the founding of the present city. Oral traditions remember earlier settlements and the figure of Lagelu. Those accounts belong alongside, rather than inside, a single certain founding date.',
    object: 'Hill country',
    form: 'hills' as IbadanForm,
    accent: '#d9b47c',
    references: ['overview'],
    note: 'The name Ibadan is commonly connected to “Eba Odan”, an expression associated with the edge of the savannah. Accounts of earlier settlement and Lagelu survive in oral and written traditions, whose dates and details vary.',
    detail:
      'The terrain is an original interpretation of hills and paths, not a geographic survey. This opening separates inherited origin stories from the 1829 emergence of the present city. Source verification is pending.',
  },
  {
    id: 'founding',
    label: 'A new beginning',
    period: '1829 · the present city',
    title: 'A place\nto gather.',
    text: 'The present city emerged in 1829 amid the wars that reshaped Yorubaland as the old Oyo Empire weakened. A military settlement became a place of refuge, ambition and new alliances.',
    object: 'Circles of gathering',
    form: 'gathering' as IbadanForm,
    accent: '#e2a573',
    references: ['overview'],
    note: 'The modern founding is generally dated to 1829. The settlement grew in the upheavals of nineteenth-century Yorubaland, drawing people from different places into a new political community.',
    detail:
      'The concentric particle forms suggest gathering and connection. They do not reconstruct a specific camp or claim to show the original layout. Earlier settlement traditions remain a separate part of the story.',
  },
  {
    id: 'osogbo',
    label: 'A regional power',
    period: '1840 · the Osogbo campaign',
    title: 'A voice that\ncarried further.',
    text: 'Ibadan’s forces played a decisive role in the defeat of an Ilorin-led army at Osogbo in 1840. The victory helped establish Ibadan as a major military power in the Yoruba interior.',
    object: 'Talking drum · a symbol of voice',
    form: 'drum' as IbadanForm,
    accent: '#e7bc87',
    references: ['overview'],
    note: 'The Osogbo campaign was a turning point in the balance of regional power. Ibadan’s influence expanded through military organisation, alliances and control over other communities, with consequences that were not experienced equally.',
    detail:
      'The stylised hourglass drum represents communication and public voice. It is not presented as an object from the battle, nor as an instrument exclusive to Ibadan. The soundscape is original synthesis, not a traditional performance.',
  },
  {
    id: 'kiriji',
    label: 'Power & resistance',
    period: '1877–1893 · the Kiriji era',
    title: 'A city in a\ncontested world.',
    text: 'Expansion brought resistance. The long conflict known as the Kiriji or Ekiti–Parapo War drew Ibadan into a struggle with an alliance of eastern Yoruba communities. Its aftermath helped reshape the region.',
    object: 'A working tool · lives beyond war',
    form: 'hoe' as IbadanForm,
    accent: '#c9b08b',
    references: ['kiriji', 'overview'],
    note: 'The conflict is commonly dated from 1877 to 1893. A peace agreement was reached in 1886, but the wider settlement of the conflict and withdrawal of forces took longer. Ibadan’s power was contested by the communities affected by its expansion.',
    detail:
      'The hoe turns attention from military leaders to the people who worked the land and sustained everyday life. It is a symbolic illustration, not an authenticated period artefact or a weapon from the war.',
  },
  {
    id: 'colonial',
    label: 'Colonial change',
    period: '1893 · British intervention',
    title: 'New lines.\nUnequal power.',
    text: 'In 1893, Ibadan came under British protection through an agreement with the colonial authorities. Political authority, trade and everyday life would be reorganised within an expanding colonial system.',
    object: 'Shuttle & crossing threads',
    form: 'shuttle' as IbadanForm,
    accent: '#bdafdb',
    references: ['overview'],
    note: 'British intervention followed decades of regional conflict. The language of “protection” belongs to the colonial agreement; it should not conceal the unequal power and growing control that accompanied colonial rule.',
    detail:
      'The crossing threads are an original metaphor for connections being redrawn. They are not a reproduction of a historical textile or evidence for a specific craft event in 1893.',
  },
  {
    id: 'railway',
    label: 'Connected by rail',
    period: '1901 · Lagos to Ibadan',
    title: 'Distance\nchanges shape.',
    text: 'The railway from Lagos reached Ibadan in 1901. New transport links connected the city more closely to the coast, moving people and goods while serving the priorities of the colonial economy.',
    object: 'A wheel in motion',
    form: 'wheel' as IbadanForm,
    accent: '#b4bbb7',
    references: ['overview', 'rail'],
    note: 'Rail changed the scale and rhythm of travel and exchange. Its economic effects should be read alongside colonial extraction and the lives of the people who built and used the network.',
    detail:
      'The spoked wheel is a generic railway-inspired form. It is not modelled on a particular locomotive, train or preserved historical component.',
  },
  {
    id: 'university',
    label: 'An open horizon',
    period: '1948 → 1962 · a university',
    title: 'A page opens.\nAn idea travels.',
    text: 'University College Ibadan opened in 1948 in a special relationship with the University of London. In 1962, it became the independent University of Ibadan, a major centre of learning and intellectual life.',
    object: 'An open book',
    form: 'book' as IbadanForm,
    accent: '#b7c9d4',
    references: ['university'],
    note: 'The institution’s beginnings as a university college and its later autonomy are distinct milestones. Its history includes teaching, research, literature, public debate and the experiences of generations of students and staff.',
    detail:
      'The book is a symbol of learning. It does not reproduce a particular text, imply a complete institutional history, or replace the university’s own records.',
  },
  {
    id: 'regional-capital',
    label: 'A regional capital',
    period: '1950s · the Western Region',
    title: 'A city at the\ncentre of change.',
    text: 'By the 1950s, Ibadan was the capital of Nigeria’s Western Region. Regional government, political organising, commerce and cultural production made the city a prominent setting for the approach to independence.',
    object: 'An open vessel · a meeting place',
    form: 'calabash' as IbadanForm,
    accent: '#dba37d',
    references: ['overview'],
    note: 'The city’s role in the Western Region placed it at the intersection of administrative decisions, mass politics and social change. This was not a single shared experience: class, gender, work and political allegiance shaped different lives.',
    detail:
      'The vessel is a symbolic gathering form. It is not attributed to a specific market, household, community or political institution.',
  },
  {
    id: 'television',
    label: 'A new signal',
    period: '1959 · WNTV begins',
    title: 'The city\non the air.',
    text: 'Western Nigeria Television began broadcasting from Ibadan in 1959. A new medium carried education, entertainment and public life into a different kind of shared space.',
    object: 'A television signal',
    form: 'television' as IbadanForm,
    accent: '#b5c3d7',
    references: ['television'],
    note: 'WNTV is an important milestone in Nigerian broadcasting. This account avoids a broad “first in Africa” claim, which requires careful definition of territory, experimental transmissions and regular services.',
    detail:
      'The particle television is an original period-inspired silhouette, not an authenticated WNTV receiver. No broadcast recording, footage or station branding is reproduced.',
  },
  {
    id: 'cocoa',
    label: 'An independent era',
    period: '1960–1965 · new horizons',
    title: 'An economy\nreaches upward.',
    text: 'Nigeria became independent in 1960. In Ibadan, Cocoa House opened in 1965, giving architectural form to the importance of cocoa and the ambitions of the Western Region’s economy.',
    object: 'A tower & its many floors',
    form: 'tower' as IbadanForm,
    accent: '#d7bd8c',
    references: ['cocoa', 'overview'],
    note: 'Cocoa House remains a recognisable landmark of the city. The tower connects a visible urban achievement to a wider agricultural economy and to the work that supported it.',
    detail:
      'This is a simplified tower with repeated floor lines, not a measured architectural reconstruction. Height rankings, funding details and architectural dimensions are deliberately omitted pending primary-source verification.',
  },
  {
    id: 'oyo',
    label: 'A state capital',
    period: '1976 · Oyo State',
    title: 'A new chapter.\nA familiar centre.',
    text: 'Oyo State was created in 1976, with Ibadan as its capital. The city continued to expand as an administrative, commercial, educational and cultural centre in southwestern Nigeria.',
    object: 'An imagined roofscape',
    form: 'city' as IbadanForm,
    accent: '#d1a183',
    references: ['oyo', 'overview'],
    note: 'The state structure changed again when Osun State was created from part of Oyo in 1991. These administrative boundaries are part of the city’s modern setting, rather than a replacement for its older regional connections.',
    detail:
      'The roofscape is an artistic interpretation. It is neither a map of the city nor an official state boundary, population model or reconstruction of a named neighbourhood.',
  },
  {
    id: 'new-rail',
    label: 'Routes renewed',
    period: '2021 · a new railway link',
    title: 'Old connections.\nNew journeys.',
    text: 'The Lagos–Ibadan standard-gauge railway was commissioned in 2021. More than a century after the earlier railway arrived, the corridor again became a focus of changing movement between city and coast.',
    object: 'The returning wheel',
    form: 'wheel' as IbadanForm,
    accent: '#b6c9c5',
    references: ['rail'],
    note: 'The modern standard-gauge service and the early colonial railway are distinct systems. Their connection here is the corridor and the changing experience of travel, not a claim that the same infrastructure simply continued unchanged.',
    detail:
      'The recurring wheel deliberately carries an earlier particle form into a different chapter. It links past and present visually without claiming that a specific component survived between the two systems.',
  },
  {
    id: 'living-city',
    label: 'The living city',
    period: 'Today · an unfinished story',
    title: 'The city\nwe carry.',
    text: 'Ibadan is still being made: in its neighbourhoods, markets, institutions, creative work and everyday journeys. Its chieftaincy traditions and contemporary civic life remain part of a story with no final page.',
    object: 'A city of many lives',
    form: 'city' as IbadanForm,
    accent: '#dfad87',
    references: ['overview', 'oyo'],
    note: 'No present-day population figure, current ruler or unverified recent event is asserted here. Those details change and require fresh sources. The ending leaves room for lived accounts and a broader range of voices.',
    detail:
      'Return to the beginning, or open the chapter index to make a different route. The scene is an imagined roofscape, and the historical account remains selective and awaiting source verification.',
  },
] as const
