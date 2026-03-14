# Beacon Protocol

> On-chain rescue network for EVE Frontier. Donate supplies to emergency beacons, earn permanent reputation on Sui blockchain. Stranded pilots withdraw what they need. No admins, no servers — just contracts, players, and proof of who helped build civilization.

Built for the **EVE Frontier × Sui Hackathon 2026**.

---

## What it does

Beacon Protocol turns Smart Storage Units (SSUs) into community rescue beacons.

- **Donate** supplies → earn permanent reputation points on Sui
- **Withdraw** emergency items when stranded (up to 10 per visit)
- **Leaderboard** tracks top contributors with rank titles: Explorer → Helper → Guardian → Pillar of Civilization

All state lives on-chain. No central server, no admin control.

---

## How it works

The project has two parts:

### Smart Contracts (`move-contracts/storage_unit_extension`)

A Move extension for EVE Frontier SSUs with two core functions:

- `donate()` — deposit an item into the beacon, earn 5 REP
- `emergency_withdraw()` — withdraw up to the configured limit per visit

Reputation is stored in a shared `BeaconState` object as a `Table<address, u64>` on Sui.

### Web Dashboard (`dapps/`)

A React + Vite frontend that reads live on-chain state and displays:

- Network stats (active beacons, total helpers, your reputation)
- Active beacon list
- Reputation leaderboard

---

## Tech Stack

- **Smart contracts:** Move (Sui), EVE Frontier world-contracts
- **Frontend:** React, Vite, @evefrontier/dapp-kit
- **Chain:** Sui (localnet / Stillness)

---

## Project Structure

```
beacon-protocol/
├── move-contracts/
│   └── storage_unit_extension/
│       └── sources/
│           ├── beacon_protocol.move   # Core logic
│           └── config.move            # Auth + config
├── dapps/
│   └── src/
│       ├── App.tsx
│       ├── BeaconDashboard.tsx
│       └── Leaderboard.tsx
└── ts-scripts/
    └── storage_unit_extension/        # Deploy + configure scripts
```

---

## Reputation Ranks

| Score | Rank |
|-------|------|
| 0–9 | Explorer |
| 10–99 | Helper |
| 100–999 | Guardian |
| 1000+ | Pillar of Civilization |

---

## Hackathon Submission

**Event:** EVE Frontier × Sui Hackathon 2026
**Category:** Builder mod / Smart Assembly extension
**Submitted via:** deepsurge.xyz/evefrontier2026
