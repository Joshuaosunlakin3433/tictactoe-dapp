"use client";

import { createNewGame, joinGame, Move, play } from "@/lib/contract";
import { getStxBalance } from "@/lib/stx-utils";
import {
  connect,
  disconnect,
  getLocalStorage,
  isConnected,
  request,
} from "@stacks/connect";
import { useEffect, useState } from "react";

// Helper to get user's STX address from userData
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getUserAddress(
  userData: any,
  network: "testnet" | "mainnet" = "testnet"
): string | null {
  if (!userData) return null;

  // New v8 API structure - addresses array contains network-specific addresses
  if (userData.addresses?.stx) {
    // Find the address for the requested network
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const addressEntry = userData.addresses.stx.find((entry: any) =>
      entry.address?.startsWith(network === "mainnet" ? "SP" : "ST")
    );
    if (addressEntry?.address) {
      return addressEntry.address;
    }
    // Fallback to first address if no network match
    if (userData.addresses.stx[0]?.address) {
      return userData.addresses.stx[0].address;
    }
  }

  // Fallback for old v7 structure (if any)
  if (userData.profile?.stxAddress) {
    return (
      userData.profile.stxAddress[network] ||
      userData.profile.stxAddress.testnet
    );
  }

  return null;
}

export function useStacks() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [userData, setUserData] = useState<any | null>(null);
  const [stxBalance, setStxBalance] = useState(0);

  //   function connectWallet() {
  //     showConnect({
  //       appDetails,
  //       onFinish: () => {
  //         window.location.reload();
  //       },
  //       userSession,
  //     });
  //   }

  //   function disconnectWallet() {
  //     userSession.signUserOut();
  //     setUserData(null);
  //   }
  const loadUserData = () => {
    if (isConnected()) {
      const data = getLocalStorage();
      setUserData(data);
      return true;
    }
    return false;
  };

  async function connectWallet() {
    // If already connected, just load the data
    if (loadUserData()) {
      return;
    }
    try {
      await connect();
      setTimeout(loadUserData, 100);
    } catch (error) {
      console.error("Failed to connect wallet: ", error);
    }
  }

  function disconnectWallet() {
    disconnect();
    setUserData(null);
  }

  async function handleCreateGame(
    betAmount: number,
    moveIndex: number,
    move: Move
  ) {
    if (typeof window === "undefined") return;
    if (moveIndex < 0 || moveIndex > 8) {
      window.alert("Invalid move. Please make a valid move.");
      return;
    }
    if (betAmount === 0) {
      window.alert("Please make a bet");
      return;
    }
    try {
      if (!userData) throw new Error("User not connected");

      const userAddress = getUserAddress(userData);
      if (!userAddress) throw new Error("Could not get user address");

      const txOptions = await createNewGame(
        betAmount,
        moveIndex,
        move,
        userAddress
      );

      console.log("🚀 Sending transaction with options:", txOptions);

      // Use the new v8 API: request("stx_callContract", options)
      const response = await request("stx_callContract", txOptions);
      console.log("✅ Transaction response:", response);

      if (response.txid) {
        const explorerUrl = `https://explorer.hiro.so/txid/0x${response.txid}?chain=testnet`;
        window.alert(
          `✅ Game creation transaction sent!\n\nTX ID: ${response.txid}\n\n⏱️ Wait 1-2 minutes for blockchain confirmation.\n\n📊 Check status: ${explorerUrl}\n\nThe game will appear once the transaction is confirmed.`
        );
        return response.txid;
      } else {
        throw new Error("No transaction ID received");
      }
    } catch (_err) {
      const err = _err as Error;
      console.error("❌ Transaction error:", err);
      window.alert(`❌ Failed to create game:\n\n${err.message}`);
      throw err;
    }
  }

  async function handleJoinGame(gameId: number, moveIndex: number, move: Move) {
    if (typeof window === "undefined") return;
    if (moveIndex < 0 || moveIndex > 8) {
      window.alert("Invalid move. Please make a valid move.");
      return;
    }

    try {
      if (!userData) throw new Error("User not connected");
      const txOptions = await joinGame(gameId, moveIndex, move);

      // Use the new v8 API: request("stx_callContract", options)
      const response = await request("stx_callContract", txOptions);
      console.log("✅ Join game transaction response:", response);

      if (response.txid) {
        const explorerUrl = `https://explorer.hiro.so/txid/0x${response.txid}?chain=testnet`;

        // Open explorer in new tab
        window.open(explorerUrl, "_blank");

        window.alert(
          `✅ Join game transaction sent!\n\nTX ID: ${response.txid}\n\n⏱️ Wait 1-2 minutes for confirmation.\n\n📊 Explorer opened in new tab!`
        );
        return response.txid;
      } else {
        throw new Error("No transaction ID received");
      }
    } catch (_err) {
      const err = _err as Error;
      console.error("❌ Join game error:", err);
      window.alert(`❌ Failed to join game:\n\n${err.message}`);
    }
  }

  async function handlePlayGame(gameId: number, moveIndex: number, move: Move) {
    if (typeof window === "undefined") return;
    if (moveIndex < 0 || moveIndex > 8) {
      window.alert("Invalid move. Please make a valid move.");
      return;
    }
    try {
      if (!userData) throw new Error("User not connected");
      const txOptions = await play(gameId, moveIndex, move);

      // Use the new v8 API: request("stx_callContract", options)
      const response = await request("stx_callContract", txOptions);
      console.log("✅ Play game transaction response:", response);

      if (response.txid) {
        const explorerUrl = `https://explorer.hiro.so/txid/0x${response.txid}?chain=testnet`;

        // Open explorer in new tab
        window.open(explorerUrl, "_blank");

        window.alert(
          `✅ Move transaction sent!\n\nTX ID: ${response.txid}\n\n⏱️ Wait 1-2 minutes for confirmation.\n\n📊 Explorer opened in new tab!`
        );
        return response.txid;
      } else {
        throw new Error("No transaction ID received");
      }
    } catch (_err) {
      const err = _err as Error;
      console.error("❌ Play game error:", err);
      window.alert(`❌ Failed to make move:\n\n${err.message}`);
    }
  }

  // Restore session on mount
  //   useEffect(() => {
  //     if (userSession.isSignInPending()) {
  //       userSession.handlePendingSignIn().then((userData) => {
  //         setUserData(userData);
  //       });
  //     } else if (userSession.isUserSignedIn()) {
  //       setUserData(userSession.loadUserData());
  //     }
  //   }, []);
  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (userData) {
      const address = getUserAddress(userData);
      if (address) {
        getStxBalance(address).then((balance) => {
          setStxBalance(balance);
        });
      }
    }
  }, [userData]);
  return {
    userData,
    connectWallet,
    disconnectWallet,
    stxBalance,
    handleCreateGame,
    handleJoinGame,
    handlePlayGame,
  };
}
