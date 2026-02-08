'use client';

import type { Prediction } from '@/lib/api';

export function Results({ predictions }: { predictions: Prediction[] }) {
  if (predictions.length === 0) return null;

  const maxScore = predictions[0].score;

  return (
    <div className="results">
      <h2>Predictions</h2>
      <ul className="prediction-list">
        {predictions.map((p, i) => (
          <li key={i} className="prediction">
            <div className="prediction-header">
              <span className="label">{p.label}</span>
              <span className="score">{(p.score * 100).toFixed(1)}%</span>
            </div>
            <div className="bar-bg">
              <div
                className="bar-fill"
                style={{ width: `${(p.score / maxScore) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
