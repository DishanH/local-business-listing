import 'server-only'

import sharp from 'sharp'

/** Max edge length for uploaded business photos (covers + gallery). */
const MAX_EDGE = 1600
const WEBP_QUALITY = 80

/**
 * Resize and convert an uploaded image to WebP before storage.
 * Keeps mobile uploads fast to load without visible quality loss on cards/heroes.
 */
export async function optimizeBusinessImage(file: File): Promise<{
  buffer: Buffer
  contentType: 'image/webp'
  ext: 'webp'
}> {
  const input = Buffer.from(await file.arrayBuffer())

  const buffer = await sharp(input)
    .rotate()
    .resize({
      width: MAX_EDGE,
      height: MAX_EDGE,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer()

  return { buffer, contentType: 'image/webp', ext: 'webp' }
}
