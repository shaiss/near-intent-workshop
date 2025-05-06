# Testing Mermaid Diagrams

This page demonstrates the ability to create diagrams using mermaid syntax.

## Intent Flow Diagram

```mermaid
flowchart TD
    A[User] -->|Creates Intent| B[Intent Object]
    B --> C{Intent Verifier}
    C -->|Valid| D[Solver Contract]
    C -->|Invalid| E[Reject]
    D --> F[Execute Transaction]
```

---

## Smart Wallet Architecture

```mermaid
flowchart TD
    A[Smart Wallet] -->|Controls| B[User Account]
    A -->|Manages| C[Session Keys]
    A -->|Signs| D[Intents]
    A -->|Abstracts| E[Cross-chain Actions]

    subgraph Security_Layer
        C
    end

    subgraph Interaction_Layer
        D
        E
    end
```

---

## Sequence Diagram Example

```mermaid
sequenceDiagram
    participant User
    participant Wallet
    participant Verifier
    participant Solver

    User->>Wallet: Sign Intent
    Wallet->>Verifier: Submit Intent
    Verifier->>Solver: Forward Valid Intent
    Solver->>User: Return Result
```

---

## Class Diagram Example

```mermaid
classDiagram
    class IntentVerifier {
        +verify(intent)
        +isValidFormat(intent)
        +getIntentHash(intent)
    }
    class Solver {
        +solve(intent)
        +calculateResult()
        +executeTransaction()
    }
    IntentVerifier --> Solver
```

---

## Advanced Intent Processing Flow

```mermaid
flowchart TD
    A[User Intent] --> B[Intent Parser]
    B --> C{Valid Syntax?}
    C -->|Yes| D[Metadata Extraction]
    C -->|No| E[Error Response]
    D --> F[Fee Estimation]
    F --> G{Sufficient Balance?}
    G -->|Yes| H[Simulation]
    G -->|No| I[Insufficient Funds Error]
    H --> J{Simulation Success?}
    J -->|Yes| K[Intent Queue]
    J -->|No| L[Simulation Error]
    K --> M[Parallel Processing]
    M --> N[Priority Solver]
    M --> O[Generic Solver]
    M --> P[Special Case Solver]
    N --> Q[Result Aggregation]
    O --> Q
    P --> Q
    Q --> R[Transaction Execution]
    R --> S[Receipt Generation]
    S --> T[User Notification]
```

---

## Multi-Chain Intent Timeline

```mermaid
gantt
    title Multi-Chain Intent Execution Timeline
    dateFormat  YYYY-MM-DD
    axisFormat %M:%S
    
    section Intent Creation
    User Signs Intent           :a1, 2023-01-01, 2s
    Intent Validation           :a2, after a1, 3s
    
    section NEAR Chain
    Parse Intent                :n1, after a2, 2s
    Execute on NEAR             :n2, after n1, 5s
    Verify Outcome              :n3, after n2, 2s
    
    section Aurora Chain
    Bridge Intent               :e1, after a2, 3s
    Execute on Aurora           :e2, after e1, 6s
    Verify Aurora Outcome       :e3, after e2, 2s
    
    section Result
    Aggregate Results           :r1, after n3, after e3, 3s
    Return to User              :r2, after r1, 1s
```

---

## Smart Contract Relationship Diagram

```mermaid
classDiagram
    class Account {
        +address: String
        +balance: BigInt
        +execute(action)
        +view(method)
    }
    
    class SmartWallet {
        -owner: Address
        -guardians: Address[]
        -recoveryDelay: Number
        +executeIntent(intent)
        +addGuardian(address)
        +removeGuardian(address)
        +initiateRecovery()
        +completeRecovery()
    }
    
    class IntentProcessor {
        -supportedIntents: Map
        -solvers: Array
        +validateIntent(intent)
        +routeIntent(intent)
        +executeIntent(intent)
    }
    
    class Solver {
        <<interface>>
        +canSolve(intent): Boolean
        +estimateFee(intent): BigInt
        +execute(intent): Result
    }
    
    class TokenSwapSolver {
        -supportedPairs: Array
        -liquiditySources: Array
        +findBestRoute()
        +estimateOutput()
    }
    
    class CrossChainSolver {
        -supportedChains: Array
        -bridges: Map
        +bridgeAsset()
        +verifyCompletion()
    }
    
    Account <|-- SmartWallet
    SmartWallet --> IntentProcessor
    IntentProcessor --> Solver
    Solver <|.. TokenSwapSolver
    Solver <|.. CrossChainSolver
```

---

## Detailed Intent Processing Sequence

```mermaid
sequenceDiagram
    actor User
    participant Wallet as Smart Wallet
    participant Verifier as Intent Verifier
    participant Router as Intent Router
    participant Simulator as Transaction Simulator
    participant Solver as Intent Solver
    participant Chain as Blockchain
    
    User->>+Wallet: Create & Sign Intent
    Wallet->>+Verifier: Submit Intent
    Verifier->>Verifier: Validate Structure
    Verifier->>Verifier: Verify Signature
    
    alt Valid Intent
        Verifier->>+Router: Route Intent
        Router->>Router: Identify Solver
        Router->>+Simulator: Simulate Execution
        
        alt Simulation Success
            Simulator->>-Router: Simulation Results
            Router->>+Solver: Forward Intent
            Solver->>Solver: Optimize Execution
            Solver->>+Chain: Submit Transaction
            Chain->>Chain: Process Transaction
            Chain->>-Solver: Transaction Receipt
            Solver->>-Router: Execution Success
            Router->>-Verifier: Execution Results
            Verifier->>-Wallet: Confirmation
            Wallet->>-User: Success Notification
        else Simulation Failure
            Simulator->>Router: Error Details
            Router->>Verifier: Simulation Failed
            Verifier->>Wallet: Error Report
            Wallet->>User: Failure Notification
        end
    else Invalid Intent
        Verifier->>Wallet: Reject Intent
        Wallet->>User: Error Report
    end
```

---

## Intent System Entity Relationship

```mermaid
erDiagram
    USER ||--o{ SMART_WALLET : owns
    USER ||--o{ INTENT : creates
    SMART_WALLET ||--|{ SESSION_KEY : manages
    SMART_WALLET ||--|{ GUARDIAN : protects
    SMART_WALLET ||--o{ INTENT : submits
    
    INTENT }|--|| INTENT_VERIFIER : validates
    INTENT }|--o{ SOLVER : processes
    INTENT ||--o{ TRANSACTION : generates
    
    SOLVER ||--|{ SOLVER_PLUGIN : extends
    SOLVER ||--o{ FEE_MODEL : uses
    
    TRANSACTION }|--|| RECEIPT : produces
    
    USER {
        string address
        string publicKey
        datetime createdAt
    }
    
    SMART_WALLET {
        string address
        string owner
        int version
        boolean recoveryMode
    }
    
    SESSION_KEY {
        string publicKey
        string permissions
        datetime expiresAt
    }
    
    GUARDIAN {
        string address
        int weight
        boolean canRecover
    }
    
    INTENT {
        string id
        string type
        string payload
        string signature
        datetime timestamp
        string status
    }
    
    INTENT_VERIFIER {
        string id
        array supportedTypes
        int minGas
    }
    
    SOLVER {
        string id
        array supportedIntents
        string reputation
    }
    
    SOLVER_PLUGIN {
        string id
        string type
        string version
    }
    
    FEE_MODEL {
        string id
        string type
        int baseFee
        float multiplier
    }
    
    TRANSACTION {
        string hash
        string sender
        string receiver
        bigint amount
        int gas
        string status
    }
    
    RECEIPT {
        string id
        string transactionHash
        string outcome
        array logs
    }
```

---

## Summary

The diagrams above demonstrate how we can visualize various aspects of NEAR's intent-centric architecture using mermaid diagrams directly in our markdown content.
