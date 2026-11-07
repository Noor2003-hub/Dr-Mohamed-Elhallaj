import type { CollectionConfig } from 'payload'
import { orderField, visibleField } from './order'

export const Reels: CollectionConfig = {
  slug: 'reels',
  labels: { singular: 'Reel', plural: 'Instagram reels' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'tag', 'views', 'order'], group: 'Content' },
  access: { read: () => true },
  defaultSort: 'order',
  fields: [
    { name: 'url', type: 'text', required: true, admin: { description: 'Paste the Instagram reel link.' } },
    { name: 'title', type: 'text', required: true },
    {
      name: 'direction',
      type: 'select',
      defaultValue: 'ltr',
      options: [
        { label: 'English (left to right)', value: 'ltr' },
        { label: 'Arabic (right to left)', value: 'rtl' },
      ],
    },
    { name: 'views', type: 'text', admin: { description: 'e.g. "129M" or "739K".' } },
    { name: 'tag', type: 'text', admin: { description: 'Filter chip, e.g. "Knee", "Ankle", "Posture".' } },
    { name: 'cover', type: 'upload', relationTo: 'media' },
    orderField,
    visibleField,
  ],
}
