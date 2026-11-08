import type { CollectionConfig } from 'payload'
import { orderField, visibleField } from './order'

export const ContactItems: CollectionConfig = {
  slug: 'contact-items',
  labels: { singular: 'Contact item', plural: 'Contact items' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'country', 'kind', 'url', 'visible'], group: 'Content' },
  access: { read: () => true },
  defaultSort: 'order',
  fields: [
    { name: 'title', type: 'text', localized: true, required: true, label: 'Title / العنوان' },
    { name: 'detail', type: 'text', localized: true, label: 'Details / التفاصيل' },
    { name: 'url', type: 'text', label: 'Link / الرابط', validate: (value: string | null | undefined) => !value || /^(https?:\/\/|mailto:|tel:)/i.test(value) || 'Use an https://, mailto:, or tel: link.', admin: { description: 'Use a full link, e.g. https://wa.me/201234567890. Empty links stay hidden, except location text.' } },
    { name: 'country', type: 'select', required: true, defaultValue: 'general', options: [
      { label: 'Kuwait / الكويت', value: 'kuwait' },
      { label: 'Egypt / مصر', value: 'egypt' },
      { label: 'Social & general / التواصل العام', value: 'general' },
    ] },
    { name: 'kind', type: 'select', required: true, defaultValue: 'link', options: [
      { label: 'WhatsApp', value: 'whatsapp' }, { label: 'Location / الموقع', value: 'location' },
      { label: 'Email', value: 'email' }, { label: 'Instagram', value: 'instagram' },
      { label: 'Facebook', value: 'facebook' }, { label: 'TikTok', value: 'tiktok' },
      { label: 'YouTube', value: 'youtube' }, { label: 'Other link / رابط آخر', value: 'link' },
    ] },
    orderField,
    visibleField,
  ],
}
