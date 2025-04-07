import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import AccountSelector from '@/components/accounts/AccountSelector';
import EmailComposer from '@/components/campaign/EmailComposer';
import RecipientImporter from '@/components/campaign/RecipientImporter';
import CampaignSettings, { CampaignSettingsData } from '@/components/campaign/CampaignSettings';
import CampaignSummary, { CampaignData } from '@/components/campaign/CampaignSummary';
import SendingProgress, { EmailLog } from '@/components/dashboard/SendingProgress';
import StepIndicator, { Step } from '@/components/stepper/StepIndicator';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, ArrowRight, RefreshCcw } from 'lucide-react';
import { sendEmail } from '@/services/gmailApi';

// Define the steps for our setup process
const steps: Step[] = [
  { id: 'account', label: 'Select Account' },
  { id: 'compose', label: 'Compose Email' },
  { id: 'recipients', label: 'Add Recipients' },
  { id: 'settings', label: 'Campaign Settings' },
  { id: 'review', label: 'Review & Send' },
];

// Type for our validated recipient
interface ValidatedRecipient {
  email: string;
  valid: boolean;
  reason?: string;
}

const Index = () => {
  // State for managing the current step
  const [currentStep, setCurrentStep] = useState(0);
  
  // State for the selected account
  const [account, setAccount] = useState<{ id: string; email: string; name: string } | null>(null);
  
  // State for the email being composed
  const [emailData, setEmailData] = useState<{
    subject: string;
    body: string;
    attachments: File[];
  }>({
    subject: '',
    body: '',
    attachments: [],
  });
  
  // State for recipients
  const [recipients, setRecipients] = useState<ValidatedRecipient[]>([]);
  
  // State for campaign settings
  const [campaignSettings, setCampaignSettings] = useState<CampaignSettingsData>({
    batchSize: 10,
    delayBetweenBatches: 60,
    delayBetweenEmails: 3,
    retryFailedEmails: true,
    maxRetries: 3,
    name: 'My Campaign',
  });
  
  // State for campaign running status
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState<Date | undefined>(undefined);
  const [currentBatch, setCurrentBatch] = useState(1);
  
  // State for email logs
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  
  // Calculate total batches
  const totalBatches = Math.ceil(recipients.filter(r => r.valid).length / campaignSettings.batchSize);
  
  // Handler for when an account is selected
  const handleAccountSelect = (selectedAccount: { id: string; email: string; name: string }) => {
    setAccount(selectedAccount);
    toast({
      title: "Account Selected",
      description: `${selectedAccount.email} has been selected as the sender.`,
    });
  };
  
  // Handler for adding a new account
  const handleAddAccount = () => {
    toast({
      title: "Add Account",
      description: "In a real extension, this would trigger the Gmail OAuth flow.",
    });
    // In a real app, this would trigger an OAuth flow with Gmail
  };
  
  // Handler for when email composition is saved
  const handleEmailSave = (data: {
    subject: string;
    body: string;
    attachments: File[];
  }) => {
    setEmailData(data);
    toast({
      title: "Email Saved",
      description: "Your email template has been saved.",
    });
  };
  
  // Handler for when recipients are imported
  const handleRecipientsImported = (importedRecipients: ValidatedRecipient[]) => {
    setRecipients(importedRecipients);
    const validCount = importedRecipients.filter(r => r.valid).length;
    toast({
      title: "Recipients Imported",
      description: `${validCount} valid recipient(s) imported.`,
    });
  };
  
  // Handler for when campaign settings are changed
  const handleSettingsChange = (settings: CampaignSettingsData) => {
    setCampaignSettings(settings);
    toast({
      title: "Settings Updated",
      description: "Campaign settings have been updated.",
    });
  };
  
  // Generate campaign data for the summary
  const campaignData: CampaignData = {
    account: account ? { email: account.email, name: account.name } : undefined,
    email: {
      subject: emailData.subject,
      body: emailData.body,
      attachmentsCount: emailData.attachments.length,
      attachments: emailData.attachments,
    },
    recipients: {
      total: recipients.length,
      valid: recipients.filter(r => r.valid).length,
      invalid: recipients.filter(r => !r.valid).length,
      emails: recipients.filter(r => r.valid).map(r => r.email),
    },
    settings: campaignSettings,
  };
  
  // Function to actually send emails
  const sendRealEmails = async () => {
    // Find the next batch of pending emails
    const pendingEmails = emailLogs.filter(log => log.status === 'pending');
    
    if (pendingEmails.length === 0) {
      // All emails are processed
      setIsRunning(false);
      toast({
        title: "Campaign Completed",
        description: "All emails have been processed.",
      });
      return;
    }
    
    // Take the next batch
    const currentBatchEmails = pendingEmails.slice(0, campaignSettings.batchSize);
    
    // Mark them as sending
    const updatedLogs = [...emailLogs];
    
    currentBatchEmails.forEach(email => {
      const index = updatedLogs.findIndex(log => log.id === email.id);
      if (index !== -1) {
        updatedLogs[index] = {
          ...updatedLogs[index],
          status: 'sending',
        };
      }
    });
    
    setEmailLogs(updatedLogs);
    
    // Process each email in the batch
    let emailIndex = 0;
    
    const processEmail = async () => {
      if (emailIndex >= currentBatchEmails.length || !isRunning) {
        // Batch completed or campaign paused
        if (isRunning) {
          // If we're still running, schedule the next batch
          setTimeout(() => {
            setCurrentBatch(prev => prev + 1);
            sendRealEmails();
          }, campaignSettings.delayBetweenBatches * 1000);
        }
        return;
      }
      
      const email = currentBatchEmails[emailIndex];
      const recipientEmail = email.email;
      
      try {
        // Actually send the email using Gmail API
        const result = await sendEmail(
          recipientEmail,
          emailData.subject,
          emailData.body,
          account?.email || "",
          emailData.attachments
        );
        
        const updatedLogs = [...emailLogs];
        const index = updatedLogs.findIndex(log => log.id === email.id);
        
        if (index !== -1) {
          updatedLogs[index] = {
            ...updatedLogs[index],
            status: result.success ? 'sent' : 'failed',
            timestamp: new Date(),
            errorMessage: result.error,
          };
        }
        
        setEmailLogs(updatedLogs);
        emailIndex++;
        
        // Schedule the next email
        setTimeout(() => {
          processEmail();
        }, campaignSettings.delayBetweenEmails * 1000);
      } catch (error) {
        console.error("Error sending email:", error);
        
        const updatedLogs = [...emailLogs];
        const index = updatedLogs.findIndex(log => log.id === email.id);
        
        if (index !== -1) {
          updatedLogs[index] = {
            ...updatedLogs[index],
            status: 'failed',
            timestamp: new Date(),
            errorMessage: error instanceof Error ? error.message : "Unknown error",
          };
        }
        
        setEmailLogs(updatedLogs);
        emailIndex++;
        
        // Schedule the next email
        setTimeout(() => {
          processEmail();
        }, campaignSettings.delayBetweenEmails * 1000);
      }
    };
    
    processEmail();
  };
  
  // Replace the simulateSending function with the real one
  const simulateSending = sendRealEmails;
  
  // Modify your startCampaign function to handle Gmail authentication check
  const startCampaign = () => {
    if (!account) {
      toast({
        title: "Error",
        description: "Please select a sender account first.",
        variant: "destructive",
      });
      return;
    }
    
    if (recipients.filter(r => r.valid).length === 0) {
      toast({
        title: "Error",
        description: "No valid recipients found. Please import recipients first.",
        variant: "destructive",
      });
      return;
    }
    
    // If it's a fresh start, initialize logs
    if (!isPaused) {
      const logs: EmailLog[] = recipients
        .filter(r => r.valid)
        .map((recipient, index) => ({
          id: `email-${index}`,
          email: recipient.email,
          status: 'pending' as const,
        }));
      
      setEmailLogs(logs);
      setStartTime(new Date());
      setCurrentBatch(1);
    }
    
    setIsRunning(true);
    setIsPaused(false);
    
    toast({
      title: isPaused ? "Campaign Resumed" : "Campaign Started",
      description: isPaused 
        ? "Your email campaign has been resumed." 
        : "Your email campaign has been started. Emails will be sent in batches.",
    });
    
    // Start sending emails
    sendRealEmails();
  };
  
  // Handlers for campaign control
  const pauseCampaign = () => {
    setIsRunning(false);
    setIsPaused(true);
    
    toast({
      title: "Campaign Paused",
      description: "Your email campaign has been paused. You can resume it anytime.",
    });
  };
  
  const restartCampaign = () => {
    setIsRunning(false);
    setIsPaused(false);
    setStartTime(undefined);
    
    // Reset all email logs to pending
    const resetLogs = emailLogs.map(log => ({
      ...log,
      status: 'pending' as const,
      timestamp: undefined,
      errorMessage: undefined,
      retryCount: undefined,
    }));
    
    setEmailLogs(resetLogs);
    setCurrentBatch(1);
    
    toast({
      title: "Campaign Reset",
      description: "Your email campaign has been reset. You can start it again.",
    });
  };
  
  // Check if we can proceed to the next step
  const canProceed = () => {
    switch (currentStep) {
      case 0: // Account selection
        return !!account;
      case 1: // Email composition
        return !!emailData.subject && !!emailData.body;
      case 2: // Recipients
        return recipients.filter(r => r.valid).length > 0;
      case 3: // Settings
        return true;
      default:
        return true;
    }
  };
  
  // Handlers for step navigation
  const goToNextStep = () => {
    if (currentStep < steps.length - 1 && canProceed()) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const goToPrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Effect to update the document title
  useEffect(() => {
    document.title = "RapidMail - Bulk Email Sender";
  }, []);
  
  // Render the current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card>
            <CardContent className="p-6">
              <AccountSelector 
                onAddAccount={handleAddAccount} 
                onSelectAccount={handleAccountSelect} 
              />
            </CardContent>
          </Card>
        );
      case 1:
        return (
          <Card>
            <CardContent className="p-6">
              <EmailComposer onSave={handleEmailSave} />
            </CardContent>
          </Card>
        );
      case 2:
        return (
          <Card>
            <CardContent className="p-6">
              <RecipientImporter onRecipientsImported={handleRecipientsImported} />
            </CardContent>
          </Card>
        );
      case 3:
        return (
          <Card>
            <CardContent className="p-6">
              <CampaignSettings onSettingsChange={handleSettingsChange} />
            </CardContent>
          </Card>
        );
      case 4:
        return (
          <div className="space-y-6">
            <CampaignSummary 
              campaign={campaignData}
              onStartCampaign={startCampaign}
              onPauseCampaign={pauseCampaign}
              onRestartCampaign={restartCampaign}
              isRunning={isRunning}
              isPaused={isPaused}
            />
            
            {(isRunning || isPaused || emailLogs.length > 0) && (
              <SendingProgress 
                logs={emailLogs}
                totalEmails={recipients.filter(r => r.valid).length}
                currentBatch={currentBatch}
                totalBatches={totalBatches}
                startTime={startTime}
              />
            )}
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <StepIndicator 
            steps={steps} 
            currentStep={currentStep} 
            onStepClick={(index) => {
              // Only allow going back to completed steps
              if (index < currentStep) {
                setCurrentStep(index);
              }
            }} 
          />
          
          <div className="mt-4">
            {renderStepContent()}
          </div>
          
          {currentStep < steps.length - 1 && (
            <div className="mt-6 flex justify-between">
              <Button 
                variant="outline" 
                onClick={goToPrevStep}
                disabled={currentStep === 0}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              
              <Button 
                onClick={goToNextStep}
                disabled={!canProceed()}
                className="flex items-center space-x-2"
              >
                <span>Next</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {currentStep === steps.length - 1 && !isRunning && !isPaused && emailLogs.length > 0 && (
            <div className="mt-6 flex justify-center">
              <Button 
                variant="outline" 
                onClick={restartCampaign}
                className="flex items-center space-x-2"
              >
                <RefreshCcw className="h-4 w-4" />
                <span>Reset Campaign</span>
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
