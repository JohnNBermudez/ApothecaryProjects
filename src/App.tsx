import React from "react";
const bookshelf = new URL("../assets/icons/bookshelf-empty.png", import.meta.url).href;

export default function App() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        backgroundImage: `url(${bookshelf})`,
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundColor: "#3b2415",
        imageRendering: "pixelated",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Your GUI content goes here */}
      <h1
        style={{
          color: "#f5deb3",
          fontFamily: "Press Start 2P, monospace",
          fontSize: "1.2rem",
          textShadow: "2px 2px #3b2415",
        }}
      >
      </h1>
    </div>
  );
}
