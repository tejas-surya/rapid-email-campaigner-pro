
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Clock, Users, FileText, Calendar, Play, Pause, RefreshCw } from 'lucide-react';
import { CampaignSettingsData } from './CampaignSettings';

export interface CampaignData {
  account?: {
    email: string;
    name: string;
  };
  email: {
    subject: string;
    body: string;
    attachmentsCount: number;
  };
  recipients: {
    total: number;
    valid: number;
    invalid: number;
  };
  settings: CampaignSettingsData;
}

interface CampaignSummaryProps {
  campaign: CampaignData;
  onStartCampaign: () => void;
  onPauseCampaign: () => void;
  onRestartCampaign: () => void;
  isRunning: boolean;
  isPaused: boolean;
}

const CampaignSummary: React.FC<CampaignSummaryProps> = ({
  campaign,
  onStartCampaign,
  onPauseCampaign,
  onRestartCampaign,
  isRunning,
  isPaused,
}) => {
  const { account, email, recipients, settings } = campaign;
  
  const estimatedTimeInMinutes = Math.ceil(
    (recipients.valid * settings.delayBetweenEmails + 
     Math.ceil(recipients.valid / settings.batchSize) * settings.delayBetweenBatches) / 60
  );
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl font-bold">{settings.name}</CardTitle>
            <Badge variant={isRunning ? "default" : isPaused ? "outline" : "secondary"}>
              {isRunning ? "Running" : isPaused ? "Paused" : "Ready"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  From
                </h3>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gmail-primary" />
                  <span className="text-sm">
                    {account ? account.email : "No account selected"}
                  </span>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Subject
                </h3>
                <p className="text-sm truncate">
                  {email.subject || "No subject"}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Attachments
                </h3>
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">
                    {email.attachmentsCount === 0
                      ? "No attachments"
                      : `${email.attachmentsCount} attachment(s)`}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Recipients
                </h3>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">
                    {recipients.valid} valid recipient(s)
                  </span>
                </div>
                {recipients.invalid > 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    {recipients.invalid} invalid recipient(s) will be skipped
                  </p>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Batch Size
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{settings.batchSize} emails per batch</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {Math.ceil(recipients.valid / settings.batchSize)} batches in total
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Estimated Time
                </h3>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">
                    ~{estimatedTimeInMinutes} minute{estimatedTimeInMinutes !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3 pt-2">
            {!isRunning && !isPaused && (
              <Button 
                className="flex-1 flex items-center justify-center space-x-2"
                onClick={onStartCampaign}
                disabled={!account || recipients.valid === 0}
              >
                <Play className="h-4 w-4" />
                <span>Start Campaign</span>
              </Button>
            )}
            
            {isRunning && (
              <Button 
                className="flex-1 flex items-center justify-center space-x-2"
                onClick={onPauseCampaign}
                variant="outline"
              >
                <Pause className="h-4 w-4" />
                <span>Pause Campaign</span>
              </Button>
            )}
            
            {isPaused && (
              <>
                <Button 
                  className="flex-1 flex items-center justify-center space-x-2"
                  onClick={onStartCampaign}
                >
                  <Play className="h-4 w-4" />
                  <span>Resume</span>
                </Button>
                
                <Button 
                  className="flex-1 flex items-center justify-center space-x-2"
                  onClick={onRestartCampaign}
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Restart</span>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignSummary;
