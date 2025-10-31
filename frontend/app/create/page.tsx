"use client";

import { GameBoard } from "@/components/game-board";
import { useStacks } from "@/hooks/use-stacks";
import { EMPTY_BOARD, Move } from "@/lib/contract";
import { formatStx, parseStx } from "@/lib/stx-utils";
import { useState } from "react";

export default function CreateGame() {
  const { stxBalance, userData, connectWallet, handleCreateGame } = useStacks();

  const [betAmount, setBetAmount] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  // When creating a new game, the initial board is entirely empty
  const [board, setBoard] = useState(EMPTY_BOARD);

  function onCellClick(index: number) {
    // Update the board to be the empty board + the move played by the user
    // Since this is inside 'Create Game', the user's move is the very first move and therefore always an X
    const tempBoard = [...EMPTY_BOARD];
    tempBoard[index] = Move.X;
    setBoard(tempBoard);
  }

  async function onCreateGame() {
    // Find the moveIndex (i.e. the cell) where the user played their move
    const moveIndex = board.findIndex((cell) => cell !== Move.EMPTY);

    if (moveIndex === -1) {
      window.alert("⚠️ Please click on a cell to make your first move!");
      return;
    }

    if (betAmount <= 0) {
      window.alert("⚠️ Please enter a bet amount greater than 0!");
      return;
    }

    // Check if user has enough balance
    if (stxBalance < betAmount) {
      window.alert(
        `⚠️ Insufficient balance!\n\nYou need ${betAmount} STX but only have ${formatStx(
          stxBalance
        )} STX.\n\nGet testnet STX from: https://explorer.hiro.so/sandbox/faucet?chain=testnet`
      );
      return;
    }

    const move = Move.X;
    // Trigger the onchain transaction popup
    setIsCreating(true);
    try {
      const txid = await handleCreateGame(parseStx(betAmount), moveIndex, move);

      if (txid) {
        // Don't redirect immediately - let user see the alert with explorer link
        // They can manually go to home page after checking transaction
        setIsCreating(false);
        // Reset the board
        setBoard(EMPTY_BOARD);
        setBetAmount(0);
      }
    } catch (error) {
      console.error("Failed to create game:", error);
      setIsCreating(false);
    }
  }

  return (
    <section className="flex flex-col items-center py-20">
      <div className="text-center mb-20">
        <h1 className="text-4xl font-bold">Create Game</h1>
        <span className="text-sm text-gray-500">
          Make a bet and play your first move
        </span>
      </div>

      <div className="flex flex-col gap-4 w-[400px]">
        <GameBoard
          board={board}
          onCellClick={onCellClick}
          nextMove={Move.X}
          cellClassName="size-32 text-6xl"
        />

        <div className="flex items-center gap-2 w-full">
          <span className="">Bet: </span>
          <input
            type="number"
            step="0.000001"
            min="0.000001"
            className="w-full rounded bg-gray-800 px-1"
            placeholder="0.1"
            value={betAmount || ""}
            onChange={(e) => {
              setBetAmount(parseFloat(e.target.value) || 0);
            }}
          />

          <div
            className="text-xs px-1 py-0.5 cursor-pointer hover:bg-gray-700 bg-gray-600 border border-gray-600 rounded"
            onClick={() => {
              setBetAmount(formatStx(stxBalance));
            }}
          >
            Max
          </div>
        </div>

        {userData ? (
          <button
            type="button"
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onCreateGame}
            disabled={
              isCreating ||
              board.every((cell) => cell === Move.EMPTY) ||
              betAmount <= 0
            }
          >
            {isCreating ? "Creating Game..." : "Create Game"}
          </button>
        ) : (
          <button
            type="button"
            onClick={connectWallet}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </section>
  );
}
