import React, { useState } from 'react';
import { useWallet } from '../wallet/WalletProvider';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2 } from 'lucide-react';

export default function IntentForm() {
  const { submitIntent, account } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [intent, setIntent] = useState({
    action: "swap",
    input_token: "",
    input_amount: "",
    output_token: "",
    max_slippage: 0.5
  });

  const tokens = [
    { id: "usdc.testnet", symbol: "USDC", decimals: 6 },
    { id: "wnear.testnet", symbol: "wNEAR", decimals: 24 },
    { id: "aurora.testnet", symbol: "AURORA", decimals: 18 },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!account) {
      setError("Please connect your wallet first");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await submitIntent({
        ...intent,
        input_amount: parseFloat(intent.input_amount),
      });

      console.log("Intent submitted:", result);
      setIntent({
        action: "swap",
        input_token: "",
        input_amount: "",
        output_token: "",
        max_slippage: 0.5
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create Swap Intent</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="input_token">Input Token</Label>
            <Select
              value={intent.input_token}
              onValueChange={(value) => setIntent({ ...intent, input_token: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                {tokens.map(token => (
                  <SelectItem key={token.id} value={token.id}>
                    {token.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="input_amount">Amount</Label>
            <Input
              id="input_amount"
              type="number"
              step="0.000001"
              value={intent.input_amount}
              onChange={(e) => setIntent({ ...intent, input_amount: e.target.value })}
              placeholder="Enter amount"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="output_token">Output Token</Label>
            <Select
              value={intent.output_token}
              onValueChange={(value) => setIntent({ ...intent, output_token: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                {tokens.map(token => (
                  <SelectItem key={token.id} value={token.id}>
                    {token.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_slippage">Max Slippage (%)</Label>
            <Input
              id="max_slippage"
              type="number"
              step="0.1"
              value={intent.max_slippage}
              onChange={(e) => setIntent({ ...intent, max_slippage: parseFloat(e.target.value) })}
              placeholder="0.5"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={loading || !account}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting Intent...
            </>
          ) : (
            'Submit Intent'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}