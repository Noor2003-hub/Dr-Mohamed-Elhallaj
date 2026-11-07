import type { CollectionConfig } from 'payload'
import { orderField, visibleField } from './order'

export const Experiences: CollectionConfig = {
  slug: 'experiences',
  labels: { singular: 'Workplace', plural: 'Experience (track stations)' },
  admin: { useAsTitle: 'place', defaultColumns: ['place', 'years', 'role', 'order'], group: 'Content' },
  access: { read: () => true },
  defaultSort: 'order',
  fields: [
    { name: 'place', localized: true, type: 'text', required: true },
    { name: 'role', localized: true, type: 'text', required: true },
    { name: 'years', localized: true, type: 'text', required: true, admin: { description: 'e.g. "2013 to 2014" or "2011 to now".' } },
    { name: 'current', type: 'checkbox', defaultValue: false, admin: { description: 'Highlights the station in orange.' } },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    orderField,
    visibleField,
  ],
}
