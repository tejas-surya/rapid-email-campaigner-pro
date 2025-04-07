
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Paperclip, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmailComposerProps {
  onSave: (emailData: {
    subject: string;
    body: string;
    attachments: File[];
  }) => void;
}

const EmailComposer: React.FC<EmailComposerProps> = ({ onSave }) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
      const newFiles = Array.from(e.dataTransfer.files);
      setAttachments([...attachments, ...newFiles]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setAttachments([...attachments, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave({
      subject,
      body,
      attachments
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">
          Subject
        </label>
        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Enter email subject"
          className="w-full"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">
          Email Body
        </label>
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Compose your email here..."
          className="min-h-[200px] w-full"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">
          Attachments
        </label>
        <div
          className={cn(
            "border border-dashed rounded-md p-4 transition-colors",
            dragActive ? "border-gmail-primary bg-blue-50" : "border-gray-300",
            "cursor-pointer text-center"
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
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center space-y-2">
            <Paperclip className="h-8 w-8 text-gray-400" />
            <p className="text-sm text-gray-500">
              Drag & drop files here or click to select
            </p>
          </div>
        </div>
        
        {attachments.length > 0 && (
          <div className="mt-2">
            <p className="text-sm font-medium text-gray-700 mb-1">
              {attachments.length} file(s) selected
            </p>
            <div className="space-y-1">
              {attachments.map((file, index) => (
                <div 
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md"
                >
                  <div className="flex items-center space-x-2 truncate">
                    <Paperclip className="h-4 w-4 text-gray-400" />
                    <span className="text-sm truncate">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAttachment(index);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="pt-2">
        <Button onClick={handleSave}>
          Save Email Template
        </Button>
      </div>
    </div>
  );
};

export default EmailComposer;
