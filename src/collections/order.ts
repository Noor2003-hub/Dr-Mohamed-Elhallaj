import type { Field } from 'payload'

/** Shared "order" field: lower numbers come first on the site. */
export const orderField: Field = {
  name: 'order',
  type: 'number',
  defaultValue: 0,
  admin: { position: 'sidebar', description: 'Lower numbers show first.' },
}

/** Shared "show on site" switch. */
export const visibleField: Field = {
  name: 'visible',
  type: 'checkbox',
  defaultValue: true,
  admin: { position: 'sidebar' },
}
