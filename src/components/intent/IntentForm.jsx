import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function IntentForm() {
  // This is a skeleton component that workshop participants will implement
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create Swap Intent</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="input_token">Input Token</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usdc.testnet">USDC</SelectItem>
                <SelectItem value="wnear.testnet">wNEAR</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="input_amount">Amount</Label>
            <Input
              id="input_amount"
              type="number"
              placeholder="Enter amount"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="output_token">Output Token</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usdc.testnet">USDC</SelectItem>
                <SelectItem value="wnear.testnet">wNEAR</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_slippage">Max Slippage (%)</Label>
            <Input
              id="max_slippage"
              type="number"
              placeholder="0.5"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          Submit Intent
        </Button>
      </CardFooter>
    </Card>
  );
}