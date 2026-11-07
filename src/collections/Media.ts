import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: { read: () => true },
  admin: { group: 'Files' },
  fields: [{ name: 'alt', localized: true, type: 'text', required: true, label: 'Alt text (describe the image)' }],
  upload: { mimeTypes: ['image/*'] },
}
