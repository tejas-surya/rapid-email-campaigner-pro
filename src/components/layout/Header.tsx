
import React from 'react';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Mail className="h-6 w-6 text-gmail-primary" />
          <h1 className="text-xl font-bold text-gray-800">RapidMail</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm">
            Documentation
          </Button>
          <Button size="sm">Settings</Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
