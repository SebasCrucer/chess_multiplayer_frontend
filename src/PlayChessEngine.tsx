import { useEffect, useState } from "react";
import { Chess, ShortMove } from "chess.js";
import { Chessboard } from "react-chessboard";
import { Square } from "react-chessboard/dist/chessboard/types";
import { useConnection } from "./useConnection";

export default function PlayChessEngine() {
  const [game, setGame] = useState(new Chess());
  const [color, setColor] = useState<"w" | "b" | null>(null);
  const [connected, setConnected] = useState(false);
  const [myTurn, setMyTurn] = useState(false);
  const [winModal, setWinModal] = useState<null | {
    winner: "w" | "b";
  }>(null);

  const { sendMessage } = useConnection({
    onMessage(message) {
      if (message === "PAIR") {
        setConnected(true);
        reset();
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
      setMyTurn(true);
    },
  });

  function makeAMove(move: string | ShortMove) {
    console.log(move);
    const gameCopy = { ...game };
    const result = gameCopy.move(move);
    console.log(result);
    setGame(gameCopy);
    sendMessage(gameCopy.fen());
    return result;
  }

  function sendPairSignal() {
    sendMessage("PAIR");
  }

  function reset() {
    setGame(new Chess());
    setColor(null);
    setMyTurn(false);
    setWinModal(null);
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

    setMyTurn(false);
    return true;
  }

  useEffect(() => {
    if (game.in_checkmate()) {
      console.log("CHECKMATE");
      const winner = game.turn() === "w" ? "b" : "w";
      setWinModal({
        winner,
      });
    }
    if (game.in_draw()) {
      console.log("DRAW");
      const winner = game.turn() === "w" ? "b" : "w";
      setWinModal({
        winner,
      });
    }
  }, [game]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
      }}>
      <div>
        {!connected && <h2>Emparejando...</h2>}
        {connected && myTurn && <h2>Es tu turno</h2>}
        {connected && !myTurn && <h2>Esperando al oponente...</h2>}
      </div>
      {winModal && (
        <div
          id="win-modal"
          style={{
            position: "fixed",
            zIndex: 1,
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            overflow: "auto",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}>
          <div id="win-modal-content">
            <span
              id="close"
              style={{
                cursor: "pointer",
                fontSize: "2rem",
              }}
              onClick={() => {
                sendPairSignal();
                reset();
              }}>
              &times;
            </span>
            {winModal.winner === color ? (
              <>
                <h1 id="win-modal-title">¡Ganaste!</h1>
                <p id="win-modal-text">
                  ¡Felicidades! Has ganado la partida. ¿Quieres jugar otra vez?
                </p>
              </>
            ) : (
              <>
                <h1 id="win-modal-title">¡Perdiste!</h1>
                <p id="win-modal-text">
                  ¡Lo siento! Has perdido la partida. ¿Quieres jugar otra vez?
                </p>
              </>
            )}
            <button
              id="win-modal-button"
              onClick={() => {
                sendPairSignal();
                reset();
              }}>
              Jugar otra vez
            </button>
          </div>
        </div>
      )}
      <Chessboard
        position={game.fen()}
        onPieceDrop={onDrop}
        boardOrientation={color === "b" ? "black" : "white"}
        customBoardStyle={{
          borderRadius: "5px",
          boxShadow: "0 5px 15px rgba(0, 0, 0, 0.5)",
        }}
      />
    </div>
  );
}
