import { apiClient } from './apiClient';

export const fileService = {
  async uploadMilestoneFile(milestoneId, file) {
    const formData = new FormData();
    formData.append('Entity', 'Milestone');
    formData.append('EntityID', milestoneId);
    formData.append('File', file);

    const result = await apiClient.post('/api/files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return result.data;
  },

  async deleteFile(fileId) {
    const result = await apiClient.delete(`/api/files/${fileId}`);
    return result.data;
  },
};