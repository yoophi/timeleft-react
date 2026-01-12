import React, { useState, useEffect } from "react";
import { getWorkdaySettings, saveWorkdaySettings } from "../utils/workdaySettings";
import type { WorkdaySettings } from "../utils/workdaySettings";

interface WorkdaySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: WorkdaySettings) => void;
}

export const WorkdaySettingsModal: React.FC<WorkdaySettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [settings, setSettings] = useState<WorkdaySettings>(getWorkdaySettings());

  useEffect(() => {
    if (isOpen) {
      setSettings(getWorkdaySettings());
    }
  }, [isOpen]);

  const handleSave = () => {
    saveWorkdaySettings(settings);
    onSave(settings);
    onClose();
  };

  const formatTimeValue = (value: number, max: number): string => {
    return Math.max(0, Math.min(max, value)).toString().padStart(2, "0");
  };

  const handleTimeChange = (
    field: "startHour" | "startMinute" | "endHour" | "endMinute",
    value: string
  ) => {
    // 숫자만 추출
    const numericValue = value.replace(/\D/g, "");
    if (numericValue === "") {
      setSettings({ ...settings, [field]: 0 });
      return;
    }
    
    const num = parseInt(numericValue, 10);
    const max = field.includes("Hour") ? 23 : 59;
    const clampedValue = Math.max(0, Math.min(max, num));
    
    setSettings({ ...settings, [field]: clampedValue });
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#1a1a1a",
          padding: "24px",
          borderRadius: "8px",
          minWidth: "300px",
          maxWidth: "90%",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginTop: 0, marginBottom: "20px", color: "#f5f5f5" }}>
          근무 시간 설정
        </h2>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", color: "#ccc" }}>
              시작 시간
            </label>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formatTimeValue(settings.startHour, 23)}
                onChange={(e) => handleTimeChange("startHour", e.target.value)}
                onBlur={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  setSettings({ ...settings, startHour: Math.max(0, Math.min(23, value)) });
                }}
                style={{
                  width: "60px",
                  padding: "8px",
                  backgroundColor: "#2a2a2a",
                  border: "1px solid #444",
                  borderRadius: "4px",
                  color: "#f5f5f5",
                  textAlign: "center",
                }}
              />
              <span style={{ color: "#ccc" }}>:</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formatTimeValue(settings.startMinute, 59)}
                onChange={(e) => handleTimeChange("startMinute", e.target.value)}
                onBlur={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  setSettings({ ...settings, startMinute: Math.max(0, Math.min(59, value)) });
                }}
                style={{
                  width: "60px",
                  padding: "8px",
                  backgroundColor: "#2a2a2a",
                  border: "1px solid #444",
                  borderRadius: "4px",
                  color: "#f5f5f5",
                  textAlign: "center",
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", color: "#ccc" }}>
              종료 시간
            </label>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formatTimeValue(settings.endHour, 23)}
                onChange={(e) => handleTimeChange("endHour", e.target.value)}
                onBlur={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  setSettings({ ...settings, endHour: Math.max(0, Math.min(23, value)) });
                }}
                style={{
                  width: "60px",
                  padding: "8px",
                  backgroundColor: "#2a2a2a",
                  border: "1px solid #444",
                  borderRadius: "4px",
                  color: "#f5f5f5",
                  textAlign: "center",
                }}
              />
              <span style={{ color: "#ccc" }}>:</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formatTimeValue(settings.endMinute, 59)}
                onChange={(e) => handleTimeChange("endMinute", e.target.value)}
                onBlur={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  setSettings({ ...settings, endMinute: Math.max(0, Math.min(59, value)) });
                }}
                style={{
                  width: "60px",
                  padding: "8px",
                  backgroundColor: "#2a2a2a",
                  border: "1px solid #444",
                  borderRadius: "4px",
                  color: "#f5f5f5",
                  textAlign: "center",
                }}
              />
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "8px",
            justifyContent: "flex-end",
            marginTop: "24px",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              backgroundColor: "#2a2a2a",
              border: "1px solid #444",
              borderRadius: "4px",
              color: "#f5f5f5",
              cursor: "pointer",
            }}
          >
            취소
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: "8px 16px",
              backgroundColor: "#4a9eff",
              border: "none",
              borderRadius: "4px",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

