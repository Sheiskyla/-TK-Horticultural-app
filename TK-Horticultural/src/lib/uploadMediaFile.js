import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from '../firebase';

export function uploadMediaFile(file, path, options = {}) {
  const maxSize = typeof options === 'number' ? options : options.maxSize ?? 25 * 1024 * 1024;
  const onProgress = typeof options === 'object' ? options.onProgress : undefined;
  if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
    return Promise.reject(new Error('Only image and video files can be uploaded.'));
  }
  if (file.size > maxSize) {
    return Promise.reject(new Error(`File must be smaller than ${Math.floor(maxSize / (1024 * 1024))} MB.`));
  }

  const task = uploadBytesResumable(ref(storage, path), file, { contentType: file.type });
  return new Promise((resolve, reject) => {
    task.on(
      'state_changed',
      (snapshot) => {
        if (snapshot.totalBytes > 0) {
          onProgress?.(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
        }
      },
      reject,
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve({
            name: file.name,
            type: file.type,
            size: file.size,
            url,
            storagePath: task.snapshot.ref.fullPath,
          });
        } catch (error) {
          reject(error);
        }
      }
    );
  });
}
