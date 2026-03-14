module storage_unit_extension::config;

use sui::dynamic_field as df;

public struct ExtensionConfig has key {
    id: UID,
}

public struct AdminCap has key, store {
    id: UID,
}

/// Witness type that authorizes our extension to call storage_unit functions.
/// Only this package can create a BeaconAuth instance.
public struct BeaconAuth has drop {}

fun init(ctx: &mut TxContext) {
    let admin_cap = AdminCap { id: object::new(ctx) };
    transfer::transfer(admin_cap, ctx.sender());

    let config = ExtensionConfig { id: object::new(ctx) };
    transfer::share_object(config);
}

// === Dynamic field helpers ===

public fun has_rule<K: copy + drop + store>(config: &ExtensionConfig, key: K): bool {
    df::exists_(&config.id, key)
}

public fun borrow_rule<K: copy + drop + store, V: store>(config: &ExtensionConfig, key: K): &V {
    df::borrow(&config.id, key)
}

/// Insert-or-overwrite a rule. Requires AdminCap.
public fun set_rule<K: copy + drop + store, V: store + drop>(
    config: &mut ExtensionConfig,
    _: &AdminCap,
    key: K,
    value: V,
) {
    if (df::exists_(&config.id, copy key)) {
        let _old: V = df::remove(&mut config.id, copy key);
    };
    df::add(&mut config.id, key, value);
}

/// Only callable within this package — prevents unauthorized use of the witness.
public(package) fun beacon_auth(): BeaconAuth {
    BeaconAuth {}
}
