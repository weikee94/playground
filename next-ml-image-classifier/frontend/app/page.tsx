'use client';

import { useState } from 'react';
import { ImageUpload } from '@/components/ImageUpload';
import { Results } from '@/components/Results';
import { classifyImage, type Prediction } from '@/lib/api';

export default function Home() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileSelected(file: File) {
    setLoading(true);
    setError(null);
    setPredictions([]);

    try {
      const data = await classifyImage(file);
      setPredictions(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Classification failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <h1>Image Classifier</h1>
      <p className="subtitle">Upload an image to classify it using MobileNetV2</p>
      <ImageUpload onFileSelected={handleFileSelected} disabled={loading} />
      {loading && <p className="status">Classifying...</p>}
      {error && <p className="status error">{error}</p>}
      <Results predictions={predictions} />
    </div>
  );
}
