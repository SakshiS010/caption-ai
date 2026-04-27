'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface Props {
  onUpload: (file: File) => void;
}

export function VideoUpload({ onUpload }: Props) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) onUpload(accepted[0]);
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': ['.mp4', '.mov', '.avi', '.webm', '.mkv'] },
    maxFiles: 1,
  });

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div
        {...getRootProps()}
        className={`w-full max-w-2xl border-2 border-dashed rounded-2xl p-20 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-blue-500 bg-blue-500/10 scale-[1.02]'
            : 'border-gray-700 hover:border-gray-500 hover:bg-gray-900/60'
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-6xl mb-5 select-none">🎬</div>
        <p className="text-xl font-semibold mb-2 text-white">
          {isDragActive ? 'Drop it here!' : 'Upload a video to get started'}
        </p>
        <p className="text-gray-400 text-sm">
          Drag & drop or click to browse &middot; MP4, MOV, AVI, WebM, MKV
        </p>
      </div>
    </div>
  );
}
