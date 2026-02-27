# Railgun Shared Models — BSC Testnet Patch

The `@railgun-community/shared-models` package does not include a `NetworkName.BNBChainTestnet` entry (chain ID 97). There are two approaches to add BSC testnet support:

## Option A: Full Fork (Recommended for production)

Clone the upstream repo into this directory and patch `network-config.ts`:

```bash
git clone https://github.com/Railgun-Community/shared-models.git packages/shared-models
cd packages/shared-models
npm install && npm run build
```

Then add `BNBChainTestnet` to the `NetworkName` enum and all 10 `Record<NetworkName, ...>` mappings.
Reference the fork in `backend/package.json`:

```json
"@railgun-community/shared-models": "file:../packages/shared-models"
```

## Option B: Runtime Override (Used for hackathon — simpler)

Repurpose `NetworkName.Hardhat` by mutating its config at runtime before calling `loadProvider()`.
This is implemented in `backend/src/config/engine.ts`:

```typescript
const config = NETWORK_CONFIG[NetworkName.Hardhat];
config.chain.id = 97;
config.baseToken.wrappedAddress = process.env.RAILGUN_WBNB!;
config.proxyContract = process.env.RAILGUN_PROXY!;
config.relayAdaptContract = process.env.RAILGUN_RELAY_ADAPT!;
config.deploymentBlock = parseInt(process.env.DEPLOYMENT_BLOCK!);
```

Then use `NetworkName.Hardhat` everywhere in the codebase. Hacky, but avoids
type-compatibility issues between the wallet SDK and shared-models.

## Current Choice

This project uses **Option B** for hackathon speed. If you encounter SDK type errors
or need cleaner network isolation, switch to Option A.
