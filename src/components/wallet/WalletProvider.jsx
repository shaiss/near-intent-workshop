import React, { createContext, useContext, useState } from 'react';

const WalletContext = createContext(null);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export default function WalletProvider({ children }) {
  // This is a skeleton provider that workshop participants will implement
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);

  // Placeholder functions that will be implemented during the workshop
  const connectWallet = async () => {
    console.log("Connect wallet - to be implemented");
  };

  const disconnectWallet = async () => {
    console.log("Disconnect wallet - to be implemented");
  };

  const submitIntent = async (intent) => {
    console.log("Submit intent - to be implemented", intent);
    return null;
  };

  const value = {
    account,
    loading,
    connectWallet,
    disconnectWallet,
    submitIntent,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}