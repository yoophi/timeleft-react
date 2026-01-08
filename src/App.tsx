import { HashRouter } from "react-router-dom";
import { TimeGrid } from "./components/TimeGrid";

function App() {
  return (
    <HashRouter>
      <div className="g-site">
        <main className="g-main">
          <TimeGrid />
        </main>
      </div>
    </HashRouter>
  );
}

export default App;
