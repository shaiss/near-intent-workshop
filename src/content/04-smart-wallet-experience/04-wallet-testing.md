# Testing Your Smart Wallet Implementation

**Time**: 20 minutes  
**Pre-requisite**: Understanding of the session-based wallet and action abstractions from previous sections

## Why Testing Smart Wallet Systems Is Different

Testing smart wallet implementations requires a unique approach compared to standard smart contract testing. While traditional blockchain testing focuses on contract logic, smart wallet testing must address:

1. **Client-side Security**: Session keys are managed in the user's browser
2. **Authorization Flows**: Key generation, registration, and management
3. **User Experience**: Form validation, error handling, and state management
4. **Integration with Blockchain**: Communication between UI and on-chain components

> 💡 **Web2 Parallel**: This is similar to testing an OAuth implementation in a Web2 app, where you need to verify both token management on the client side and proper access control when using those tokens.

## Testing Session Key Management

### Unit Testing the SessionKeyManager

Let's start by testing our key management implementation:

```javascript
// test/sessionKeyManager.test.js
import { SessionKeyManager } from "../src/wallet/sessionKeyManager";
import * as CryptoJS from "crypto-js";

describe("SessionKeyManager", () => {
  let keyManager;
  const mockPassword = "testPassword123";
  const mockAccountId = "test.near";

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    keyManager = new SessionKeyManager();
  });

  test("should generate a unique session key", () => {
    const sessionKey = keyManager.generateSessionKey(
      mockAccountId,
      "verifier.testnet",
      ["verify_intent", "verify_and_solve"]
    );

    // Verify structure and content
    expect(sessionKey).toHaveProperty("id");
    expect(sessionKey).toHaveProperty("accountId", mockAccountId);
    expect(sessionKey).toHaveProperty("privateKey");
    expect(sessionKey).toHaveProperty("publicKey");
    expect(sessionKey.methodNames).toContain("verify_intent");
    expect(sessionKey.expires).toBeGreaterThan(Date.now());
  });

  test("should store and retrieve session key", () => {
    const sessionKey = keyManager.generateSessionKey(
      mockAccountId,
      "verifier.testnet",
      ["verify_intent"]
    );

    // Store the key
    const storeResult = keyManager.storeSessionKey(sessionKey, mockPassword);
    expect(storeResult).toBe(true);

    // Retrieve the key
    const retrievedKey = keyManager.getSessionKey(mockAccountId, mockPassword);
    expect(retrievedKey).toEqual(sessionKey);
  });

  test("should handle incorrect password", () => {
    const sessionKey = keyManager.generateSessionKey(
      mockAccountId,
      "verifier.testnet",
      []
    );
    keyManager.storeSessionKey(sessionKey, mockPassword);

    const retrievedKey = keyManager.getSessionKey(
      mockAccountId,
      "wrongPassword"
    );
    expect(retrievedKey).toBeNull();
  });

  test("should remove session key", () => {
    const sessionKey = keyManager.generateSessionKey(
      mockAccountId,
      "verifier.testnet",
      []
    );
    keyManager.storeSessionKey(sessionKey, mockPassword);

    // Remove the key
    keyManager.removeSessionKey(mockAccountId);

    // Try to retrieve after removal
    const retrievedKey = keyManager.getSessionKey(mockAccountId, mockPassword);
    expect(retrievedKey).toBeNull();
  });

  test("should recognize expired keys", () => {
    // Create a key that's already expired
    const expiredKey = keyManager.generateSessionKey(
      mockAccountId,
      "verifier.testnet",
      []
    );
    expiredKey.expires = Date.now() - 1000; // Set to past time

    keyManager.storeSessionKey(expiredKey, mockPassword);

    // Should return null for expired keys
    const retrievedKey = keyManager.getSessionKey(mockAccountId, mockPassword);
    expect(retrievedKey).toBeNull();
  });
});
```

### Mocking NEAR API for Key Testing

For testing key authorization flows, we need to mock the NEAR API:

```javascript
// test/keyAuthorization.test.js
import { mockNearConnection, mockWalletConnection } from "./mocks/nearApi";
import { authorizeNewSessionKey } from "../src/wallet/keyAuthorization";

// Mock the NEAR API for testing
jest.mock("near-api-js", () => ({
  connect: jest.fn(() => mockNearConnection),
  WalletConnection: jest.fn(() => mockWalletConnection),
}));

describe("Key Authorization", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should request adding a new session key", async () => {
    const result = await authorizeNewSessionKey(
      "test.near",
      "verifier.testnet",
      ["verify_intent"]
    );

    // Verify that requestAddKey was called with correct parameters
    expect(mockWalletConnection.requestAddKey).toHaveBeenCalledTimes(1);
    const callArgs = mockWalletConnection.requestAddKey.mock.calls[0];

    // The first arg should be the public key
    expect(callArgs[0]).toMatch(/^ed25519:/);

    // The second arg should contain the function call access key actions
    const actions = callArgs[1];
    expect(actions[0].methodNames).toContain("verify_intent");
    expect(actions[0].contractId).toBe("verifier.testnet");
    expect(actions[0].allowance).toBeDefined();

    // Should return the generated session key
    expect(result).toHaveProperty("publicKey");
    expect(result).toHaveProperty("privateKey");
  });

  test("should handle authorization errors", async () => {
    // Simulate requestAddKey failure
    mockWalletConnection.requestAddKey.mockRejectedValueOnce(
      new Error("User rejected the request")
    );

    await expect(
      authorizeNewSessionKey("test.near", "verifier.testnet", [])
    ).rejects.toThrow("User rejected the request");
  });
});
```

## Testing Intent Service with Session Keys

Next, let's test our `IntentService` which uses session keys to submit intents:

```javascript
// test/intentService.test.js
import { IntentService } from "../src/wallet/intentService";
import { mockSessionConnection } from "./mocks/sessionConnection";

// Mock the session connection creation
jest.mock("../src/wallet/sessionWallet", () => ({
  createSessionConnection: jest.fn(() =>
    Promise.resolve(mockSessionConnection)
  ),
}));

describe("IntentService", () => {
  let intentService;

  beforeEach(() => {
    intentService = new IntentService("testnet");
    // Reset mock function call history
    mockSessionConnection.functionCall.mockClear();
  });

  test("should initialize with session key", async () => {
    await intentService.initialize("test.near", "mock:privateKey");

    // Should have valid intentBuilder and sessionConnection
    expect(intentService.intentBuilder).toBeDefined();
    expect(intentService.sessionConnection).toBe(mockSessionConnection);
  });

  test("should submit swap intent using session key", async () => {
    // Setup successful function call mock
    mockSessionConnection.functionCall.mockResolvedValueOnce({
      transaction: { hash: "test-tx-hash" },
    });

    // Initialize and submit a swap
    await intentService.initialize("test.near", "mock:privateKey");
    const result = await intentService.swap({
      inputToken: "USDC",
      inputAmount: 100,
      outputToken: "NEAR",
      maxSlippage: 0.5,
    });

    // Verify the functionCall was made with correct args
    expect(mockSessionConnection.functionCall).toHaveBeenCalledTimes(1);
    const callArgs = mockSessionConnection.functionCall.mock.calls[0][0];

    expect(callArgs.contractId).toBe("verifier.testnet");
    expect(callArgs.methodName).toBe("verify_intent");
    expect(callArgs.args.intent.action).toBe("swap");
    expect(callArgs.args.intent.input_token).toBe("USDC");
    expect(callArgs.args.intent.output_token).toBe("NEAR");

    // Verify result
    expect(result.success).toBe(true);
    expect(result.transactionHash).toBe("test-tx-hash");
  });

  test("should handle submission errors", async () => {
    // Setup error mock
    mockSessionConnection.functionCall.mockRejectedValueOnce(
      new Error("Exceeded the allowance")
    );

    await intentService.initialize("test.near", "mock:privateKey");
    const result = await intentService.swap({
      inputToken: "USDC",
      inputAmount: 100,
      outputToken: "NEAR",
    });

    // Verify error handling
    expect(result.success).toBe(false);
    expect(result.error).toContain("Exceeded the allowance");
  });

  test("should validate intents before submission", async () => {
    await intentService.initialize("test.near", "mock:privateKey");

    // Test an invalid intent (same input/output token)
    const result = await intentService.swap({
      inputToken: "NEAR",
      inputAmount: 100,
      outputToken: "NEAR", // Same as input token, should fail validation
    });

    // Verify validation failure
    expect(result.success).toBe(false);
    expect(result.error).toContain("Input and output tokens must be different");

    // Function call should never be made for invalid intents
    expect(mockSessionConnection.functionCall).not.toHaveBeenCalled();
  });
});
```

## Testing React Components

Testing the UI components of our smart wallet is crucial for ensuring a good user experience:

```javascript
// test/swapForm.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SwapForm from "../src/components/SwapForm";
import { IntentService } from "../src/wallet/intentService";

// Mock the IntentService
jest.mock("../src/wallet/intentService");

describe("SwapForm Component", () => {
  const mockAccountId = "test.near";
  const mockSessionKey = { privateKey: "mock:privateKey" };
  let mockIntentService;

  beforeEach(() => {
    // Create a fresh mock for each test
    mockIntentService = {
      initialize: jest.fn(() => Promise.resolve(mockIntentService)),
      swap: jest.fn(),
    };

    // Setup the mock constructor
    IntentService.mockImplementation(() => mockIntentService);
  });

  test("should render the form correctly", () => {
    render(<SwapForm accountId={mockAccountId} sessionKey={mockSessionKey} />);

    // Check that form elements are present
    expect(screen.getByText("Swap Tokens")).toBeInTheDocument();
    expect(screen.getByLabelText(/Amount to Swap/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/From Token/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/To Token/i)).toBeInTheDocument();
    expect(screen.getByText(/Max Slippage/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Swap Tokens/i })
    ).toBeInTheDocument();
  });

  test("should initialize intent service with session key", async () => {
    render(<SwapForm accountId={mockAccountId} sessionKey={mockSessionKey} />);

    // Verify service initialization
    await waitFor(() => {
      expect(mockIntentService.initialize).toHaveBeenCalledWith(
        mockAccountId,
        mockSessionKey.privateKey
      );
    });
  });

  test("should handle form submission", async () => {
    // Setup successful swap response
    mockIntentService.swap.mockResolvedValueOnce({
      success: true,
      transactionHash: "test-tx-hash",
    });

    render(<SwapForm accountId={mockAccountId} sessionKey={mockSessionKey} />);

    // Fill the form
    fireEvent.change(screen.getByLabelText(/Amount to Swap/i), {
      target: { value: "100" },
    });
    fireEvent.change(screen.getByLabelText(/From Token/i), {
      target: { value: "USDC" },
    });
    fireEvent.change(screen.getByLabelText(/To Token/i), {
      target: { value: "NEAR" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /Swap Tokens/i }));

    // Check that status message appears after submission
    await waitFor(() => {
      expect(
        screen.getByText(/Transaction: test-tx-hash/i)
      ).toBeInTheDocument();
    });

    // Verify correct parameters were used
    expect(mockIntentService.swap).toHaveBeenCalledWith({
      inputToken: "USDC",
      inputAmount: 100,
      outputToken: "NEAR",
      maxSlippage: 0.5,
    });
  });

  test("should display error messages", async () => {
    // Setup error response
    mockIntentService.swap.mockResolvedValueOnce({
      success: false,
      error: "Insufficient funds",
    });

    render(<SwapForm accountId={mockAccountId} sessionKey={mockSessionKey} />);

    // Fill and submit
    fireEvent.change(screen.getByLabelText(/Amount to Swap/i), {
      target: { value: "100" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Swap Tokens/i }));

    // Check for error message
    await waitFor(() => {
      expect(
        screen.getByText(/Error: Insufficient funds/i)
      ).toBeInTheDocument();
    });
  });
});
```

## Integration Testing the Full Wallet Flow

For integration testing, we want to verify the entire user flow from connection to intent execution:

```javascript
// test/walletIntegration.test.js
describe("Wallet Integration Tests", () => {
  test("complete wallet flow from connection to intent execution", async () => {
    // These tests typically require more setup with:
    // 1. Test NEAR account with testnet tokens
    // 2. Deployed verifier and solver contracts for testnet
    // 3. Actual near-api-js connection (not mocked)

    // Step 1: Connect to the wallet
    // Step 2: Generate and authorize a session key
    // Step 3: Create and submit an intent using the session key
    // Step 4: Verify the intent was properly executed on-chain

    // Here's a conceptual implementation - this would need actual testnet interaction

    // 1. Connect to NEAR and create wallet connection
    const near = await connect(config);
    const wallet = new WalletConnection(near);

    if (!wallet.isSignedIn()) {
      await wallet.requestSignIn();
    }

    const accountId = wallet.getAccountId();

    // 2. Set up session key management
    const keyManager = new SessionKeyManager();
    const sessionKey = keyManager.generateSessionKey(
      accountId,
      "verifier.testnet",
      ["verify_intent"]
    );

    // Request session key authorization
    await authorizeSessionKey(accountId, sessionKey.publicKey, keyActions);

    // For this test, we'll use a hardcoded password for demonstration.
    // IMPORTANT FOR REAL AUTOMATED TESTS: Passwords or sensitive parts of key files
    // should NOT be hardcoded. They should be injected via secure environment variables
    // or a secure CI/CD credential store, especially when running against a live testnet.
    await keyManager.storeSessionKey(sessionKey, "testpassword123");

    // Retrieve and decrypt the key
    const retrievedKey = keyManager.getSessionKey(accountId, "testpassword123");
    expect(retrievedKey).toEqual(sessionKey);

    // 3. Create intent service and submit an intent
    const intentService = new IntentService();
    await intentService.initialize(accountId, sessionKey.privateKey);

    const swapResult = await intentService.swap({
      inputToken: "USDC",
      inputAmount: 1,
      outputToken: "NEAR",
    });

    expect(swapResult.success).toBe(true);

    // 4. Verify on-chain status
    // Use separate account instance to query verifier contract
    const account = await near.account(accountId);
    const verifierContract = new Contract(account, "verifier.testnet", {
      viewMethods: ["is_intent_verified"],
      changeMethods: [],
    });

    const isVerified = await verifierContract.is_intent_verified({
      intent_id: swapResult.intent.id,
    });

    expect(isVerified).toBe(true);
  });
});
```

## Security Testing for Wallet Implementations

Security is paramount for wallet implementations. Here are critical areas to test:

### 1. Key Storage Security Testing

```javascript
// test/security.test.js
describe("Security Tests", () => {
  test("session keys should not be exposed in local storage unencrypted", () => {
    const keyManager = new SessionKeyManager();
    const sessionKey = keyManager.generateSessionKey(
      "test.near",
      "contract",
      []
    );
    keyManager.storeSessionKey(sessionKey, "password");

    // Get raw localStorage data
    const storedData = localStorage.getItem("near_session_key_test.near");

    // Verify it's encrypted (should not contain the plaintext private key)
    expect(storedData).not.toContain(sessionKey.privateKey);

    // Should be able to decrypt with password
    const decrypted = CryptoJS.AES.decrypt(storedData, "password").toString(
      CryptoJS.enc.Utf8
    );

    // Verify decryption works
    expect(JSON.parse(decrypted).privateKey).toBe(sessionKey.privateKey);
  });

  test("session key allowance should be enforced", async () => {
    // This would be a testnet test with a real account
    // Test that a session key with limited allowance cannot make
    // transactions that exceed that allowance
  });

  test("session key method restrictions should be enforced", async () => {
    // Test that a session key authorized only for 'verify_intent'
    // cannot call other methods like 'delete_account' or 'transfer'
  });
});
```

### 2. XSS Protection Testing

For Web applications, Cross-Site Scripting (XSS) is a major concern:

```javascript
// Security practices to test (conceptual)
describe("XSS Protection", () => {
  test("should sanitize user inputs", () => {
    // Test input sanitization in UI components
  });

  test("should implement Content Security Policy", () => {
    // Verify CSP headers are properly set
  });

  test("should implement iframe protection", () => {
    // Test X-Frame-Options headers
  });
});
```

## Performance Testing

Finally, test the performance of your wallet implementation for a better user experience:

```javascript
// test/performance.test.js
describe("Performance Tests", () => {
  test("key generation should be fast", () => {
    const keyManager = new SessionKeyManager();

    const startTime = performance.now();
    keyManager.generateSessionKey("test.near", "verifier.testnet", [
      "verify_intent",
    ]);
    const endTime = performance.now();

    // Key generation should be under 100ms for good UX
    expect(endTime - startTime).toBeLessThan(100);
  });

  test("intent creation and validation should be fast", async () => {
    const intentService = new IntentService();
    await intentService.initialize("test.near", "mock:privateKey");

    const startTime = performance.now();

    // Create a test intent
    const intent = intentService.intentBuilder.createSwapIntent(
      "USDC",
      100,
      "NEAR",
      { maxSlippage: 0.5 }
    );

    // Validate it
    intentService.validateIntent(intent);

    const endTime = performance.now();

    // Should be less than 50ms for good UX
    expect(endTime - startTime).toBeLessThan(50);
  });
});
```

## Summary: A Comprehensive Testing Strategy

A complete testing strategy for your smart wallet implementation should include:

1. **Unit Testing**: Individual components like `SessionKeyManager` and `IntentBuilder`
2. **Integration Testing**: Communication between components and contracts
3. **UI Testing**: Form validation, error handling, and user flow
4. **Security Testing**: Key storage, permission enforcement, and protection against attacks
5. **Performance Testing**: Ensuring a smooth user experience

By implementing these tests, you can build a reliable, secure smart wallet experience that will give users confidence in your dApp.

In the next module, we'll integrate our smart wallet with a complete frontend application to create a fully functional intent-based dApp.
