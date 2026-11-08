import { createRequire } from 'node:module'

// Add the contact list without replacing any existing website content.
// Hosted database: node --env-file=.env.vercel.local scripts/setup-contact-items.mjs
// Local database:  node --env-file=.env scripts/setup-contact-items.mjs
const require = createRequire(import.meta.url)
const { createClient } = require(require.resolve('@libsql/client', { paths: [require.resolve('@payloadcms/db-sqlite')] }))
const client = createClient({ url: process.env.DATABASE_URL || 'file:./elhallaj.db', authToken: process.env.DATABASE_AUTH_TOKEN })
try {
  await client.batch([
    `CREATE TABLE IF NOT EXISTS contact_items (
      id integer PRIMARY KEY NOT NULL, url text, country text DEFAULT 'general' NOT NULL,
      kind text DEFAULT 'link' NOT NULL, "order" numeric DEFAULT 0, visible integer DEFAULT true,
      updated_at text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
      created_at text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS contact_items_locales (
      title text NOT NULL, detail text, id integer PRIMARY KEY NOT NULL,
      _locale text NOT NULL, _parent_id integer NOT NULL,
      FOREIGN KEY (_parent_id) REFERENCES contact_items(id) ON DELETE cascade)`,
    'CREATE INDEX IF NOT EXISTS contact_items_updated_at_idx ON contact_items(updated_at)',
    'CREATE INDEX IF NOT EXISTS contact_items_created_at_idx ON contact_items(created_at)',
    'CREATE UNIQUE INDEX IF NOT EXISTS contact_items_locales_locale_parent_id_unique ON contact_items_locales(_locale, _parent_id)',
    'CREATE INDEX IF NOT EXISTS contact_items_locales_parent_id_idx ON contact_items_locales(_parent_id)',
  ], 'write')
  const locks = await client.execute('PRAGMA table_info(payload_locked_documents_rels)')
  if (!locks.rows.some((row) => row.name === 'contact_items_id')) {
    await client.execute('ALTER TABLE payload_locked_documents_rels ADD COLUMN contact_items_id integer REFERENCES contact_items(id) ON DELETE cascade')
  }
  await client.execute('CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_contact_items_id_idx ON payload_locked_documents_rels(contact_items_id)')
  const site = (await client.execute('SELECT whatsapp, email, instagram, youtube FROM site LIMIT 1')).rows[0] || {}
  const locations = (await client.execute('SELECT _locale, location FROM site_locales')).rows
  const phone = String(site.whatsapp || '')
  const seeds = [
    { country: 'kuwait', kind: 'location', en: locations.find((row) => row._locale === 'en')?.location || 'Salmiya, Kuwait', ar: locations.find((row) => row._locale === 'ar')?.location || 'السالمية، الكويت' },
    { country: 'kuwait', kind: 'whatsapp', en: 'WhatsApp — Kuwait', ar: 'واتساب — كويتي', detail: phone, url: phone ? `https://wa.me/${phone.replace(/\D/g, '')}` : '' },
    { country: 'egypt', kind: 'location', en: 'Alexandria, Egypt', ar: 'مصر، الإسكندرية' },
    { country: 'egypt', kind: 'whatsapp', en: 'WhatsApp — Egypt', ar: 'واتساب — مصري' },
    { country: 'general', kind: 'email', en: 'Email', ar: 'البريد الإلكتروني', detail: site.email, url: site.email ? `mailto:${site.email}` : '' },
    { country: 'general', kind: 'instagram', en: 'Instagram', ar: 'إنستجرام', url: site.instagram },
    { country: 'general', kind: 'facebook', en: 'Facebook', ar: 'فيسبوك' },
    { country: 'general', kind: 'tiktok', en: 'TikTok', ar: 'تيك توك' },
    { country: 'general', kind: 'youtube', en: 'YouTube', ar: 'يوتيوب', url: site.youtube },
  ]
  for (const [order, item] of seeds.entries()) {
    const found = await client.execute({ sql: 'SELECT id FROM contact_items WHERE country = ? AND kind = ? LIMIT 1', args: [item.country, item.kind] })
    if (found.rows.length) continue
    const inserted = await client.execute({ sql: 'INSERT INTO contact_items (url, country, kind, "order", visible) VALUES (?, ?, ?, ?, 1) RETURNING id', args: [item.url || '', item.country, item.kind, order] })
    const id = inserted.rows[0].id
    await client.batch(['en', 'ar'].map((locale) => ({
      sql: 'INSERT INTO contact_items_locales (title, detail, _locale, _parent_id) VALUES (?, ?, ?, ?)',
      args: [item[locale], item.detail || '', locale, id],
    })), 'write')
  }
  await client.batch([
    { sql: 'UPDATE site_locales SET map_intro = ? WHERE _locale = ?', args: ['Choose an area to highlight it and explore the training behind its treatment.', 'en'] },
    { sql: 'UPDATE site_locales SET map_intro = ? WHERE _locale = ?', args: ['اختر منطقة لتظهر بإضاءة زرقاء، وتعرّف على التدريب والخبرات المرتبطة بعلاجها.', 'ar'] },
  ], 'write')
  console.log('Contact list ready. Facebook, TikTok, and Egypt WhatsApp links remain empty.')
} finally {
  client.close()
}
