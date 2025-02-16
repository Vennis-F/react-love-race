import { Analytics } from "@vercel/analytics/react";
import Game from "./compnents/Game";
import "./App.css";

function App() {
  return (
    <div className="App">
      <Game />
      <Analytics />
    </div>
  );
}

export default App;
