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
      const txOptions = await createNewGame(betAmount, moveIndex, move);

      // Use the new v8 API: request("stx_callContract", options)
      const response = await request("stx_callContract", txOptions);
      console.log("Transaction response:", response);
      window.alert(`Sent create game transaction! TX ID: ${response.txid}`);
    } catch (_err) {
      const err = _err as Error;
      console.error(err);
      window.alert(err.message);
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
      console.log("Transaction response:", response);
      window.alert(`Sent join game transaction! TX ID: ${response.txid}`);
    } catch (_err) {
      const err = _err as Error;
      console.error(err);
      window.alert(err.message);
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
      console.log("Transaction response:", response);
      window.alert(`Sent play game transaction! TX ID: ${response.txid}`);
    } catch (_err) {
      const err = _err as Error;
      console.error(err);
      window.alert(err.message);
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
    if (userData && userData.profile) {
      // Access the STX address from the profile
      // The profile contains addresses for different networks
      const address = userData.profile.stxAddress?.testnet;
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
