import { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import { requireEnv } from "../utils/helper";
import { MODULE } from "./modules";

export type BeaconExtensionIds = {
    builderPackageId: string;
    adminCapId: string;
    extensionConfigId: string;
    beaconStateId: string;
};

export function requireBuilderPackageId(): string {
    return requireEnv("BUILDER_PACKAGE_ID");
}

export function resolveBeaconExtensionIdsFromEnv(): {
    builderPackageId: string;
    extensionConfigId: string;
    beaconStateId: string;
} {
    return {
        builderPackageId: requireBuilderPackageId(),
        extensionConfigId: requireEnv("EXTENSION_CONFIG_ID"),
        beaconStateId: requireEnv("BEACON_STATE_ID"),
    };
}

/**
 * Resolve beacon extension IDs (env + AdminCap for the given owner).
 */
export async function resolveBeaconExtensionIds(
    client: SuiJsonRpcClient,
    ownerAddress: string
): Promise<BeaconExtensionIds> {
    const { builderPackageId, extensionConfigId, beaconStateId } =
        resolveBeaconExtensionIdsFromEnv();

    const adminCapType = `${builderPackageId}::${MODULE.CONFIG}::AdminCap`;
    const result = await client.getOwnedObjects({
        owner: ownerAddress,
        filter: { StructType: adminCapType },
        limit: 1,
    });

    const adminCapId = result.data[0]?.data?.objectId;
    if (!adminCapId) {
        throw new Error(
            `AdminCap not found for ${ownerAddress}. ` +
                `Make sure this address published the storage_unit_extension package.`
        );
    }

    return { builderPackageId, adminCapId, extensionConfigId, beaconStateId };
}
