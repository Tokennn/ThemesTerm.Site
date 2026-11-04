// Pages pas encore construites : chacune a sa propre 404 (dossier farm/, gear/, chapters/, crew/).
export const PAGES = {
  farm: {
    label: 'Farm',
    title: "The farm isn't planted yet",
    text: 'Seeds are in the ground. Come back when they sprout.',
  },
  gear: {
    label: 'Gear',
    title: 'No gear on this shelf yet',
    text: 'The toolbox is still being packed. Check back soon.',
  },
  chapters: {
    label: 'Chapters',
    title: "This chapter hasn't been written",
    text: 'The pen is still moving. New chapters are on their way.',
  },
  crew: {
    label: 'Our Crew',
    title: 'The crew is on a coffee break',
    text: "They'll be back in a moment, probably with snacks.",
  },
};

export const ORDER = ['farm', 'gear', 'chapters', 'crew'];
