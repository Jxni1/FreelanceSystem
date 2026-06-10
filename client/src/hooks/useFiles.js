import { useCallback, useState } from 'react';
import { fileService } from '../lib/fileService';

export function useFiles() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const uploadMilestoneFiles = useCallback(async (milestoneId, files) => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const uploadedFiles = [];

      for (const file of files) {
        const result = await fileService.uploadMilestoneFile(milestoneId, file);
        uploadedFiles.push(result);
      }

      return { success: true, data: uploadedFiles };
    } catch (err) {
      const raw = err?.response?.data;
      const message =
        typeof raw === 'string'
          ? raw
          : raw?.message || (Array.isArray(raw) ? raw.join(' ') : 'Failed to upload files.');

      setUploadError(message);
      return { success: false, error: message };
    } finally {
      setIsUploading(false);
    }
  }, []);

  return {
    isUploading,
    uploadError,
    uploadMilestoneFiles,
  };
}