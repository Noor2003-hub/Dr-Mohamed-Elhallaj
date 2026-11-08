import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: { read: () => true },
  admin: { group: 'Files' },
  fields: [
    { name: 'alt', localized: true, type: 'text', required: true, label: 'Alt text (describe the image)' },
    // Keep the storage schema consistent when Blob is disabled in local development.
    { name: '_objectKey', type: 'text', admin: { hidden: true, readOnly: true } },
  ],
  upload: { mimeTypes: ['image/*'] },
}
