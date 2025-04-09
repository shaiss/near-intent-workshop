import React from 'react';
import { Button } from "@/components/ui/button";
import { useWallet } from './WalletProvider';
import { Loader2, Wallet, LogOut } from 'lucide-react';

export default function ConnectButton() {
  const { account, loading, connectWallet, disconnectWallet } = useWallet();

  if (loading) {
    return (
      <Button disabled className="gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (account) {
    return (
      <Button 
        variant="outline"
        onClick={disconnectWallet}
        className="gap-2"
      >
        <LogOut className="h-4 w-4" />
        Disconnect {account.accountId.split('.')[0]}
      </Button>
    );
  }

  return (
    <Button 
      onClick={connectWallet}
      className="gap-2 bg-blue-600 hover:bg-blue-700"
    >
      <Wallet className="h-4 w-4" />
      Connect Wallet
    </Button>
  );
}