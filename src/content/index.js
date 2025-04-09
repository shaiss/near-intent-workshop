
// This file imports all markdown content to ensure it's bundled with the app
import welcome from './welcome.md?raw';
import overview from './overview.md?raw';
import setup from './setup.md?raw';
import repo from './repo.md?raw';
import intentsConceptMd from './intents-concept.md?raw';
import intentAnatomyMd from './intent-anatomy.md?raw';
import smartWalletMd from './smart-wallet.md?raw';
import crossChainMd from './cross-chain.md?raw';
import localContractMd from './local-contract.md?raw';
import intentVerifierMd from './intent-verifier.md?raw';
import solverContractMd from './solver-contract.md?raw';
import testingMd from './testing.md?raw';
import gasFeesMd from './gas-fees.md?raw';
import walletSelectorMd from './wallet-selector.md?raw';
import sessionWalletMd from './session-wallet.md?raw';
import keysMd from './keys.md?raw';
import actionAbstractionMd from './action-abstraction.md?raw';
import frontendSetupMd from './frontend-setup.md?raw';
import connectWalletMd from './connect-wallet.md?raw';
import submitIntentsMd from './submit-intents.md?raw';
import solverOptionsMd from './solver-options.md?raw';
import executeIntentMd from './execute-intent.md?raw';
import testnetDeployMd from './testnet-deploy.md?raw';
import nearCliMd from './near-cli.md?raw';
import debugIntentsMd from './debug-intents.md?raw';
import simulateSolversMd from './simulate-solvers.md?raw';
import composabilityMd from './composability.md?raw';
import crossChainUseCasesMd from './cross-chain-use-cases.md?raw';
import productionMd from './production.md?raw';
import futureMd from './future.md?raw';
import workshopStructure from './workshop-structure.md?raw';

// Create a mapping of all content files
const contentMap = {
  'welcome.md': welcome,
  'overview.md': overview,
  'setup.md': setup,
  'repo.md': repo,
  'intents-concept.md': intentsConceptMd,
  'intent-anatomy.md': intentAnatomyMd,
  'smart-wallet.md': smartWalletMd,
  'cross-chain.md': crossChainMd,
  'local-contract.md': localContractMd,
  'intent-verifier.md': intentVerifierMd,
  'solver-contract.md': solverContractMd,
  'testing.md': testingMd,
  'gas-fees.md': gasFeesMd,
  'wallet-selector.md': walletSelectorMd,
  'session-wallet.md': sessionWalletMd,
  'keys.md': keysMd,
  'action-abstraction.md': actionAbstractionMd,
  'frontend-setup.md': frontendSetupMd,
  'connect-wallet.md': connectWalletMd,
  'submit-intents.md': submitIntentsMd,
  'solver-options.md': solverOptionsMd,
  'execute-intent.md': executeIntentMd,
  'testnet-deploy.md': testnetDeployMd,
  'near-cli.md': nearCliMd,
  'debug-intents.md': debugIntentsMd,
  'simulate-solvers.md': simulateSolversMd,
  'composability.md': composabilityMd,
  'cross-chain-use-cases.md': crossChainUseCasesMd,
  'production.md': productionMd,
  'future.md': futureMd,
  'workshop-structure.md': workshopStructure
};

export default contentMap;
