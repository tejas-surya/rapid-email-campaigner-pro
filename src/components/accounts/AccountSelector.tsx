
import React, { useState, useEffect } from 'react';
import { Plus, Mail, ChevronDown, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { authorizeWithGmail, hasValidToken, clearAccessToken } from '@/services/gmailApi';
import { toast } from '@/components/ui/use-toast';

type Account = {
  id: string;
  email: string;
  name: string;
};

interface AccountSelectorProps {
  onAddAccount: () => void;
  onSelectAccount: (account: Account) => void;
}

const AccountSelector: React.FC<AccountSelectorProps> = ({ 
  onAddAccount, 
  onSelectAccount 
}) => {
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<Account[]>([]);

  // Load connected accounts on component mount
  useEffect(() => {
    const loadAccounts = () => {
      const savedAccounts = localStorage.getItem('gmail_accounts');
      if (savedAccounts) {
        try {
          const accounts = JSON.parse(savedAccounts);
          setConnectedAccounts(accounts);
          
          // If we have a previously selected account, select it again
          const lastSelected = localStorage.getItem('last_selected_account');
          if (lastSelected) {
            const account = accounts.find((acc: Account) => acc.id === lastSelected);
            if (account) {
              setSelectedAccount(account);
              onSelectAccount(account);
            }
          }
        } catch (e) {
          console.error("Error loading accounts:", e);
        }
      }
    };
    
    loadAccounts();
  }, [onSelectAccount]);

  const handleAccountSelect = (account: Account) => {
    setSelectedAccount(account);
    localStorage.setItem('last_selected_account', account.id);
    onSelectAccount(account);
  };

  const handleAddAccount = async () => {
    // Call the provided onAddAccount callback
    onAddAccount();
    
    // Start the Gmail OAuth flow
    authorizeWithGmail();
    
    // In a real extension, you would get the user info after auth
    // For this demo, we'll simulate it with a timeout
    setTimeout(() => {
      if (hasValidToken()) {
        // In a real app, you would fetch user info from Gmail API
        const newAccount = {
          id: `gmail_${Date.now()}`,
          email: `user${Math.floor(Math.random() * 1000)}@gmail.com`,
          name: 'Gmail User',
        };
        
        // Save the new account
        const updatedAccounts = [...connectedAccounts, newAccount];
        setConnectedAccounts(updatedAccounts);
        localStorage.setItem('gmail_accounts', JSON.stringify(updatedAccounts));
        
        // Select the new account
        handleAccountSelect(newAccount);
        
        toast({
          title: "Account Added",
          description: `Successfully added ${newAccount.email}`,
        });
      }
    }, 1000);
  };

  const handleRemoveAccount = (accountId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const updatedAccounts = connectedAccounts.filter(account => account.id !== accountId);
    setConnectedAccounts(updatedAccounts);
    localStorage.setItem('gmail_accounts', JSON.stringify(updatedAccounts));
    
    if (selectedAccount?.id === accountId) {
      setSelectedAccount(null);
      localStorage.removeItem('last_selected_account');
    }
    
    // If this was the last account, clear the access token
    if (updatedAccounts.length === 0) {
      clearAccessToken();
    }
    
    toast({
      title: "Account Removed",
      description: "The account has been removed",
    });
  };

  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium mb-2 text-gray-700">
        Select Sender Account
      </label>
      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className={cn(
                "flex justify-between items-center w-64",
                !selectedAccount && "text-gray-500"
              )}
            >
              {selectedAccount ? (
                <div className="flex items-center gap-2 overflow-hidden">
                  <Mail className="h-4 w-4 flex-shrink-0 text-gmail-primary" />
                  <span className="truncate">{selectedAccount.email}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <UserCircle className="h-4 w-4" />
                  <span>Select an account</span>
                </div>
              )}
              <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            {connectedAccounts.map((account) => (
              <DropdownMenuItem 
                key={account.id}
                onClick={() => handleAccountSelect(account)}
                className="flex items-center gap-2 justify-between"
              >
                <div className="flex items-center gap-2 truncate">
                  <Mail className="h-4 w-4 text-gmail-primary" />
                  <span className="truncate">{account.email}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 rounded-full"
                  onClick={(e) => handleRemoveAccount(account.id, e)}
                >
                  <span className="sr-only">Remove</span>
                  <span aria-hidden="true">&times;</span>
                </Button>
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem 
              onClick={handleAddAccount}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <Plus className="h-4 w-4" />
              <span>Add new account</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button 
          onClick={handleAddAccount}
          variant="outline"
          size="icon"
          className="flex-shrink-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default AccountSelector;
