
// This file imports all markdown content to ensure it's bundled with the app
import welcome from './welcome.md?raw';
import overview from './overview.md?raw';
import setup from './setup.md?raw';
import repo from './repo.md?raw';
import intentsConceptMd from './intents-concept.md?raw';
import intentAnatomyMd from './intent-anatomy.md?raw';
import smartWalletMd from './smart-wallet.md?raw';
import crossChainMd from './cross-chain.md?raw';
import understandingBuildingBlocksMd from './understanding_building_blocks.md?raw';
import localContractMd from './local-contract.md?raw';
import intentVerifierMd from './intent-verifier.md?raw';
import solverContractMd from './solver-contract.md?raw';
import deployToTestnetMd from './deploy-to-testnet.md?raw';
import testingMd from './testing.md?raw';
import gasFeesMd from './gas-fees.md?raw';
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
import advancedUseCasesMd from './advanced-use-cases.md?raw';
import crossChainUseCasesMd from './cross-chain-use-cases.md?raw';
import productionMd from './production.md?raw';
import futureMd from './future.md?raw';
import resourcesMd from './resources.md?raw';
import whatsNextMd from './whats-next.md?raw';
import wrapUpMd from './wrap-up.md?raw';
import workshopStructure from './workshop-structure.md?raw';

const contentMap = {
  'welcome.md': welcome,
  'overview.md': overview,
  'setup.md': setup,
  'repo.md': repo,
  'intents-concept.md': intentsConceptMd,
  'intent-anatomy.md': intentAnatomyMd,
  'smart-wallet.md': smartWalletMd,
  'cross-chain.md': crossChainMd,
  'understanding_building_blocks.md': understandingBuildingBlocksMd,
  'local-contract.md': localContractMd,
  'intent-verifier.md': intentVerifierMd,
  'solver-contract.md': solverContractMd,
  'deploy-to-testnet.md': deployToTestnetMd,
  'testing.md': testingMd,
  'gas-fees.md': gasFeesMd,
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
  'advanced-use-cases.md': advancedUseCasesMd,
  'cross-chain-use-cases.md': crossChainUseCasesMd,
  'production.md': productionMd,
  'future.md': futureMd,
  'resources.md': resourcesMd,
  'whats-next.md': whatsNextMd,
  'wrap-up.md': wrapUpMd,
  'workshop-structure.md': workshopStructure
};

export default contentMap;
