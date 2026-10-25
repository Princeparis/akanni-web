export type IbadanSculpture =
  | 'drum'
  | 'vessel'
  | 'commander'
  | 'sword'
  | 'book'
  | 'iyalode'
  | 'document'
  | 'locomotive'
  | 'mapo'
  | 'television'
  | 'writer'
  | 'cocoa'
  | 'city'
  | 'water'

export const ibadanGallery: Record<
  string,
  {
    sculpture: IbadanSculpture
    subject: string
    medium: string
    note: string
    year: string
  }
> = {
  origins: {
    sculpture: 'drum',
    subject: 'The sound of memory',
    medium: 'Talking drum · particle model',
    note: 'A heritage object used here as a metaphor for oral memory; not an excavated or dated artefact.',
    year: 'Origins',
  },
  arrival: {
    sculpture: 'vessel',
    subject: 'What we carry',
    medium: 'Vessel & cloth · particle model',
    note: 'An imagined carried vessel. No claim is made that it belonged to a documented household.',
    year: '1829',
  },
  command: {
    sculpture: 'commander',
    subject: 'Oluyole',
    medium: 'Particle portrait · interpretive study',
    note: 'An artist’s interpretation of a historical subject. The face and clothing are not authenticated likenesses or costume evidence.',
    year: '1830s',
  },
  osogbo: {
    sculpture: 'sword',
    subject: 'Beyond the city',
    medium: 'Iron & bronze · particle model',
    note: 'An illustrative blade, not a recovered weapon belonging to Oderinlo. The battle took place at Osogbo.',
    year: '1840',
  },
  learning: {
    sculpture: 'book',
    subject: 'Knowledge, carried forward',
    medium: 'Book & writing surface · particle model',
    note: 'Illustrative learning objects, not a named mission’s surviving possessions.',
    year: '1851',
  },
  ijaiye: {
    sculpture: 'sword',
    subject: 'The cost of authority',
    medium: 'Iron & bronze · particle model',
    note: 'An editorial war object, not a verified weapon from the Ijaiye conflict.',
    year: '1860',
  },
  efunsetan: {
    sculpture: 'iyalode',
    subject: 'Efunsetan Aniwura',
    medium: 'Particle portrait · interpretive study',
    note: 'An artist’s interpretation, not an authenticated likeness. Her history is grounded in scholarship, not a film character.',
    year: '1874',
  },
  kiriji: {
    sculpture: 'drum',
    subject: 'A region in conflict',
    medium: 'Talking drum · particle model',
    note: 'A heritage-object study used as editorial staging. It does not establish a particular drum’s role in the war.',
    year: '1877',
  },
  agreement: {
    sculpture: 'document',
    subject: 'The terms of power',
    medium: 'Paper & seal · particle model',
    note: 'A sculptural document, not a facsimile of the 1893 agreement. No signatures or quotations are fabricated.',
    year: '1893',
  },
  rail: {
    sculpture: 'locomotive',
    subject: 'The city connects',
    medium: 'Steam locomotive · particle model',
    note: 'A detailed generic steam-engine model, not a verified identification of an engine on the Lagos–Ibadan line.',
    year: '1901',
  },
  mapo: {
    sculpture: 'mapo',
    subject: 'Mapo Hall',
    medium: 'Architectural model · particle model',
    note: 'An interpretation of the civic hall’s classical façade, not a measured architectural reconstruction.',
    year: '1929',
  },
  university: {
    sculpture: 'book',
    subject: 'A university city',
    medium: 'Open book · particle model',
    note: 'A sculptural learning object. It is not a reproduction of a copyrighted publication or the 1948 campus.',
    year: '1948',
  },
  wntv: {
    sculpture: 'television',
    subject: 'The city goes on air',
    medium: 'Television receiver · particle model',
    note: 'An illustrative mid-century receiver. It is not claimed to be a documented WNTV equipment model.',
    year: '1959',
  },
  mbari: {
    sculpture: 'writer',
    subject: 'A generation finding its voice',
    medium: 'Composite artist · particle study',
    note: 'An imagined participant in an artistic gathering, not an authenticated portrait of Soyinka or another named Mbari member.',
    year: '1961',
  },
  crisis: {
    sculpture: 'document',
    subject: 'An interrupted public life',
    medium: 'Paper & seal · particle model',
    note: 'An editorial object. It is not a fabricated newspaper, manifesto or account of a specific incident.',
    year: '1962',
  },
  cocoa: {
    sculpture: 'cocoa',
    subject: 'Cocoa House',
    medium: 'Architecture & cocoa pod · particle model',
    note: 'A model inspired by the tower’s ribbed form, paired with an illustrative cocoa pod. It is not a measured survey or financial accounting.',
    year: '1965',
  },
  state: {
    sculpture: 'city',
    subject: 'A city still becoming',
    medium: 'Civic skyline · particle model',
    note: 'A modern editorial grouping, not a surveyed city plan. Later landmarks are not projected into early chapters.',
    year: '1976',
  },
  water: {
    sculpture: 'water',
    subject: 'Living with water',
    medium: 'Landscape & water · particle model',
    note: 'An illustrative landscape sculpture, not a calibrated flood map or reconstruction of the 2011 disaster.',
    year: '2011',
  },
}
