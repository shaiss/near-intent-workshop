import React from 'react';
import { Button } from "@/components/ui/button";
import { Wallet } from 'lucide-react';

export default function ConnectButton() {
  // This is a skeleton component that workshop participants will implement
  return (
    <Button 
      className="gap-2 bg-blue-600 hover:bg-blue-700"
    >
      <Wallet className="h-4 w-4" />
      Connect Wallet
    </Button>
  );
}