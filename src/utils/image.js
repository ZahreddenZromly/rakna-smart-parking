// Convert an image File into a compressed base64 data URL so it can be stored
// directly inside a Firestore document (no Firebase Storage / no cost).
// Resizes to maxDim and compresses to JPEG to stay well under Firestore's 1MB limit.
export function fileToCompressedDataURL(file, maxDim = 700, quality = 0.6) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Not an image'))
      return
    }
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Read failed'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Load failed'))
      img.onload = () => {
        let { width, height } = img
        if (width > height && width > maxDim) { height = Math.round(height * maxDim / width); width = maxDim }
        else if (height > maxDim) { width = Math.round(width * maxDim / height); height = maxDim }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d').drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

// rough size of a data URL in KB
export const dataUrlKb = (s) => s ? Math.round((s.length * 3 / 4) / 1024) : 0
