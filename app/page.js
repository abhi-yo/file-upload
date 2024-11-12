'use client';
import FileUpload from './components/FileUpload';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">
          File Upload
        </h1>
        <FileUpload />
      </div>
    </main>
  );
}
