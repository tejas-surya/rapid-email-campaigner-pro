
import React, { useState } from 'react';
import { Plus, Mail, ChevronDown, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// Mock data - in real implementation this would come from Gmail API/OAuth
const mockAccounts = [
  { id: '1', email: 'demo@gmail.com', name: 'Demo Account' },
  { id: '2', email: 'test@gmail.com', name: 'Test Account' },
];

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

  const handleAccountSelect = (account: Account) => {
    setSelectedAccount(account);
    onSelectAccount(account);
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
            {mockAccounts.map((account) => (
              <DropdownMenuItem 
                key={account.id}
                onClick={() => handleAccountSelect(account)}
                className="flex items-center gap-2"
              >
                <Mail className="h-4 w-4 text-gmail-primary" />
                <span className="truncate flex-1">{account.email}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem 
              onClick={onAddAccount}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <Plus className="h-4 w-4" />
              <span>Add new account</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button 
          onClick={onAddAccount}
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
