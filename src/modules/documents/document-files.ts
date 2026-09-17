export type DocumentContentType = 'application/pdf' | 'image/jpeg' | 'image/png'

export function getDocumentContentType(
  file: File,
  allowedTypes: readonly DocumentContentType[],
): DocumentContentType | null {
  const name = file.name.toLowerCase()
  const contentType =
    file.type === 'application/pdf' || name.endsWith('.pdf')
      ? 'application/pdf'
      : file.type === 'image/jpeg' ||
          name.endsWith('.jpg') ||
          name.endsWith('.jpeg')
        ? 'image/jpeg'
        : file.type === 'image/png' || name.endsWith('.png')
          ? 'image/png'
          : null

  return contentType && allowedTypes.includes(contentType) ? contentType : null
}

export function getDocumentExtension(contentType: DocumentContentType) {
  if (contentType === 'application/pdf') return 'pdf'
  if (contentType === 'image/jpeg') return 'jpg'
  return 'png'
}

export function validateDocumentBytes(
  bytes: Buffer,
  contentType: DocumentContentType,
) {
  const valid =
    contentType === 'application/pdf'
      ? bytes.subarray(0, 5).equals(Buffer.from('%PDF-'))
      : contentType === 'image/jpeg'
        ? bytes.length >= 3 &&
          bytes[0] === 0xff &&
          bytes[1] === 0xd8 &&
          bytes[2] === 0xff
        : bytes
            .subarray(0, 8)
            .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))

  if (!valid) {
    const label =
      contentType === 'application/pdf'
        ? 'PDF'
        : contentType === 'image/jpeg'
          ? 'JPG'
          : 'PNG'
    throw new Error(`Isi berkas bukan ${label} yang valid.`)
  }
}
