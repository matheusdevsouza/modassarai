import { put, del, list, head } from '@vercel/blob';

export interface UploadResult {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: Date;
}

export async function uploadFile(
  file: File | Buffer,
  path: string,
  options?: {
    contentType?: string;
    addRandomSuffix?: boolean;
  }
): Promise<UploadResult> {
  try {
    const buffer = file instanceof File 
      ? Buffer.from(await file.arrayBuffer())
      : file;

    const fileSize = buffer.length;

    const blob = await put(path, buffer, {
      access: 'public',
      contentType: options?.contentType || 'application/octet-stream',
      addRandomSuffix: options?.addRandomSuffix !== false,
    });

    return {
      url: blob.url,
      pathname: blob.pathname,
      size: fileSize,
      uploadedAt: new Date(),
    };
  } catch (error) {
    throw new Error('Falha ao fazer upload do arquivo');
  }
}

export async function deleteFile(pathname: string): Promise<boolean> {
  try {
    await del(pathname);
    return true;
  } catch (error) {
    return false;
  }
}

export async function fileExists(pathname: string): Promise<boolean> {
  try {
    await head(pathname);
    return true;
  } catch (error) {
    return false;
  }
}

export async function listFiles(prefix: string): Promise<string[]> {
  try {
    const { blobs } = await list({ prefix });
    return blobs.map((blob: { pathname: string }) => blob.pathname);
  } catch (error) {
    return [];
  }
}

