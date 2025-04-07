
import React, { useState, useRef } from 'react';
import { FileText, AlertCircle, Upload, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ValidatedRecipient {
  email: string;
  valid: boolean;
  reason?: string;
}

interface RecipientImporterProps {
  onRecipientsImported: (recipients: ValidatedRecipient[]) => void;
}

const RecipientImporter: React.FC<RecipientImporterProps> = ({ onRecipientsImported }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [recipients, setRecipients] = useState<ValidatedRecipient[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const allowedTypes = ['text/csv', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage('Please upload a CSV or TXT file');
      return;
    }
    
    setFile(file);
    setErrorMessage(null);
    setIsUploading(true);
    
    // Simulate file parsing and validation
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const lines = content.split(/\r?\n/).filter(line => line.trim());
        
        // Simulate progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setUploadProgress(progress);
          
          if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              // Basic email validation
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              const validatedRecipients = lines.map(line => {
                const email = line.trim();
                const isValid = emailRegex.test(email);
                
                return {
                  email,
                  valid: isValid,
                  reason: isValid ? undefined : 'Invalid email format'
                };
              });
              
              setRecipients(validatedRecipients);
              setIsUploading(false);
              onRecipientsImported(validatedRecipients);
            }, 500);
          }
        }, 200);
      } catch (err) {
        setErrorMessage('Error parsing the file. Please try again.');
        setIsUploading(false);
      }
    };
    
    reader.onerror = () => {
      setErrorMessage('Error reading the file. Please try again.');
      setIsUploading(false);
    };
    
    reader.readAsText(file);
  };

  const removeFile = () => {
    setFile(null);
    setRecipients([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validCount = recipients.filter(r => r.valid).length;
  const invalidCount = recipients.length - validCount;

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">
          Import Recipients
        </label>
        
        {!file ? (
          <div
            className={cn(
              "border border-dashed rounded-md p-8 transition-colors",
              dragActive ? "border-gmail-primary bg-blue-50" : "border-gray-300",
              "cursor-pointer"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <Upload className="h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-500">
                Drag & drop your CSV or TXT file here or click to browse
              </p>
              <p className="text-xs text-gray-400">
                File should contain one email address per line
              </p>
            </div>
          </div>
        ) : (
          <div className="border rounded-md p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-gmail-primary" />
                <span className="font-medium">{file.name}</span>
                <span className="text-sm text-gray-500">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 rounded-full"
                onClick={removeFile}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {isUploading && (
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span>Processing file...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-1" />
              </div>
            )}
            
            {recipients.length > 0 && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>{validCount} valid emails</span>
                  </div>
                  
                  {invalidCount > 0 && (
                    <div className="flex items-center space-x-1 text-sm text-amber-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>{invalidCount} invalid emails</span>
                    </div>
                  )}
                </div>
                
                {invalidCount > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-2">
                    <p className="text-xs text-amber-800">
                      Warning: {invalidCount} email(s) appear to be invalid. They will be skipped during sending.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {errorMessage && (
          <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
        )}
      </div>
      
      {recipients.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-1">Recipients Preview</h3>
          <div className="border rounded-md overflow-hidden">
            <div className="max-h-[200px] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recipients.slice(0, 10).map((recipient, index) => (
                    <tr key={`${recipient.email}-${index}`}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        {recipient.email}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        {recipient.valid ? (
                          <span className="text-green-600 flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Valid
                          </span>
                        ) : (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-amber-600 flex items-center">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Invalid
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{recipient.reason}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {recipients.length > 10 && (
                <div className="px-4 py-2 bg-gray-50 text-center text-sm text-gray-500">
                  And {recipients.length - 10} more recipient(s)
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipientImporter;
