
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mail, AlertCircle, Clock, CheckCircle, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';

export type EmailStatus = 'pending' | 'sending' | 'sent' | 'failed';

export interface EmailLog {
  id: string;
  email: string;
  status: EmailStatus;
  timestamp?: Date;
  errorMessage?: string;
  retryCount?: number;
}

interface SendingProgressProps {
  logs: EmailLog[];
  totalEmails: number;
  currentBatch: number;
  totalBatches: number;
  startTime?: Date;
}

const SendingProgress: React.FC<SendingProgressProps> = ({
  logs,
  totalEmails,
  currentBatch,
  totalBatches,
  startTime,
}) => {
  const sent = logs.filter((log) => log.status === 'sent').length;
  const failed = logs.filter((log) => log.status === 'failed').length;
  const sending = logs.filter((log) => log.status === 'sending').length;
  const pending = logs.filter((log) => log.status === 'pending').length;
  
  const progress = Math.round((sent / totalEmails) * 100);
  
  const elapsedTimeInSeconds = startTime 
    ? Math.round((new Date().getTime() - startTime.getTime()) / 1000)
    : 0;
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };
  
  const getStatusIcon = (status: EmailStatus) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'sending':
        return <Loader className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-400" />;
      default:
        return null;
    }
  };
  
  const getStatusClass = (status: EmailStatus) => {
    switch (status) {
      case 'sent':
        return 'text-green-700 bg-green-50';
      case 'failed':
        return 'text-red-700 bg-red-50';
      case 'sending':
        return 'text-blue-700 bg-blue-50 animate-pulse-slow';
      case 'pending':
        return 'text-gray-500 bg-gray-50';
      default:
        return '';
    }
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Sending Progress</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-medium">
                <span>Overall Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-3 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gmail-primary mr-2" />
                    <span className="text-sm font-medium">Total</span>
                  </div>
                  <span className="text-lg font-bold">{totalEmails}</span>
                </div>
              </div>
              
              <div className="bg-green-50 p-3 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm font-medium">Sent</span>
                  </div>
                  <span className="text-lg font-bold">{sent}</span>
                </div>
              </div>
              
              <div className="bg-amber-50 p-3 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-amber-500 mr-2" />
                    <span className="text-sm font-medium">Pending</span>
                  </div>
                  <span className="text-lg font-bold">{pending + sending}</span>
                </div>
              </div>
              
              <div className="bg-red-50 p-3 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                    <span className="text-sm font-medium">Failed</span>
                  </div>
                  <span className="text-lg font-bold">{failed}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between md:items-center space-y-2 md:space-y-0 border-t border-gray-100 pt-3">
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-500">Batch:</span>
                <span className="font-medium">{currentBatch} of {totalBatches}</span>
              </div>
              
              {startTime && (
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-gray-500">Elapsed time:</span>
                  <span className="font-medium">{formatTime(elapsedTimeInSeconds)}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-500">Estimated rate:</span>
                <span className="font-medium">
                  {elapsedTimeInSeconds > 0 
                    ? Math.round((sent / elapsedTimeInSeconds) * 60) 
                    : 0} emails/min
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-lg font-medium">Email Logs</CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <Tabs defaultValue="all">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="all">All ({logs.length})</TabsTrigger>
              <TabsTrigger value="sent">Sent ({sent})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pending + sending})</TabsTrigger>
              <TabsTrigger value="failed">Failed ({failed})</TabsTrigger>
            </TabsList>
            
            {['all', 'sent', 'pending', 'failed'].map((tab) => (
              <TabsContent key={tab} value={tab} className="mt-0">
                <ScrollArea className="h-[300px] rounded-md border">
                  <div className="divide-y">
                    {logs
                      .filter((log) => {
                        if (tab === 'all') return true;
                        if (tab === 'sent') return log.status === 'sent';
                        if (tab === 'pending') return log.status === 'pending' || log.status === 'sending';
                        if (tab === 'failed') return log.status === 'failed';
                        return true;
                      })
                      .map((log) => (
                        <div 
                          key={log.id} 
                          className={cn(
                            "flex items-center justify-between py-2 px-4",
                            log.status === 'sending' && "animate-pulse-slow"
                          )}
                        >
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(log.status)}
                            <span className="text-sm truncate max-w-[200px]">{log.email}</span>
                          </div>
                          <div className="flex items-center">
                            <span 
                              className={cn(
                                "px-2 py-1 rounded-full text-xs",
                                getStatusClass(log.status)
                              )}
                            >
                              {log.status}
                            </span>
                            {log.timestamp && (
                              <span className="text-xs text-gray-500 ml-3">
                                {log.timestamp.toLocaleTimeString()}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      
                    {logs.filter((log) => {
                      if (tab === 'all') return true;
                      if (tab === 'sent') return log.status === 'sent';
                      if (tab === 'pending') return log.status === 'pending' || log.status === 'sending';
                      if (tab === 'failed') return log.status === 'failed';
                      return true;
                    }).length === 0 && (
                      <div className="py-8 text-center text-gray-500">
                        No {tab === 'all' ? 'emails' : tab} logs available
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SendingProgress;
