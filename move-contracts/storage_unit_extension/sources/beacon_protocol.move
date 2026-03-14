/// Beacon Protocol — A rescue network for stranded players in EVE Frontier.
///
/// Any player can donate resources to a Beacon (Smart Storage Unit).
/// Stranded players can make emergency withdrawals from the shared pool.
/// Donors earn on-chain Reputation Points, building their rank in the civilization.
///
/// Reputation ranks:
///   Explorer       (0–9 points)
///   Helper         (10–99 points)
///   Guardian       (100–999 points)
///   Pillar of Civilization (1000+ points)
module storage_unit_extension::beacon_protocol;

use storage_unit_extension::config::{Self, AdminCap, BeaconAuth, ExtensionConfig};
use sui::table::{Self, Table};
use world::{character::Character, inventory::Item, storage_unit::{Self, StorageUnit}};

// === Errors ===
#[error(code = 0)]
const EWithdrawLimitExceeded: vector<u8> = b"Requested quantity exceeds the maximum allowed per visit";
#[error(code = 1)]
const ENoBeaconConfig: vector<u8> = b"This beacon has not been configured by its owner yet";

// === Structs ===

/// Shared object tracking reputation scores for all players across all beacons.
public struct BeaconState has key {
    id: UID,
    reputation: Table<address, u64>,
}

/// Configuration for a beacon — stored as a dynamic field on ExtensionConfig.
public struct BeaconConfig has drop, store {
    /// Max items a player can withdraw in a single emergency visit.
    max_withdraw_per_visit: u32,
    /// Reputation points awarded per donated item.
    rep_per_deposit: u64,
}

/// Dynamic field key for BeaconConfig.
public struct BeaconConfigKey has copy, drop, store {}

// === Init ===

fun init(ctx: &mut TxContext) {
    let state = BeaconState {
        id: object::new(ctx),
        reputation: table::new(ctx),
    };
    transfer::share_object(state);
}

// === Public Functions ===

/// Donate items to the beacon's open inventory.
/// The donor earns reputation points for their contribution.
public fun donate(
    storage_unit: &mut StorageUnit,
    extension_config: &ExtensionConfig,
    character: &Character,
    item: Item,
    state: &mut BeaconState,
    ctx: &mut TxContext,
) {
    assert!(extension_config.has_rule<BeaconConfigKey>(BeaconConfigKey {}), ENoBeaconConfig);
    let cfg = extension_config.borrow_rule<BeaconConfigKey, BeaconConfig>(BeaconConfigKey {});
    let rep_gain = cfg.rep_per_deposit;

    storage_unit::deposit_to_open_inventory<BeaconAuth>(
        storage_unit,
        character,
        item,
        config::beacon_auth(),
        ctx,
    );

    // Award reputation to donor
    let donor = ctx.sender();
    if (state.reputation.contains(donor)) {
        let score = state.reputation.borrow_mut(donor);
        *score = *score + rep_gain;
    } else {
        state.reputation.add(donor, rep_gain);
    };
}

/// Emergency withdrawal for a stranded player.
/// Limited by max_withdraw_per_visit set by the beacon owner.
public fun emergency_withdraw(
    storage_unit: &mut StorageUnit,
    extension_config: &ExtensionConfig,
    character: &Character,
    type_id: u64,
    quantity: u32,
    ctx: &mut TxContext,
): Item {
    assert!(extension_config.has_rule<BeaconConfigKey>(BeaconConfigKey {}), ENoBeaconConfig);
    let cfg = extension_config.borrow_rule<BeaconConfigKey, BeaconConfig>(BeaconConfigKey {});
    assert!(quantity <= cfg.max_withdraw_per_visit, EWithdrawLimitExceeded);

    storage_unit::withdraw_from_open_inventory<BeaconAuth>(
        storage_unit,
        character,
        config::beacon_auth(),
        type_id,
        quantity,
        ctx,
    )
}

// === View Functions ===

/// Returns the reputation score for a player (0 if none).
public fun get_reputation(state: &BeaconState, player: address): u64 {
    if (state.reputation.contains(player)) {
        *state.reputation.borrow(player)
    } else {
        0
    }
}

/// Returns the rank name based on reputation score.
public fun get_rank(state: &BeaconState, player: address): vector<u8> {
    let score = get_reputation(state, player);
    if (score >= 1000) {
        b"Pillar of Civilization"
    } else if (score >= 100) {
        b"Guardian"
    } else if (score >= 10) {
        b"Helper"
    } else {
        b"Explorer"
    }
}

// === Admin Functions ===

/// Configure the beacon: set withdrawal limit and reputation reward per donation.
/// Must be called by the beacon owner before players can use it.
public fun configure(
    extension_config: &mut ExtensionConfig,
    admin_cap: &AdminCap,
    max_withdraw_per_visit: u32,
    rep_per_deposit: u64,
) {
    config::set_rule(
        extension_config,
        admin_cap,
        BeaconConfigKey {},
        BeaconConfig { max_withdraw_per_visit, rep_per_deposit },
    );
}
