export const waLink = (n: string) => (n ? `https://wa.me/${n.replace(/[^\d]/g, '')}` : '#contact')
export const telLink = (n: string) => `tel:${n.replace(/[^\d+]/g, '')}`
