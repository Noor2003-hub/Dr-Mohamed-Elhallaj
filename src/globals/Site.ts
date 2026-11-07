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
            { name: 'name', type: 'text', required: true, defaultValue: 'Dr. Mohamed Elhallaj' },
            { name: 'fullName', type: 'text', defaultValue: 'Dr. Mohamed Abdellatif Elhallaj' },
            { name: 'heroLines', type: 'textarea', admin: { description: 'One line per row.' } },
            { name: 'title', type: 'text', admin: { description: 'Short title under the name in the footer.' } },
            { name: 'logoOnDark', type: 'upload', relationTo: 'media' },
            { name: 'logoOnLight', type: 'upload', relationTo: 'media' },
          ],
        },
        {
          label: 'About',
          fields: [
            { name: 'aboutHeading', type: 'text', defaultValue: 'Who is Dr. Elhallaj?' },
            {
              name: 'storyLines',
              type: 'array',
              admin: { description: 'The lines that come into focus one by one while scrolling.' },
              fields: [{ name: 'text', type: 'text', required: true }],
            },
            { name: 'years', type: 'number', defaultValue: 18 },
            { name: 'yearsLabel', type: 'text', defaultValue: 'Years of experience' },
            { name: 'aboutText', type: 'textarea' },
          ],
        },
        {
          label: 'Experts Physio House',
          fields: [
            { name: 'clinicName', type: 'text', defaultValue: 'Experts Physio House' },
            { name: 'clinicNameArabic', type: 'text' },
            { name: 'clinicRole', type: 'text', defaultValue: 'Co-founder' },
            { name: 'clinicLogo', type: 'upload', relationTo: 'media' },
            { name: 'clinicInstagram', type: 'text' },
          ],
        },
        {
          label: 'Contact & social',
          fields: [
            { name: 'contactHeading', type: 'text', defaultValue: 'Ready for your first session?' },
            { name: 'contactText', type: 'textarea' },
            { name: 'contactImage', type: 'upload', relationTo: 'media' },
            { name: 'whatsapp', type: 'text', admin: { description: 'International format, e.g. +965 5028 2082' } },
            { name: 'email', type: 'email' },
            { name: 'location', type: 'text' },
            { name: 'instagram', type: 'text' },
            { name: 'instagramFollowers', type: 'text', admin: { description: 'e.g. "370K followers".' } },
            { name: 'youtube', type: 'text' },
          ],
        },
        {
          label: 'Section texts',
          fields: [
            { name: 'mapHeading', type: 'text', defaultValue: 'Where does it hurt?' },
            { name: 'mapIntro', type: 'text', defaultValue: 'Choose an area. Kinesio tape goes on, and you see the training behind its treatment.' },
            { name: 'toolsHeading', type: 'text', defaultValue: 'What he treats with.' },
            { name: 'reelsHeading', type: 'text', defaultValue: 'Learn from his reels' },
            { name: 'reelsIntro', type: 'text' },
            { name: 'trackHeading', type: 'text', defaultValue: 'Step by step, back to the pitch' },
            { name: 'trackIntro', type: 'textarea' },
            { name: 'educationHeading', type: 'text', defaultValue: 'Education and training' },
            { name: 'degreesNote', type: 'text', defaultValue: 'Degrees, Cairo University' },
          ],
        },
      ],
    },
  ],
}
