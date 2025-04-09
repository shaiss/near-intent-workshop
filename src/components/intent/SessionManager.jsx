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
import React, { useState, useEffect } from 'react';
import { useWallet } from '../wallet/WalletProvider';
import { Button } from '../ui/button';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export default function SessionManager() {
  const { account, hasActiveSession, createSessionKey } = useWallet();
  const [sessionExists, setSessionExists] = useState(false);
  const [expiryTime, setExpiryTime] = useState(null);

  useEffect(() => {
    if (!account) return;
    
    // Check for existing session
    const item = localStorage.getItem(`sessionKey:${account.accountId}`);
    if (item) {
      const { expires } = JSON.parse(item);
      setSessionExists(true);
      setExpiryTime(new Date(expires));
    } else {
      setSessionExists(false);
      setExpiryTime(null);
    }
  }, [account, hasActiveSession]);

  const handleCreateSession = async () => {
    await createSessionKey();
    
    // Update UI state
    const item = localStorage.getItem(`sessionKey:${account.accountId}`);
    if (item) {
      const { expires } = JSON.parse(item);
      setSessionExists(true);
      setExpiryTime(new Date(expires));
    }
  };

  const handleRevokeSession = () => {
    if (!account) return;
    
    localStorage.removeItem(`sessionKey:${account.accountId}`);
    setSessionExists(false);
    setExpiryTime(null);
  };

  if (!account) {
    return null;
  }

  return (
    <div className="session-manager p-4 border rounded-lg mb-6">
      <h3 className="text-lg font-medium mb-4">Session Key Management</h3>
      
      {sessionExists ? (
        <>
          <Alert className="mb-4">
            <AlertTitle>Active Session</AlertTitle>
            <AlertDescription>
              Your session key allows one-click transactions until {expiryTime.toLocaleString()}.
            </AlertDescription>
          </Alert>
          
          <div className="flex gap-3">
            <Button onClick={handleCreateSession} variant="outline">
              Rotate Key
            </Button>
            <Button onClick={handleRevokeSession} variant="destructive">
              Revoke Session
            </Button>
          </div>
        </>
      ) : (
        <>
          <Alert className="mb-4">
            <AlertTitle>No Active Session</AlertTitle>
            <AlertDescription>
              Create a session key to enable one-click transactions without requiring wallet approval each time.
            </AlertDescription>
          </Alert>
          
          <Button onClick={handleCreateSession}>
            Create Session Key
          </Button>
        </>
      )}
    </div>
  );
}
