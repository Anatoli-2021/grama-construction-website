// Local preview validation only. This module does not upload or retain a file.
export const KITCHEN_PHOTO_LIMIT = 8 * 1024 * 1024;
export const KITCHEN_PHOTO_PIXEL_LIMIT = 24_000_000;

export async function kitchenPhotoError(file) {
  if (!file || !Number.isSafeInteger(file.size) || file.size <= 0) return 'Choose a JPEG or PNG photo.';
  if (file.size > KITCHEN_PHOTO_LIMIT) return 'Choose a photo of 8 MB or smaller.';
  if (file.type && !['image/jpeg', 'image/png'].includes(file.type)) return 'Use a JPEG or PNG photo. Other formats are not supported here.';
  try {
    const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    const jpeg = bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    const png = [137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => bytes[index] === byte);
    if ((!jpeg && !png) || (file.type === 'image/jpeg' && !jpeg) || (file.type === 'image/png' && !png)) {
      return 'This file could not be recognized as a JPEG or PNG photo. Choose another photo.';
    }
    return '';
  } catch {
    return 'This photo could not be read. Please choose it again or try another photo.';
  }
}
