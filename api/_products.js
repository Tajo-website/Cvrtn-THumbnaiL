// Centralized Server-Side Products & Pricing Registry
// Source of truth for product IDs, prices, currencies, and entitlements.

export const PRODUCTS = {
  'valorant_montage': {
    id: 'valorant_montage',
    name: 'Valorant Montage Style (PSD + Fonts)',
    price: 150,
    currency: 'INR',
    badge: 'PSD Included',
    type: 'PACK',
    downloadPath: '/CVRTNS_THumbnaiL.zip',
    instantDownload: true
  },
  'y2k_pack': {
    id: 'y2k_pack',
    name: 'Y2K 3D Render Pack',
    price: 100,
    currency: 'INR',
    badge: 'Transparent PNGs',
    type: 'PACK',
    downloadPath: '/CVRTNS_THumbnaiL.zip',
    instantDownload: true
  },
  'custom_thumbnail': {
    id: 'custom_thumbnail',
    name: 'Custom Thumbnail Request',
    price: 250,
    currency: 'INR',
    badge: 'Custom Order',
    type: 'CUSTOM_ORDER',
    turnaround: '24-48 Hours',
    instantDownload: false
  }
};

export function getProductById(productId) {
  if (!productId) return null;
  const key = String(productId).toLowerCase().trim();
  
  if (PRODUCTS[key]) return PRODUCTS[key];

  return null;
}
