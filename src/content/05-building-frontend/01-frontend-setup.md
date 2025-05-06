# Setting Up Frontend

## Frontend Architecture for Intent-Centric Applications

Building a frontend for intent-centric applications requires careful planning to create an intuitive user experience. This section covers the basic setup and architecture for your application's frontend.

## Project Structure

A typical intent-based dApp frontend might be structured as follows:

```
src/
  components/
    intent/
      IntentForm.jsx
      IntentHistory.jsx
      IntentStatus.jsx
    wallet/
      ConnectButton.jsx
      WalletProvider.jsx
    ui/
      ... reusable UI components
  hooks/
    useIntent.js
    useWallet.js
    useSolver.js
  services/
    intentService.js
    walletService.js
  utils/
    formatting.js
    validation.js
  pages/
    Home.jsx
    Dashboard.jsx
```

## Key Frontend Dependencies

```bash
# UI and styling
npm install tailwindcss @headlessui/react framer-motion

# State management
npm install zustand immer

# NEAR integration
npm install near-api-js @near-wallet-selector/core

# Form handling
npm install react-hook-form zod @hookform/resolvers
```

## Setting Up React with NEAR Integration

Here's an example of setting up a basic React application with NEAR integration:

```jsx
// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './components/wallet/WalletProvider';
import { ToastContainer } from 'react-toastify';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <WalletProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
        <ToastContainer position="bottom-right" />
      </WalletProvider>
    </BrowserRouter>
  );
}

export default App;
```

## Custom Hooks for Intent Handling

Creating custom hooks makes it easier to reuse intent-related functionality:

```jsx
// src/hooks/useIntent.js
import { useState, useCallback } from 'react';
import { useWallet } from './useWallet';
import { submitIntent, getIntentStatus } from '../services/intentService';

export function useIntent() {
  const { accountId, signIntent } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const createAndSubmitIntent = useCallback(async (intentType, params) => {
    try {
      setLoading(true);
      setError(null);
      
      // Create the intent object
      const intent = {
        type: intentType,
        creator: accountId,
        params,
        timestamp: Date.now()
      };
      
      // Sign the intent
      const signedIntent = await signIntent(intent);
      
      // Submit to the verifier
      const result = await submitIntent(signedIntent);
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [accountId, signIntent]);
  
  return {
    createAndSubmitIntent,
    loading,
    error
  };
}
```

In the next section, we'll implement the wallet connection flow for our application.
# Setting Up Frontend

## Frontend Architecture for Intent-Centric Applications

In this section, we'll set up a React-based frontend that interacts with our NEAR smart contracts for intent verification and fulfillment.

## Project Setup

If you don't already have a frontend project, you can create one using Vite:

```bash
npm create vite@latest frontend --template react
cd frontend
npm install
```

## Installing Essential Packages

We'll need several packages for our NEAR integration and UI:

```bash
npm install near-api-js @near-wallet-selector/core \
            @near-wallet-selector/near-wallet \
            tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## Project Structure

Your frontend project should have a structure similar to this:

```
src/
  components/
    wallet/
      ConnectButton.jsx
      WalletProvider.jsx
    intent/
      IntentForm.jsx
      SolverOptions.jsx
  hooks/
    useWallet.js
    useIntent.js
  services/
    intentService.js
  App.jsx
  main.jsx
```

## Setting Up Tailwind CSS

Configure Tailwind in your project:

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Add the Tailwind directives to your CSS:

```css
/* index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

By setting up the project with this structure, we'll have a solid foundation for building our intent-based UI components in the next sections.
