import "dotenv/config";
import { getEnvConfig, handleError, initializeContext } from "../utils/helper";
import { resolveBeaconExtensionIdsFromEnv } from "./extension-ids";
import { MODULE } from "./modules";

async function main() {
    console.log("============= Beacon Protocol Reputation Check ==============\n");

    try {
        const env = getEnvConfig();
        const ctx = initializeContext(env.network, env.adminExportedKey);
        const { client, keypair } = ctx;

        const { builderPackageId, beaconStateId } = resolveBeaconExtensionIdsFromEnv();
        const playerAddress = keypair.getPublicKey().toSuiAddress();

        // Read the BeaconState object directly
        const beaconState = await client.getObject({
            id: beaconStateId,
            options: { showContent: true },
        });

        console.log("BeaconState object:", JSON.stringify(beaconState.data?.content, null, 2));
        console.log("\nTo check reputation for a player, use the get_reputation view function.");
        console.log("Player address:", playerAddress);
        console.log("Builder package:", builderPackageId);
        console.log("BeaconState ID:", beaconStateId);
        console.log("\nModule:", MODULE.BEACON);
    } catch (error) {
        handleError(error);
    }
}

main();
