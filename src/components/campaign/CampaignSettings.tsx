
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InfoCircle, Settings } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CampaignSettingsProps {
  onSettingsChange: (settings: CampaignSettingsData) => void;
}

export interface CampaignSettingsData {
  batchSize: number;
  delayBetweenBatches: number;
  delayBetweenEmails: number;
  retryFailedEmails: boolean;
  maxRetries: number;
  name: string;
}

const CampaignSettings: React.FC<CampaignSettingsProps> = ({ onSettingsChange }) => {
  const [settings, setSettings] = useState<CampaignSettingsData>({
    batchSize: 10,
    delayBetweenBatches: 60,
    delayBetweenEmails: 3,
    retryFailedEmails: true,
    maxRetries: 3,
    name: 'My Campaign',
  });

  const handleChange = <K extends keyof CampaignSettingsData>(
    key: K, 
    value: CampaignSettingsData[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">
          Campaign Name
        </label>
        <Input
          value={settings.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter campaign name"
          className="w-full"
        />
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Basic Settings</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4 pt-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">
                  Emails per batch
                </label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoCircle className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Number of emails sent before a pause</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="text-sm font-medium">{settings.batchSize}</span>
            </div>
            <Slider
              value={[settings.batchSize]}
              onValueChange={(values) => handleChange('batchSize', values[0])}
              min={1}
              max={50}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Gmail's limit is approximately 500 emails per day. Use smaller batches to avoid hitting rate limits.
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">
                  Delay between batches (seconds)
                </label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoCircle className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Time to wait after sending a batch of emails</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="text-sm font-medium">{settings.delayBetweenBatches}s</span>
            </div>
            <Slider
              value={[settings.delayBetweenBatches]}
              onValueChange={(values) => handleChange('delayBetweenBatches', values[0])}
              min={10}
              max={300}
              step={10}
              className="w-full"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-4 pt-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">
                  Delay between emails (seconds)
                </label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoCircle className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Time to wait between individual emails in a batch</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="text-sm font-medium">{settings.delayBetweenEmails}s</span>
            </div>
            <Slider
              value={[settings.delayBetweenEmails]}
              onValueChange={(values) => handleChange('delayBetweenEmails', values[0])}
              min={1}
              max={20}
              step={1}
              className="w-full"
            />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="retry-switch"
                checked={settings.retryFailedEmails}
                onCheckedChange={(checked) => handleChange('retryFailedEmails', checked)}
              />
              <Label htmlFor="retry-switch" className="text-sm font-medium text-gray-700">
                Automatically retry failed emails
              </Label>
            </div>
            
            {settings.retryFailedEmails && (
              <div className="space-y-2 ml-6">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Maximum retry attempts
                  </label>
                  <span className="text-sm font-medium">{settings.maxRetries}</span>
                </div>
                <Slider
                  value={[settings.maxRetries]}
                  onValueChange={(values) => handleChange('maxRetries', values[0])}
                  min={1}
                  max={5}
                  step={1}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="pt-2">
        <Button
          className="flex items-center space-x-2"
          onClick={() => onSettingsChange(settings)}
        >
          <Settings className="h-4 w-4" />
          <span>Apply Settings</span>
        </Button>
      </div>
    </div>
  );
};

export default CampaignSettings;
