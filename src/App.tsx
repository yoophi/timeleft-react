import { HashRouter } from "react-router-dom";
import { TimeGrid } from "./components/TimeGrid";
import { useState } from "react";
import { SettingsModal } from "./components/SettingsModal";
import type { WorkdaySettings } from "./utils/workdaySettings";

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSettingsSave = (_settings: WorkdaySettings) => {
    // 설정이 변경되면 페이지를 새로고침하여 useTimeLeft가 새로운 설정을 읽도록 함
    // useTimeLeft는 매번 getWorkdaySettings()를 호출하므로 페이지 새로고침이 필요함
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <HashRouter>
      <div className="g-site">
        <button
          onClick={() => setIsSettingsOpen(true)}
          style={{
            position: "fixed",
            top: "16px",
            right: "16px",
            padding: "8px 16px",
            backgroundColor: "#2a2a2a",
            border: "1px solid #444",
            borderRadius: "4px",
            color: "#f5f5f5",
            cursor: "pointer",
            zIndex: 1000,
            fontSize: "14px",
          }}
        >
          설정
        </button>
        <main className="g-main">
          <TimeGrid />
        </main>
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onSave={handleSettingsSave}
        />
      </div>
    </HashRouter>
  );
}

export default App;
