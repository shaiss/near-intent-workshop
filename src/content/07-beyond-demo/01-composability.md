# Composability in Intent Architecture

## What is Composability?

Composability in the context of intents refers to the ability to combine multiple intents into more complex operations while maintaining the declarative nature and flexibility of the intent model.

## Benefits of Composable Intents

- **Simplified complex workflows** - Multiple operations appear as one
- **Optimized execution** - Better paths across composed operations
- **Reduced transaction costs** - Batching and optimizing across steps
- **Enhanced developer experience** - Build with high-level components

## Common Composition Patterns

### Sequential Composition

Execute multiple intents in order, where the output of one becomes the input for the next:

```javascript
// Sequential composition for swap and stake
{
  "intent": {
    "action": "compose",
    "mode": "sequential",
    "steps": [
      {
        "action": "swap",
        "input": {
          "token": "USDC",
          "amount": "100"
        },
        "output": {
          "token": "NEAR"
        }
      },
      {
        "action": "stake",
        "input": {
          "token": "NEAR",
          "amount": "PREVIOUS_OUTPUT"
        }
      }
    ]
  }
}
```

### Parallel Composition

Execute multiple independent intents concurrently:

```javascript
// Parallel composition for multiple transfers
{
  "intent": {
    "action": "compose",
    "mode": "parallel",
    "steps": [
      {
        "action": "transfer",
        "recipient": "alice.near",
        "input": {
          "token": "NEAR",
          "amount": "1"
        }
      },
      {
        "action": "transfer",
        "recipient": "bob.near",
        "input": {
          "token": "USDC",
          "amount": "10"
        }
      }
    ]
  }
}
```

### Conditional Composition

Execute different intents based on runtime conditions:

```javascript
// Conditional composition based on price check
{
  "intent": {
    "action": "compose",
    "mode": "conditional",
    "condition": {
      "check": "price",
      "token": "NEAR",
      "reference": "USD",
      "operator": "greaterThan",
      "value": "5.00"
    },
    "if_true": {
      "action": "swap",
      "input": {
        "token": "NEAR",
        "amount": "10"
      },
      "output": {
        "token": "USDC"
      }
    },
    "if_false": {
      "action": "stake",
      "input": {
        "token": "NEAR",
        "amount": "10"
      }
    }
  }
}
```

## Building Composable Intent Systems

When implementing composable intents:

1. **Define clear boundaries** between component intents
2. **Establish data flow conventions** between steps
3. **Handle errors and rollbacks** across the composition
4. **Optimize for the complete flow**, not individual steps

## Example: DeFi Portfolio Rebalancing

A complex intent that automatically rebalances a portfolio:

```javascript
{
  "intent": {
    "action": "compose",
    "mode": "sequential",
    "steps": [
      {
        "action": "query_portfolio",
        "output": {
          "variable": "current_allocation"
        }
      },
      {
        "action": "compose",
        "mode": "conditional",
        "condition": {
          "check": "portfolio_balanced",
          "target": "{{current_allocation}}",
          "threshold": "5%"
        },
        "if_true": {
          "action": "no_op"
        },
        "if_false": {
          "action": "rebalance_portfolio",
          "input": {
            "current": "{{current_allocation}}",
            "target": {
              "NEAR": "40%",
              "USDC": "30%",
              "ETH": "30%"
            }
          }
        }
      }
    ]
  }
}
```

## User Interface Considerations

When designing UIs for composable intents:

- **Progressive disclosure** - Show complexity only when needed
- **Preview outcomes** - Help users understand what will happen
- **Clear step indication** - Show where in the process the user is
- **Failure handling** - Explain and recover from partial failures

In the next section, we'll explore how to build smart contracts that can verify and execute these composable intents.