import type { CollectionConfig } from 'payload'
import { orderField } from './order'

export const BodyAreas: CollectionConfig = {
  slug: 'body-areas',
  labels: { singular: 'Body area', plural: 'Body map areas' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'key', 'view', 'order'], group: 'Content' },
  access: { read: () => true },
  defaultSort: 'order',
  fields: [
    { name: 'name', type: 'text', required: true, admin: { description: 'Shown on the button and the card.' } },
    {
      name: 'key',
      type: 'select',
      required: true,
      unique: true,
      admin: { description: 'Which tape drawing to use on the body.' },
      options: [
        { label: 'Neck', value: 'neck' },
        { label: 'Shoulder', value: 'shoulder' },
        { label: 'Back and spine', value: 'back' },
        { label: 'SI joint and pelvis', value: 'si' },
        { label: 'Knee', value: 'knee' },
        { label: 'Ankle and foot', value: 'ankle' },
        { label: 'Children (whole body)', value: 'kids' },
      ],
    },
    {
      name: 'view',
      type: 'select',
      defaultValue: 'back',
      options: [
        { label: 'Front of body', value: 'front' },
        { label: 'Back of body', value: 'back' },
      ],
    },
    {
      name: 'certificates',
      type: 'relationship',
      relationTo: 'certificates',
      hasMany: true,
      admin: { description: 'Training shown when this area is chosen.' },
    },
    orderField,
  ],
}
