import api from '../services/api';

export function uploadMediaFile(file, _path, options = {}) {
  const maxSize = typeof options === 'number' ? options : options.maxSize ?? 25 * 1024 * 1024;
  const onProgress = typeof options === 'object' ? options.onProgress : undefined;

  if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
    return Promise.reject(new Error('Only image and video files can be uploaded.'));
  }
  if (file.size > maxSize) {
    return Promise.reject(new Error(`File must be smaller than ${Math.floor(maxSize / (1024 * 1024))} MB.`));
  }

  onProgress?.(0);
  return api.uploadFile(file).then((result) => {
    onProgress?.(100);
    return {
      name: result.name,
      type: result.type,
      size: file.size,
      url: result.url,
      storagePath: result.path,
    };
  });
}
