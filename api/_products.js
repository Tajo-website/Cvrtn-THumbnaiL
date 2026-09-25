// Centralized Server-Side Products & Pricing Registry
// Source of truth for product IDs, prices, currencies, and entitlements.

export const PRODUCTS = {
  'studio-export': {
    id: 'studio-export',
    name: 'Studio 1280x720 Clean PNG Export',
    price: 20,
    currency: 'INR',
    badge: '1280×720 UHD',
    type: 'STUDIO_EXPORT',
    instantDownload: true
  },
  'ai-visual': {
    id: 'ai-visual',
    name: 'AI 4K Visual Thumbnail (Clean Unlock)',
    price: 49,
    currency: 'INR',
    badge: '4K Clean PNG',
    type: 'AI_VISUAL',
    instantDownload: true
  },
  'starter-pack': {
    id: 'starter-pack',
    name: 'Starter Pack — 150 Elements',
    price: 99,
    currency: 'INR',
    badge: '150 PNGs',
    type: 'PACK',
    downloadPath: '/CVRTNS_THumbnaiL.zip',
    instantDownload: true
  },
  'elements-pack': {
    id: 'elements-pack',
    name: '500+ Viral Elements Pack',
    price: 200,
    currency: 'INR',
    badge: '500+ PNGs • 4K',
    type: 'PACK',
    downloadPath: '/CVRTNS_THumbnaiL.zip',
    instantDownload: true
  },
  'custom-thumbnail': {
    id: 'custom-thumbnail',
    name: 'Custom "THumbnaiL" Commission',
    price: 150,
    currency: 'INR',
    badge: '1-on-1 Design',
    type: 'CUSTOM_ORDER',
    turnaround: '24 Hours',
    instantDownload: false
  }
};

export function getProductById(productId) {
  if (!productId) return null;
  const key = String(productId).toLowerCase().trim();
  
  if (PRODUCTS[key]) return PRODUCTS[key];
  
  // Explicit productType aliases
  if (key === '4k_unlock' || key === '4k-unlock') return PRODUCTS['ai-visual'];
  if (key === 'custom_commission' || key === 'custom-commission') return PRODUCTS['custom-thumbnail'];
  if (key === 'asset_pack' || key === 'asset-pack' || key === 'pack_500') return PRODUCTS['elements-pack'];
  if (key === 'studio_export' || key === 'studio-export') return PRODUCTS['studio-export'];
  if (key === 'starter_pack' || key === 'starter-pack') return PRODUCTS['starter-pack'];

  // Fuzzy matching for product keys
  if (key.includes('studio') || key.includes('export')) return PRODUCTS['studio-export'];
  if (key.includes('ai') || key.includes('4k') || key.includes('visual')) return PRODUCTS['ai-visual'];
  if (key.includes('500') || key.includes('elements') || key.includes('pack') || key.includes('asset')) return PRODUCTS['elements-pack'];
  if (key.includes('starter') || key.includes('150')) return PRODUCTS['starter-pack'];
  if (key.includes('custom') || key.includes('commission') || key.includes('valorant') || key.includes('scifi') || key.includes('game')) return PRODUCTS['custom-thumbnail'];

  return null;
}
