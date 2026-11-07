import type { CollectionConfig } from 'payload'
import { orderField, visibleField } from './order'

export const Certificates: CollectionConfig = {
  slug: 'certificates',
  labels: { singular: 'Certificate', plural: 'Education & certificates' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'type', 'issuer', 'order'], group: 'Content' },
  access: { read: () => true },
  defaultSort: 'order',
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'course',
      options: [
        { label: 'Degree', value: 'degree' },
        { label: 'Diploma', value: 'diploma' },
        { label: 'Course / workshop', value: 'course' },
      ],
    },
    { name: 'issuer', type: 'text', admin: { description: 'Who gave it, e.g. "Free2move" or "Faculty of Physical Therapy".' } },
    { name: 'years', type: 'text', admin: { description: 'e.g. "2017 to 2019" or "2024 to now".' } },
    { name: 'note', type: 'text', admin: { description: 'Small line above the title, e.g. "Levels one and two, UK certified".' } },
    { name: 'description', type: 'textarea', admin: { description: 'What it covers. Shown in the body-map card.' } },
    { name: 'inProgress', type: 'checkbox', defaultValue: false },
    orderField,
    visibleField,
  ],
}
