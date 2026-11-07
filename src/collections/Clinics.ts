import type { CollectionConfig } from 'payload'
import { orderField, visibleField } from './order'

export const Clinics: CollectionConfig = {
  slug: 'clinics',
  labels: { singular: 'Clinic branch', plural: 'Clinic branches' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'hours', 'order'], group: 'Content' },
  access: { read: () => true },
  defaultSort: 'order',
  fields: [
    { name: 'name', type: 'text', required: true, admin: { description: 'Area name, e.g. "Smouha".' } },
    {
      name: 'mapArea',
      type: 'select',
      options: [
        { label: 'Smouha', value: 'smouha' },
        { label: 'Gianaclis', value: 'gianaclis' },
      ],
      admin: { description: 'Which raised area on the map belongs to this branch.' },
    },
    {
      name: 'color',
      type: 'select',
      defaultValue: 'orange',
      options: [
        { label: 'Orange', value: 'orange' },
        { label: 'Cyan', value: 'cyan' },
      ],
    },
    { name: 'address', type: 'textarea', required: true },
    {
      name: 'phones',
      type: 'array',
      fields: [{ name: 'number', type: 'text', required: true }],
    },
    { name: 'hours', type: 'text', defaultValue: 'Open 12 pm – 8 pm' },
    { name: 'mapsUrl', type: 'text', admin: { description: 'Google Maps link for "Get directions".' } },
    orderField,
    visibleField,
  ],
}
