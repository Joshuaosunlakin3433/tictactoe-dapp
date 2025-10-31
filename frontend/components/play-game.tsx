"use client";

import { Game, Move } from "@/lib/contract";
import { GameBoard } from "./game-board";
import { abbreviateAddress, explorerAddress, formatStx } from "@/lib/stx-utils";
import Link from "next/link";
import { useStacks, getUserAddress } from "@/hooks/use-stacks";
import { useState } from "react";

interface PlayGameProps {
  game: Game;
}

export function PlayGame({ game }: PlayGameProps) {
  const { userData, handleJoinGame, handlePlayGame } = useStacks();

  // Initial game board is the current `game.board` state
  const [board, setBoard] = useState(game.board);
  const [isJoining, setIsJoining] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // cell where user played their move. -1 denotes no move has been played
  const [playedMoveIndex, setPlayedMoveIndex] = useState(-1);

  // If user is not logged in, don't show anything
  if (!userData) return null;

  const userAddress = getUserAddress(userData);
  if (!userAddress) return null;

  const isPlayerOne = userAddress === game["player-one"];
  const isPlayerTwo = userAddress === game["player-two"];

  const isJoinable = game["player-two"] === null && !isPlayerOne;
  const isJoinedAlready = isPlayerOne || isPlayerTwo;
  const nextMove = game["is-player-one-turn"] ? Move.X : Move.O;
  const isMyTurn =
    (game["is-player-one-turn"] && isPlayerOne) ||
    (!game["is-player-one-turn"] && isPlayerTwo);
  const isGameOver = game.winner !== null;

  function onCellClick(index: number) {
    const tempBoard = [...game.board];
    tempBoard[index] = nextMove;
    setBoard(tempBoard);
    setPlayedMoveIndex(index);
  }

  return (
    <div className="flex flex-col gap-4 w-[400px]">
      <GameBoard
        board={board}
        onCellClick={onCellClick}
        nextMove={nextMove}
        cellClassName="size-32 text-6xl"
      />

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-gray-500">Bet Amount: </span>
          <span>{formatStx(game["bet-amount"])} STX</span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-gray-500">Player One: </span>
          <Link
            href={explorerAddress(game["player-one"])}
            target="_blank"
            className="hover:underline"
          >
            {abbreviateAddress(game["player-one"])}
          </Link>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-gray-500">Player Two: </span>
          {game["player-two"] ? (
            <Link
              href={explorerAddress(game["player-two"])}
              target="_blank"
              className="hover:underline"
            >
              {abbreviateAddress(game["player-two"])}
            </Link>
          ) : (
            <span>Nobody</span>
          )}
        </div>

        {game["winner"] && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-gray-500">Winner: </span>
            <Link
              href={explorerAddress(game["winner"])}
              target="_blank"
              className="hover:underline"
            >
              {abbreviateAddress(game["winner"])}
            </Link>
          </div>
        )}
      </div>

      {isJoinable && (
        <button
          onClick={async () => {
            setIsJoining(true);
            await handleJoinGame(game.id, playedMoveIndex, nextMove);
            // Wait for transaction to be broadcast
            await new Promise((resolve) => setTimeout(resolve, 3000));
            window.location.reload();
          }}
          disabled={isJoining || playedMoveIndex === -1}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isJoining ? "Joining Game..." : "Join Game"}
        </button>
      )}

      {isMyTurn && (
        <button
          onClick={async () => {
            setIsPlaying(true);
            await handlePlayGame(game.id, playedMoveIndex, nextMove);
            // Wait for transaction to be broadcast
            await new Promise((resolve) => setTimeout(resolve, 3000));
            window.location.reload();
          }}
          disabled={isPlaying || playedMoveIndex === -1}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPlaying ? "Playing..." : "Play"}
        </button>
      )}

      {isJoinedAlready && !isMyTurn && !isGameOver && (
        <div className="text-gray-500">Waiting for opponent to play...</div>
      )}
    </div>
  );
}
