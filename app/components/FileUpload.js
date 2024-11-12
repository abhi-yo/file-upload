'use client';
import { useState, useRef } from 'react';
import { CldImage } from 'next-cloudinary';

export default function FileUpload() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [fileType, setFileType] = useState('');

  // Reference to file input
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (!file) return "Please select a file";
    if (file.size > 10 * 1024 * 1024) {
      return "File size must be less than 10MB";
    }
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/quicktime', // For .mov files
      'video/webm'
    ];
    if (!allowedTypes.includes(file.type)) {
      return "Please upload an image (JPEG, PNG, GIF, WEBP) or video file (MP4, MOV, WEBM)";
    }
    return null;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    setError('');

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      setPreviewUrl('');
      setFileType('');
      return;
    }

    setSelectedFile(file);
    setFileType(file.type);

    // Create preview URL
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(file);
  };

  const simulateProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + 5;
      });
    }, 100);
    return interval;
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    try {
      setUploading(true);
      const progressInterval = simulateProgress();

      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setUploadedFile(data);
      setUploadProgress(100);
      clearInterval(progressInterval);

      // Clear selection after successful upload
      setSelectedFile(null);
      setPreviewUrl('');
      setFileType('');

    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const isVideo = fileType.startsWith('video/');

  return (
    <div className="flex flex-col items-center gap-4 p-4 max-w-lg mx-auto">
      <div className="w-full">
        <label
          htmlFor="file-upload"
          className="block w-full cursor-pointer bg-white border-2 border-dashed border-blue-500 rounded-lg p-8 text-center hover:border-blue-600 transition-colors"
        >
          <div className="flex flex-col items-center">
            <svg className="w-8 h-8 text-blue-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            <span className="text-gray-600">Click to select a file</span>
            <span className="text-sm text-gray-500 mt-1">Images or Videos up to 10MB</span>
          </div>
        </label>
        <input
          id="file-upload"
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept="image/*,video/*"
          disabled={uploading}
          className="hidden"
        />
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}

      {previewUrl && (
        <div className="mt-4 w-full">
          <p className="text-sm text-gray-600 mb-2">Preview:</p>
          <div className="relative rounded-lg overflow-hidden">
            {isVideo ? (
              <video
                src={previewUrl}
                controls
                className="w-full h-64 object-contain bg-gray-100"
              />
            ) : (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-64 object-cover"
              />
            )}
          </div>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className={`mt-4 w-full py-2 px-4 rounded-lg ${
              uploading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white transition-colors`}
          >
            {uploading ? 'Uploading...' : `Upload ${isVideo ? 'Video' : 'Image'}`}
          </button>
        </div>
      )}

      {uploading && (
        <div className="w-full">
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">
            {uploadProgress}% uploaded
          </p>
        </div>
      )}

      {uploadedFile && (
        <div className="mt-4 w-full">
          <p className="text-sm text-gray-600 mb-2">Uploaded File:</p>
          <div className="rounded-lg overflow-hidden shadow-lg">
            {uploadedFile.resource_type === 'video' ? (
              <video
                src={uploadedFile.secure_url}
                controls
                className="w-full h-64 object-contain bg-gray-100"
              />
            ) : (
              <CldImage
                src={uploadedFile.public_id}
                width="500"
                height="500"
                alt="Uploaded image"
                className="w-full object-cover"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
