import "dotenv/config";
import { Transaction } from "@mysten/sui/transactions";
import { getEnvConfig, handleError, hydrateWorldConfig, initializeContext } from "../utils/helper";
import { resolveBeaconExtensionIds } from "./extension-ids";
import { MODULE } from "./modules";

// Configuration values
const MAX_WITHDRAW_PER_VISIT = 10;   // Max items a player can withdraw per visit
const REP_PER_DEPOSIT = 5;           // Reputation points earned per item donated

async function main() {
    console.log("============= Configure Beacon Protocol ==============\n");

    try {
        const env = getEnvConfig();
        const ctx = initializeContext(env.network, env.adminExportedKey);
        const { client, keypair, address } = ctx;
        await hydrateWorldConfig(ctx);

        const { builderPackageId, adminCapId, extensionConfigId } =
            await resolveBeaconExtensionIds(client, address);

        const tx = new Transaction();

        tx.moveCall({
            target: `${builderPackageId}::${MODULE.BEACON}::configure`,
            arguments: [
                tx.object(extensionConfigId),
                tx.object(adminCapId),
                tx.pure.u32(MAX_WITHDRAW_PER_VISIT),
                tx.pure.u64(REP_PER_DEPOSIT),
            ],
        });

        const result = await client.signAndExecuteTransaction({
            transaction: tx,
            signer: keypair,
            options: { showEffects: true },
        });

        console.log("Beacon configured!");
        console.log(`  Max withdraw per visit: ${MAX_WITHDRAW_PER_VISIT}`);
        console.log(`  Rep per deposit: ${REP_PER_DEPOSIT}`);
        console.log("Transaction digest:", result.digest);
    } catch (error) {
        handleError(error);
    }
}

main();
