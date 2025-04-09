
# Composability

## Building Composable Intent-Based Systems

Composability is a key advantage of intent-based architecture. This section explores how to design and implement composable intent systems.

## Understanding Composability in Intents

Composability allows intents to be combined and nested to create more complex user actions while maintaining flexibility in execution.

### Benefits of Composable Intents

1. **Reduced complexity** for users by abstracting multi-step processes
2. **Execution optimization** by solvers for better efficiency
3. **Reusability** of intent patterns across different contexts
4. **Adaptability** to changing conditions during execution

## Intent Composition Patterns

### Sequential Composition

Execute multiple intents in sequence, where the output of one becomes the input for the next:

```javascript
// Define a composite intent that executes sequentially
const compositeIntent = {
  type: 'composite',
  mode: 'sequential',
  description: 'Swap and stake tokens',
  intents: [
    {
      type: 'swap',
      params: {
        tokenIn: 'NEAR',
        tokenOut: 'AURORA',
        amountIn: '10',
        minAmountOut: '45'
      }
    },
    {
      type: 'stake',
      params: {
        token: 'AURORA',
        amount: 'OUTPUT_FROM_PREVIOUS', // Reference previous output
        poolId: 'aurora.pool.near'
      }
    }
  ]
};
```

### Parallel Composition

Execute multiple intents concurrently:

```javascript
// Define a composite intent that executes in parallel
const parallelIntent = {
  type: 'composite',
  mode: 'parallel',
  description: 'Vote on multiple proposals',
  intents: [
    {
      type: 'vote',
      params: {
        proposalId: '1',
        vote: 'yes'
      }
    },
    {
      type: 'vote',
      params: {
        proposalId: '2',
        vote: 'no'
      }
    },
    {
      type: 'vote',
      params: {
        proposalId: '3',
        vote: 'yes'
      }
    }
  ]
};
```

### Conditional Composition

Execute different intents based on conditions:

```javascript
// Define a composite intent with conditional execution
const conditionalIntent = {
  type: 'composite',
  mode: 'conditional',
  description: 'Swap tokens if price is favorable',
  conditions: [
    {
      condition: {
        type: 'price_check',
        params: {
          tokenA: 'NEAR',
          tokenB: 'AURORA',
          minRate: '4.5'
        }
      },
      if_true: {
        type: 'swap',
        params: {
          tokenIn: 'NEAR',
          tokenOut: 'AURORA',
          amountIn: '10',
          minAmountOut: '45'
        }
      },
      if_false: {
        type: 'notification',
        params: {
          message: 'Swap canceled due to unfavorable price'
        }
      }
    }
  ]
};
```

## Implementing Composable Intents

### Composite Intent Verifier

```rust
#[near_bindgen]
impl VerifierContract {
    pub fn verify_composite_intent(&self, intent: &CompositeIntent) -> bool {
        match intent.mode {
            CompositionMode::Sequential => self.verify_sequential_intent(intent),
            CompositionMode::Parallel => self.verify_parallel_intent(intent),
            CompositionMode::Conditional => self.verify_conditional_intent(intent),
        }
    }
    
    fn verify_sequential_intent(&self, intent: &CompositeIntent) -> bool {
        // Verify each sub-intent
        for sub_intent in &intent.intents {
            if !self.verify_intent(sub_intent) {
                return false;
            }
        }
        
        // Verify that output references are valid
        for (i, sub_intent) in intent.intents.iter().enumerate().skip(1) {
            if has_invalid_output_references(sub_intent, i) {
                return false;
            }
        }
        
        true
    }
    
    fn verify_parallel_intent(&self, intent: &CompositeIntent) -> bool {
        // Ensure no interdependencies between parallel intents
        for sub_intent in &intent.intents {
            if has_output_references(sub_intent) {
                return false;
            }
            
            if !self.verify_intent(sub_intent) {
                return false;
            }
        }
        
        true
    }
    
    fn verify_conditional_intent(&self, intent: &CompositeIntent) -> bool {
        for condition in &intent.conditions {
            // Verify the condition itself is valid
            if !self.verify_intent(&condition.condition) {
                return false;
            }
            
            // Verify both branches
            if !self.verify_intent(&condition.if_true) {
                return false;
            }
            
            if let Some(if_false) = &condition.if_false {
                if !self.verify_intent(if_false) {
                    return false;
                }
            }
        }
        
        true
    }
}
```

### Composite Intent Solver

```rust
#[near_bindgen]
impl SolverContract {
    pub fn execute_composite_intent(&mut self, intent_id: IntentId) -> Promise {
        let intent = self.get_intent_from_verifier(intent_id);
        
        match intent.mode {
            CompositionMode::Sequential => self.execute_sequential_intent(intent),
            CompositionMode::Parallel => self.execute_parallel_intent(intent),
            CompositionMode::Conditional => self.execute_conditional_intent(intent),
        }
    }
    
    fn execute_sequential_intent(&mut self, intent: CompositeIntent) -> Promise {
        let mut promise = Promise::new(env::current_account_id());
        let mut results = Vec::new();
        
        for (i, sub_intent) in intent.intents.iter().enumerate() {
            let resolved_intent = self.resolve_output_references(sub_intent, &results);
            
            promise = promise.then(
                Self::ext(env::current_account_id())
                    .with_static_gas(GAS_FOR_INTENT_EXECUTION)
                    .execute_single_intent(resolved_intent, i as u64)
            );
        }
        
        promise
    }
    
    fn execute_parallel_intent(&mut self, intent: CompositeIntent) -> Promise {
        let mut promise = Promise::new(env::current_account_id());
        
        for (i, sub_intent) in intent.intents.iter().enumerate() {
            promise = promise.then(
                Self::ext(env::current_account_id())
                    .with_static_gas(GAS_FOR_INTENT_EXECUTION)
                    .execute_single_intent(sub_intent.clone(), i as u64)
            );
        }
        
        promise
    }
    
    fn execute_conditional_intent(&mut self, intent: CompositeIntent) -> Promise {
        let mut promise = Promise::new(env::current_account_id());
        
        for (i, condition) in intent.conditions.iter().enumerate() {
            promise = promise.then(
                Self::ext(env::current_account_id())
                    .with_static_gas(GAS_FOR_CONDITION_EVALUATION)
                    .evaluate_condition(condition.clone(), i as u64)
            );
        }
        
        promise
    }
    
    #[private]
    pub fn evaluate_condition(&mut self, condition: IntentCondition, index: u64) -> Promise {
        // Evaluate the condition and execute appropriate branch
        let condition_result = self.execute_intent(condition.condition);
        
        if condition_result.is_true() {
            Self::ext(env::current_account_id())
                .with_static_gas(GAS_FOR_INTENT_EXECUTION)
                .execute_single_intent(condition.if_true, index)
        } else if let Some(if_false) = condition.if_false {
            Self::ext(env::current_account_id())
                .with_static_gas(GAS_FOR_INTENT_EXECUTION)
                .execute_single_intent(if_false, index)
        } else {
            // No else branch, return success
            Self::ext(env::current_account_id())
                .with_static_gas(GAS_FOR_INTENT_EXECUTION)
                .record_skipped_branch(index)
        }
    }
    
    fn resolve_output_references(&self, intent: &Intent, previous_results: &[IntentResult]) -> Intent {
        // Resolve any references to previous intent outputs
        // Implementation depends on how output references are structured
    }
}
```

## Frontend Support for Composable Intents

### Composite Intent Builder

```jsx
// src/components/intent/CompositeIntentBuilder.jsx
import React, { useState } from 'react';
import { useIntent } from '../../hooks/useIntent';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { PlusCircle, Trash2, ArrowUpDown, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { TransferIntentForm } from './TransferIntentForm';
import { SwapIntentForm } from './SwapIntentForm';
import { StakeIntentForm } from './StakeIntentForm';

export function CompositeIntentBuilder() {
  const { createAndSubmitIntent, loading } = useIntent();
  const [mode, setMode] = useState('sequential');
  const [intents, setIntents] = useState([]);
  const [activeIntentIndex, setActiveIntentIndex] = useState(null);
  
  const addIntent = (type) => {
    const newIntent = {
      id: Date.now().toString(),
      type,
      params: {}
    };
    
    setIntents([...intents, newIntent]);
    setActiveIntentIndex(intents.length);
  };
  
  const removeIntent = (index) => {
    const newIntents = [...intents];
    newIntents.splice(index, 1);
    setIntents(newIntents);
    
    if (activeIntentIndex === index) {
      setActiveIntentIndex(null);
    } else if (activeIntentIndex > index) {
      setActiveIntentIndex(activeIntentIndex - 1);
    }
  };
  
  const updateIntent = (index, params) => {
    const newIntents = [...intents];
    newIntents[index] = {
      ...newIntents[index],
      params
    };
    setIntents(newIntents);
  };
  
  const moveIntent = (fromIndex, toIndex) => {
    const newIntents = [...intents];
    const [moved] = newIntents.splice(fromIndex, 1);
    newIntents.splice(toIndex, 0, moved);
    setIntents(newIntents);
    
    if (activeIntentIndex === fromIndex) {
      setActiveIntentIndex(toIndex);
    }
  };
  
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    moveIntent(
      result.source.index,
      result.destination.index
    );
  };
  
  const submitCompositeIntent = async () => {
    try {
      const result = await createAndSubmitIntent('composite', {
        mode,
        intents: intents.map(({ type, params }) => ({ type, params }))
      });
      
      // Handle success
      setIntents([]);
      setActiveIntentIndex(null);
      
      // Show success message
    } catch (error) {
      // Handle error
    }
  };
  
  const renderIntentForm = (intent, index) => {
    switch (intent.type) {
      case 'transfer':
        return (
          <TransferIntentForm
            initialValues={intent.params}
            onChange={(params) => updateIntent(index, params)}
            hideSubmit
          />
        );
      case 'swap':
        return (
          <SwapIntentForm
            initialValues={intent.params}
            onChange={(params) => updateIntent(index, params)}
            hideSubmit
          />
        );
      case 'stake':
        return (
          <StakeIntentForm
            initialValues={intent.params}
            onChange={(params) => updateIntent(index, params)}
            hideSubmit
          />
        );
      default:
        return <p>Unsupported intent type: {intent.type}</p>;
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Composite Intent Builder</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Composition Mode</label>
          <Select value={mode} onValueChange={setMode}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sequential">Sequential</SelectItem>
              <SelectItem value="parallel">Parallel</SelectItem>
              <SelectItem value="conditional">Conditional</SelectItem>
            </SelectContent>
          </Select>
          
          {mode === 'sequential' && (
            <p className="text-sm text-gray-500">
              Intents will execute in sequence, with each one depending on the success of the previous.
            </p>
          )}
          
          {mode === 'parallel' && (
            <p className="text-sm text-gray-500">
              Intents will execute in parallel, independent of each other.
            </p>
          )}
          
          {mode === 'conditional' && (
            <p className="text-sm text-gray-500">
              Intents will execute based on conditions that are evaluated at runtime.
            </p>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="w-full sm:w-64 space-y-4">
            <h3 className="font-medium">Intent Sequence</h3>
            
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="intents">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {intents.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        No intents added yet. Click the buttons below to add intents.
                      </p>
                    ) : (
                      intents.map((intent, index) => (
                        <Draggable
                          key={intent.id}
                          draggableId={intent.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`flex justify-between items-center p-3 rounded-md border ${
                                activeIntentIndex === index
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  {...provided.dragHandleProps}
                                  className="cursor-grab"
                                >
                                  <ArrowUpDown className="h-4 w-4 text-gray-500" />
                                </span>
                                <span>
                                  {index + 1}. {intent.type}
                                </span>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setActiveIntentIndex(index)}
                                >
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeIntent(index)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addIntent('transfer')}
                className="flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Transfer
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addIntent('swap')}
                className="flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Swap
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addIntent('stake')}
                className="flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Stake
              </Button>
            </div>
          </div>
          
          <div className="flex-1">
            {activeIntentIndex !== null && (
              <div>
                <h3 className="font-medium mb-4">
                  Configure {intents[activeIntentIndex].type} Intent
                </h3>
                {renderIntentForm(intents[activeIntentIndex], activeIntentIndex)}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            setIntents([]);
            setActiveIntentIndex(null);
          }}
        >
          Clear All
        </Button>
        <Button
          onClick={submitCompositeIntent}
          disabled={loading || intents.length === 0}
        >
          {loading ? 'Submitting...' : 'Submit Composite Intent'}
        </Button>
      </CardFooter>
    </Card>
  );
}
```

## Advanced Composability Patterns

### Dynamic Parameter Resolution

Allow intents to reference dynamic data sources:

```javascript
const dynamicIntent = {
  type: 'swap',
  params: {
    tokenIn: 'NEAR',
    tokenOut: 'AURORA',
    amountIn: '10',
    minAmountOut: {
      source: 'oracle',
      query: {
        action: 'getPriceWithSlippage',
        params: {
          base: 'NEAR',
          quote: 'AURORA',
          amount: '10',
          slippage: '0.5'
        }
      }
    }
  }
};
```

### Intent Templates

Create reusable intent templates that can be customized:

```javascript
// Define a template
const dollarCostAverageTemplate = {
  name: 'Dollar Cost Average',
  description: 'Automatically invest a fixed amount at regular intervals',
  parameters: [
    { id: 'tokenIn', type: 'token', required: true },
    { id: 'tokenOut', type: 'token', required: true },
    { id: 'amount', type: 'amount', required: true },
    { id: 'frequency', type: 'select', options: ['daily', 'weekly', 'monthly'], default: 'weekly' },
    { id: 'duration', type: 'number', description: 'Number of periods', default: 4 }
  ],
  generateIntent: (params) => {
    // Generate the actual intent based on template parameters
    return {
      type: 'recurring',
      params: {
        schedule: {
          frequency: params.frequency,
          count: params.duration
        },
        action: {
          type: 'swap',
          params: {
            tokenIn: params.tokenIn,
            tokenOut: params.tokenOut,
            amountIn: params.amount
          }
        }
      }
    };
  }
};
```

In the next section, we'll explore cross-chain use cases for intent-based architecture.
