import type { GlobalConfig } from 'payload'

export const Site: GlobalConfig = {
  slug: 'site',
  label: 'Site settings',
  access: { read: () => true },
  admin: { group: 'Settings' },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Doctor & hero',
          fields: [
            { name: 'name', localized: true, type: 'text', required: true, defaultValue: 'Dr. Mohamed Elhallaj' },
            { name: 'fullName', localized: true, type: 'text', defaultValue: 'Dr. Mohamed Abdellatif Elhallaj' },
            { name: 'heroLines', localized: true, type: 'textarea', admin: { description: 'One line per row.' } },
            { name: 'title', localized: true, type: 'text', admin: { description: 'Short title under the name in the footer.' } },
            { name: 'logoOnDark', type: 'upload', relationTo: 'media' },
            { name: 'logoOnLight', type: 'upload', relationTo: 'media' },
          ],
        },
        {
          label: 'About',
          fields: [
            { name: 'aboutHeading', localized: true, type: 'text', defaultValue: 'Who is Dr. Elhallaj?' },
            {
              name: 'storyLines',
              localized: true,
              type: 'array',
              admin: { description: 'The lines that come into focus one by one while scrolling.' },
              fields: [{ name: 'text', type: 'text', required: true }],
            },
            { name: 'years', type: 'number', defaultValue: 18 },
            { name: 'yearsLabel', localized: true, type: 'text', defaultValue: 'Years of experience' },
            { name: 'aboutText', localized: true, type: 'textarea' },
          ],
        },
        {
          label: 'Experts Physio House',
          fields: [
            { name: 'clinicName', localized: true, type: 'text', defaultValue: 'Experts Physio House' },
            { name: 'clinicNameArabic', type: 'text' },
            { name: 'clinicRole', localized: true, type: 'text', defaultValue: 'Co-founder' },
            { name: 'clinicLogo', type: 'upload', relationTo: 'media' },
            { name: 'clinicInstagram', type: 'text' },
          ],
        },
        {
          label: 'Contact & social',
          fields: [
            { name: 'contactHeading', localized: true, type: 'text', defaultValue: 'Ready for your first session?' },
            { name: 'contactText', localized: true, type: 'textarea' },
            { name: 'contactImage', type: 'upload', relationTo: 'media' },
            { name: 'whatsapp', type: 'text', admin: { description: 'International format, e.g. +965 5028 2082' } },
            { name: 'email', type: 'email' },
            { name: 'location', localized: true, type: 'text' },
            { name: 'instagram', type: 'text' },
            { name: 'instagramFollowers', localized: true, type: 'text', admin: { description: 'e.g. "370K followers".' } },
            { name: 'youtube', type: 'text' },
          ],
        },
        {
          label: 'Section texts',
          fields: [
            { name: 'mapHeading', localized: true, type: 'text', defaultValue: 'Where does it hurt?' },
            { name: 'mapIntro', localized: true, type: 'text', defaultValue: 'Choose an area to highlight it and explore the training behind its treatment.' },
            { name: 'toolsHeading', localized: true, type: 'text', defaultValue: 'What he treats with.' },
            { name: 'reelsHeading', localized: true, type: 'text', defaultValue: 'Learn from his reels' },
            { name: 'reelsIntro', localized: true, type: 'text' },
            { name: 'trackHeading', localized: true, type: 'text', defaultValue: 'Step by step, back to the pitch' },
            { name: 'trackIntro', localized: true, type: 'textarea' },
            { name: 'educationHeading', localized: true, type: 'text', defaultValue: 'Education and training' },
            { name: 'degreesNote', localized: true, type: 'text', defaultValue: 'Degrees, Cairo University' },
          ],
        },
      ],
    },
  ],
}
