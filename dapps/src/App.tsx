import { abbreviateAddress, useConnection } from "@evefrontier/dapp-kit";
import { useCurrentAccount } from "@mysten/dapp-kit-react";
import { BeaconDashboard } from "./BeaconDashboard";

function App() {
  const { handleConnect, handleDisconnect } = useConnection();
  const account = useCurrentAccount();

  return (
    <div>
      <header className="app-header">
        <div>
          <div className="header-logo">
            <span>◈</span> BEACON PROTOCOL
          </div>
          <div className="header-sub">EVE Frontier · Rescue Network</div>
        </div>
        <button
          className={`connect-btn ${account ? "connected" : "disconnected"}`}
          onClick={() => account?.address ? handleDisconnect() : handleConnect()}
        >
          {account ? `✓ ${abbreviateAddress(account.address)}` : "Connect Wallet"}
        </button>
      </header>

      <main className="main-content">
        <BeaconDashboard walletAddress={account?.address} />
      </main>
    </div>
  );
}

export default App;
