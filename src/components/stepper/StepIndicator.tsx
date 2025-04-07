
import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Step {
  id: string;
  label: string;
  optional?: boolean;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  onStepClick,
}) => {
  return (
    <div className="w-full py-4">
      <ol className="flex items-center w-full">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = onStepClick && index < currentStep;
          
          return (
            <li 
              key={step.id} 
              className={cn(
                "flex items-center",
                index < steps.length - 1 ? "w-full" : "",
              )}
            >
              <div 
                className={cn(
                  "flex items-center justify-center",
                  isClickable ? "cursor-pointer" : ""
                )}
                onClick={() => isClickable && onStepClick(index)}
              >
                <span 
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full shrink-0 text-sm",
                    isCompleted 
                      ? "bg-gmail-primary text-white" 
                      : isCurrent 
                        ? "border-2 border-gmail-primary text-gmail-primary"
                        : "border-2 border-gray-200 text-gray-500"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span 
                  className={cn(
                    "ml-2 text-sm font-medium",
                    isCompleted || isCurrent ? "text-gray-900" : "text-gray-400"
                  )}
                >
                  {step.label}
                  {step.optional && (
                    <span className="ml-1 text-xs font-normal text-gray-500">(optional)</span>
                  )}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div 
                  className={cn(
                    "flex-1 h-0.5 mx-4", 
                    index < currentStep ? "bg-gmail-primary" : "bg-gray-200"
                  )}
                ></div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default StepIndicator;
