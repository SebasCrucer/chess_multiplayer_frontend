import { useEffect, useState } from "react";
import { Chess, ShortMove } from "chess.js";
import { Chessboard } from "react-chessboard";
import { Square } from "react-chessboard/dist/chessboard/types";
import { useConnection } from "./useConnection";

export default function PlayChessEngine() {
  const [game, setGame] = useState(new Chess());
  const [color, setColor] = useState<"w" | "b" | null>(null);

  const { sendMessage } = useConnection({
    onMessage(message) {
      if (message === "PAIR") {
        setGame(new Chess());
        console.log("EMPAREJADO");
        return;
      }

      if (message === "COLOR_B") {
        if (color === null) {
          setColor("b");
        }
        return;
      }

      const fen = message;

      const gameCopy = { ...game };
      gameCopy.load(fen);
      setGame(gameCopy);
    },
  });

  function makeAMove(move: string | ShortMove) {
    const gameCopy = { ...game };
    const result = gameCopy.move(move);
    console.log(result);
    setGame(gameCopy);
    sendMessage(gameCopy.fen());
    return result;
  }

  function onDrop(sourceSquare: Square, targetSquare: Square) {
    if (color === null) {
      setColor("w");
      sendMessage("COLOR_B");
    } else if (game.turn() !== color) {
      return false;
    }

    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });

    if (move === null) return false;
    return true;
  }
  useEffect(() => {
    if (game.in_checkmate()) {
      console.log("CHECKMATE");
      console.log(game.turn() === "w" ? "BLACK WINS" : "WHITE WINS");
    }
    if (game.in_draw()) {
      console.log("DRAW");
      console.log(game.turn() === "w" ? "BLACK WINS" : "WHITE WINS");
    }
    if (game.in_stalemate()) {
      console.log("STALEMATE");
    }
    if (game.in_threefold_repetition()) {
      console.log("THREEFOLD REPETITION");
    }
    if (game.insufficient_material()) {
      console.log("INSUFFICIENT MATERIAL");
    }
  }, [game]);

  return (
    <Chessboard
      position={game.fen()}
      onPieceDrop={onDrop}
      boardOrientation={color === "b" ? "black" : "white"}
      customBoardStyle={{
        borderRadius: "5px",
        boxShadow: "0 5px 15px rgba(0, 0, 0, 0.5)",
      }}
    />
  );
}
