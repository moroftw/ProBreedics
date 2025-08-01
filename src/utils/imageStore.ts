import * as FileSystem from 'expo-file-system';

/**
 * Copiază imaginea aleasă în sandbox-ul aplicației
 * și întoarce URI-ul local permanent.
 */
export async function saveToAppDir(srcUri: string): Promise<string> {
  const dir = FileSystem.documentDirectory + 'images/';
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true });

  // extragem extensia (.jpg / .png etc.)
  const extMatch = srcUri.match(/\.[a-zA-Z0-9]+$/);
  const ext = extMatch ? extMatch[0] : '.jpg';

  const dest = `${dir}${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
  await FileSystem.copyAsync({ from: srcUri, to: dest });

  return dest;   // salvează acest dest în DB
}
