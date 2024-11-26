import "./App.css";
import PlayChessEngine from "./PlayChessEngine";

function App() {
  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          paddingInline: "20px",
          maxWidth: "600px",
          margin: "auto",
        }}>
        <h1
          style={{
            textAlign: "center",
            color: "white",
            padding: "10px",
            borderRadius: "10px",
          }}>
          Ajedrez
        </h1>
        <PlayChessEngine />
      </div>
    </>
  );
}

export default App;
