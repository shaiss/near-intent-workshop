import React from 'react';
import { useWallet } from '../wallet/WalletProvider';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Key, ShieldAlert } from 'lucide-react';

export default function SessionManager() {
  const { sessionWallet, clearSession, account } = useWallet();

  if (!account) return null;

  return (
    <Card className="w-full max-w-md mx-auto mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5" />
          Session Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Session Status</span>
            <Badge variant={sessionWallet ? "success" : "destructive"}>
              {sessionWallet ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Account</span>
            <span className="text-sm">{account.accountId}</span>
          </div>

          {sessionWallet && (
            <div className="flex items-center gap-2">
              <Button
                variant="destructive"
                className="w-full gap-2"
                onClick={clearSession}
              >
                <ShieldAlert className="w-4 h-4" />
                Reset Session Key
              </Button>
            </div>
          )}

          <div className="text-xs text-gray-500 mt-4">
            <p>Session keys allow for simplified transaction signing without repeated wallet confirmations.</p>
            <p className="mt-1">Reset your session key if you suspect any security issues.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}