import { useState } from 'react';
import { SchemaForm } from './SchemaForm';
import type { FormSchema } from './types';

interface Props {
  schema: FormSchema;
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel?: () => void;
}

export function CreateForm({ schema, onSubmit, onCancel }: Props) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState<Record<string, unknown>>({});

  const steps = schema.steps;
  const isWizard = steps && steps.length > 0;

  const handleSubmit = (data: Record<string, unknown>) => {
    onSubmit(data);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  if (isWizard && steps) {
    const step = steps[currentStep];
    const stepFields = schema.fields.filter((f) => step.fields.includes(f.name));
    const isLast = currentStep === steps.length - 1;

    const handleStepSubmit = (data: Record<string, unknown>) => {
      const merged = { ...wizardData, ...data };
      if (isLast) {
        handleSubmit(merged);
      } else {
        setWizardData(merged);
        setCurrentStep((s) => s + 1);
      }
    };

    const handleBack = () => {
      if (currentStep > 0) setCurrentStep((s) => s - 1);
      else onCancel?.();
    };

    return (
      <div>
        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-6">
          {steps.map((s, i) => (
            <div key={s.title} className="flex items-center gap-2">
              {i > 0 && <div className="w-8 h-px bg-gray-300" />}
              <div
                className={`flex items-center gap-1.5 text-xs ${
                  i === currentStep
                    ? 'text-blue-600 font-medium'
                    : i < currentStep
                      ? 'text-green-600'
                      : 'text-gray-400'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs ${
                    i === currentStep
                      ? 'bg-blue-500'
                      : i < currentStep
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                  }`}
                >
                  {i < currentStep ? '✓' : i + 1}
                </span>
                {s.title}
              </div>
            </div>
          ))}
        </div>

        <SchemaForm
          key={currentStep}
          schema={schema}
          fields={stepFields}
          initialData={wizardData}
          onSubmit={handleStepSubmit}
          onCancel={handleBack}
          submitLabel={isLast ? '创建' : '下一步'}
        />

        {showSuccess && (
          <div className="mt-4 p-3 bg-green-50 text-green-700 text-sm rounded-md">
            创建成功
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <SchemaForm
        schema={schema}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        submitLabel="创建"
      />
      {showSuccess && (
        <div className="mt-4 p-3 bg-green-50 text-green-700 text-sm rounded-md">
          创建成功
        </div>
      )}
    </div>
  );
}
