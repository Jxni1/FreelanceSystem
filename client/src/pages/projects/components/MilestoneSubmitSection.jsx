import { useState } from 'react';
import { useMilestones } from '../../../hooks/useMilestones';
import { useFiles } from '../../../hooks/useFiles';


export default function MilestoneSubmitSection({ milestoneId, onSubmitted }) {
  const { submitMilestone, isLoading, error } = useMilestones();
  const { uploadMilestoneFiles, isUploading, uploadError } = useFiles();

  const [note, setNote] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  const handleRemoveFile = (indexToRemove) => {
    setSelectedFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMessage('');

    let uploadedFileIds = [];

    if (selectedFiles.length > 0) {
      const uploadResult = await uploadMilestoneFiles(milestoneId, selectedFiles);

      if (!uploadResult.success) {
        setLocalError(uploadResult.error || 'Failed to upload file(s).');
        return;
      }

      uploadedFileIds = uploadResult.data.map((file) => file.FilesID || file.filesID);
    }

    const submitResult = await submitMilestone(milestoneId, {
      note,
      fileIds: uploadedFileIds,
    });

    if (!submitResult.success) {
      setLocalError(submitResult.error || 'Failed to submit milestone.');
      return;
    }

    setSuccessMessage('Milestone submitted successfully.');
    setNote('');
    setSelectedFiles([]);
    onSubmitted?.(submitResult.data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor={`note-${milestoneId}`} className="block text-sm font-medium mb-1">
          Submission note
        </label>
        <textarea
          id={`note-${milestoneId}`}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Add a note about this submission"
        />
      </div>

      <div>
        <label htmlFor={`files-${milestoneId}`} className="block text-sm font-medium mb-1">
          Upload deliverables
        </label>
        <input
          id={`files-${milestoneId}`}
          type="file"
          multiple
          onChange={handleFileChange}
          className="block w-full"
        />
      </div>

      {selectedFiles.length > 0 && (
        <div className="rounded-lg border p-3">
          <p className="mb-2 text-sm font-medium">Selected files</p>
          <ul className="space-y-2">
            {selectedFiles.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center justify-between gap-3"
              >
                <span className="text-sm">
                  {file.name} ({Math.round(file.size / 1024)} KB)
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  className="text-sm text-red-600"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(localError || error || uploadError) && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {localError || uploadError || error}
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || isUploading}
        className="rounded-lg bg-teal-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {isUploading ? 'Uploading files...' : isLoading ? 'Submitting...' : 'Submit milestone'}
      </button>
    </form>
  );
}