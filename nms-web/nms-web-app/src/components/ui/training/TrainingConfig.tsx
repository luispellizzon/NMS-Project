// src/components/ui/training/TrainingConfig.tsx
'use client';

import { useState } from 'react';
import { Save, Play, AlertCircle } from 'lucide-react';

interface TrainingConfigProps {
  onStartTraining?: (config: TrainingConfiguration) => void;
}

interface TrainingConfiguration {
  modelType: string;
  dataSource: string[];
  epochs: number;
  batchSize: number;
  learningRate: number;
  validationSplit: number;
  optimizer: string;
}

export default function TrainingConfig({ onStartTraining }: TrainingConfigProps) {
  const [config, setConfig] = useState<TrainingConfiguration>({
    modelType: 'speech-analysis',
    dataSource: ['questionnaires', 'speech-samples'],
    epochs: 50,
    batchSize: 32,
    learningRate: 0.001,
    validationSplit: 0.2,
    optimizer: 'adam',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartTraining?.(config);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-xl font-semibold text-foreground mb-6">Training Configuration</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Model Type */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Model Type
          </label>
          <select
            value={config.modelType}
            onChange={(e) => setConfig({ ...config, modelType: e.target.value })}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#0d7377]"
          >
            <option value="speech-analysis">Speech Analysis Model</option>
            <option value="questionnaire">Questionnaire Risk Model</option>
            <option value="cognitive-test">Cognitive Test Model</option>
            <option value="combined">Combined Multi-Modal Model</option>
          </select>
        </div>

        {/* Data Sources */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Data Sources
          </label>
          <div className="space-y-2">
            {['questionnaires', 'speech-samples', 'cognitive-tests'].map((source) => (
              <label key={source} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.dataSource.includes(source)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setConfig({
                        ...config,
                        dataSource: [...config.dataSource, source],
                      });
                    } else {
                      setConfig({
                        ...config,
                        dataSource: config.dataSource.filter((s) => s !== source),
                      });
                    }
                  }}
                  className="w-4 h-4 text-[#0d7377] border-border rounded focus:ring-2 focus:ring-[#0d7377]"
                />
                <span className="text-foreground capitalize">
                  {source.replace('-', ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Training Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Epochs
            </label>
            <input
              type="number"
              value={config.epochs}
              onChange={(e) =>
                setConfig({ ...config, epochs: parseInt(e.target.value) })
              }
              min="1"
              max="1000"
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#0d7377]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Batch Size
            </label>
            <input
              type="number"
              value={config.batchSize}
              onChange={(e) =>
                setConfig({ ...config, batchSize: parseInt(e.target.value) })
              }
              min="1"
              max="512"
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#0d7377]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Learning Rate
            </label>
            <input
              type="number"
              value={config.learningRate}
              onChange={(e) =>
                setConfig({ ...config, learningRate: parseFloat(e.target.value) })
              }
              step="0.0001"
              min="0.0001"
              max="1"
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#0d7377]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Validation Split
            </label>
            <input
              type="number"
              value={config.validationSplit}
              onChange={(e) =>
                setConfig({ ...config, validationSplit: parseFloat(e.target.value) })
              }
              step="0.05"
              min="0.1"
              max="0.5"
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#0d7377]"
            />
          </div>
        </div>

        {/* Optimizer */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Optimizer
          </label>
          <select
            value={config.optimizer}
            onChange={(e) => setConfig({ ...config, optimizer: e.target.value })}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#0d7377]"
          >
            <option value="adam">Adam</option>
            <option value="sgd">SGD</option>
            <option value="rmsprop">RMSprop</option>
            <option value="adagrad">Adagrad</option>
          </select>
        </div>

        {/* Warning Message */}
        <div className="flex items-start gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800">
              Training Impact
            </p>
            <p className="text-sm text-yellow-700 mt-1">
              Starting a new training job will use significant compute resources. Ensure all
              configuration parameters are correct before proceeding.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-[#0d7377] text-white rounded-lg hover:bg-[#0a5c5f] transition-colors"
          >
            <Play className="w-5 h-5" />
            Start Training
          </button>
          <button
            type="button"
            className="flex items-center gap-2 px-6 py-3 bg-background border border-border text-foreground rounded-lg hover:bg-accent transition-colors"
          >
            <Save className="w-5 h-5" />
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}