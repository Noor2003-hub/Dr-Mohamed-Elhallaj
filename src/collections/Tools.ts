import type { CollectionConfig } from 'payload'
import { orderField, visibleField } from './order'

export const Tools: CollectionConfig = {
  slug: 'tools',
  labels: { singular: 'Tool', plural: 'Tools in the clinic' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'tag', 'order'], group: 'Content' },
  access: { read: () => true },
  defaultSort: 'order',
  fields: [
    { name: 'title', localized: true, type: 'text', required: true },
    { name: 'shortName', localized: true, type: 'text', admin: { description: 'Short name for the list on the left, e.g. "Dry needling".' } },
    { name: 'tag', localized: true, type: 'text', admin: { description: 'One or two words shown top right, e.g. "Recovery".' } },
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    { name: 'description', localized: true, type: 'textarea', required: true },
    orderField,
    visibleField,
  ],
}
