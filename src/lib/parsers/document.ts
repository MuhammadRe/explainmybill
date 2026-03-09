// ─────────────────────────────────────────────────────
// Document Text Extraction
// ─────────────────────────────────────────────────────
// Supports:
//   - PDF → pdf-parse (extracts text layer)
//   - Images → Sent to Claude Vision API for OCR
//   - Plain text → Direct use

import fs from 'fs/promises';
import path from 'path';

export type ExtractedContent =
  | { type: 'text'; text: string }
  | { type: 'image'; base64: string; mimeType: string };

/**
 * Extract content from a document file.
 * For PDFs: extracts text using pdf-parse.
 * For images: returns base64 data for Claude Vision.
 * For text files: reads the file as UTF-8.
 */
export async function extractDocumentContent(
  filePath: string,
  mimeType: string
): Promise<ExtractedContent> {
  const fileBuffer = await fs.readFile(filePath);

  // ── PDF handling ──────────────────────────────────
  if (mimeType === 'application/pdf') {
    try {
      // Dynamic import to avoid issues with Next.js SSR bundling
      const pdfParse = (await import('pdf-parse')).default;
      const data = await pdfParse(fileBuffer);

      if (!data.text || data.text.trim().length < 50) {
        // PDF may be scanned (image-based). Fall back to base64 for Claude Vision.
        // Note: For scanned PDFs we'd need to convert PDF pages to images first.
        // For now, return what we have with a note.
        return {
          type: 'text',
          text: data.text || 'This appears to be a scanned PDF with no extractable text.',
        };
      }

      return { type: 'text', text: data.text };
    } catch (error) {
      console.error('PDF parsing error:', error);
      throw new Error('Failed to extract text from PDF. The file may be corrupted or encrypted.');
    }
  }

  // ── Image handling ────────────────────────────────
  // JPEG, PNG, WEBP, GIF — send to Claude Vision
  if (mimeType.startsWith('image/')) {
    const base64 = fileBuffer.toString('base64');
    return { type: 'image', base64, mimeType };
  }

  // ── Plain text ────────────────────────────────────
  if (mimeType === 'text/plain') {
    return { type: 'text', text: fileBuffer.toString('utf-8') };
  }

  throw new Error(`Unsupported file type: ${mimeType}`);
}

/**
 * Save an uploaded file to the local uploads directory.
 * Returns the saved file path.
 */
export async function saveUploadedFile(
  buffer: Buffer,
  originalName: string,
  userId: string
): Promise<string> {
  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), 'uploads', userId);
  await fs.mkdir(uploadsDir, { recursive: true });

  // Create a unique filename to prevent collisions
  const timestamp = Date.now();
  const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `${timestamp}_${sanitizedName}`;
  const filePath = path.join(uploadsDir, filename);

  await fs.writeFile(filePath, buffer);

  return filePath;
}

/**
 * Delete a file from the filesystem.
 * Used when a document is deleted by the user.
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    // If file doesn't exist, that's fine
    console.warn(`Could not delete file ${filePath}:`, error);
  }
}
