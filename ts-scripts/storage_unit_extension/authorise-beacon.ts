import "dotenv/config";
import { Transaction } from "@mysten/sui/transactions";
import { MODULES } from "../utils/config";
import { deriveObjectId } from "../utils/derive-object-id";
import { GAME_CHARACTER_ID, STORAGE_A_ITEM_ID } from "../utils/constants";
import {
    getEnvConfig,
    handleError,
    hydrateWorldConfig,
    initializeContext,
    requireEnv,
} from "../utils/helper";
import { requireBuilderPackageId } from "./extension-ids";
import { getOwnerCap as getStorageUnitOwnerCap } from "../helpers/storage-unit-extension";
import { MODULE } from "./modules";

async function main() {
    console.log("============= Authorise Beacon Protocol on Storage Unit ==============\n");

    try {
        const env = getEnvConfig();
        const playerKey = requireEnv("PLAYER_A_PRIVATE_KEY");
        const ctx = initializeContext(env.network, playerKey);
        await hydrateWorldConfig(ctx);
        const { client, keypair, address } = ctx;
        const config = ctx.config;

        const builderPackageId = requireBuilderPackageId();

        const characterId = deriveObjectId(
            config.objectRegistry,
            BigInt(GAME_CHARACTER_ID),
            config.packageId
        );
        const storageUnitId = deriveObjectId(
            config.objectRegistry,
            STORAGE_A_ITEM_ID,
            config.packageId
        );

        const storageUnitOwnerCapId = await getStorageUnitOwnerCap(
            storageUnitId,
            client,
            config,
            address
        );
        if (!storageUnitOwnerCapId) {
            throw new Error(`OwnerCap not found for storage unit ${storageUnitId}`);
        }

        // BeaconAuth is the witness type that authorizes our extension
        const authType = `${builderPackageId}::${MODULE.CONFIG}::BeaconAuth`;

        const tx = new Transaction();

        const [storageUnitOwnerCap, returnReceipt] = tx.moveCall({
            target: `${config.packageId}::${MODULES.CHARACTER}::borrow_owner_cap`,
            typeArguments: [`${config.packageId}::${MODULES.STORAGE_UNIT}::StorageUnit`],
            arguments: [tx.object(characterId), tx.object(storageUnitOwnerCapId)],
        });

        tx.moveCall({
            target: `${config.packageId}::${MODULES.STORAGE_UNIT}::authorize_extension`,
            typeArguments: [authType],
            arguments: [tx.object(storageUnitId), storageUnitOwnerCap],
        });

        tx.moveCall({
            target: `${config.packageId}::${MODULES.CHARACTER}::return_owner_cap`,
            typeArguments: [`${config.packageId}::${MODULES.STORAGE_UNIT}::StorageUnit`],
            arguments: [tx.object(characterId), storageUnitOwnerCap, returnReceipt],
        });

        const result = await client.signAndExecuteTransaction({
            transaction: tx,
            signer: keypair,
            options: { showEffects: true, showObjectChanges: true },
        });

        console.log("Beacon Protocol authorized on Storage Unit!");
        console.log("Storage Unit ID:", storageUnitId);
        console.log("Auth type:", authType);
        console.log("Transaction digest:", result.digest);
    } catch (error) {
        handleError(error);
    }
}

main();
