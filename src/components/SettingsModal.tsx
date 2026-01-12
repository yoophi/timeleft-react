import React, { useState, useEffect } from "react";
import { getWorkdaySettings, saveWorkdaySettings } from "../utils/workdaySettings";
import type { WorkdaySettings } from "../utils/workdaySettings";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: WorkdaySettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [settings, setSettings] = useState<WorkdaySettings>(() => {
    const loaded = getWorkdaySettings();
    // workdays가 없으면 기본값으로 채움
    if (!loaded.workdays) {
      return {
        ...loaded,
        workdays: {
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: false,
          sunday: false,
        },
      };
    }
    return loaded;
  });

  // 입력 중인 값을 추적하기 위한 상태
  const [inputValues, setInputValues] = useState<{
    startHour: string;
    startMinute: string;
    endHour: string;
    endMinute: string;
  }>({
    startHour: "",
    startMinute: "",
    endHour: "",
    endMinute: "",
  });
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const loaded = getWorkdaySettings();
      // workdays가 없으면 기본값으로 채움
      if (!loaded.workdays) {
        setSettings({
          ...loaded,
          workdays: {
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: false,
            sunday: false,
          },
        });
      } else {
        setSettings(loaded);
      }
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

  const getDisplayValue = (
    field: "startHour" | "startMinute" | "endHour" | "endMinute",
    max: number
  ): string => {
    if (focusedField === field) {
      return inputValues[field];
    }
    return formatTimeValue(settings[field], max);
  };

  const handleFocus = (
    field: "startHour" | "startMinute" | "endHour" | "endMinute"
  ) => {
    setFocusedField(field);
    setInputValues({
      ...inputValues,
      [field]: settings[field].toString(),
    });
  };

  const handleTimeChange = (
    field: "startHour" | "startMinute" | "endHour" | "endMinute",
    value: string
  ) => {
    // 숫자만 추출
    const numericValue = value.replace(/\D/g, "");
    setInputValues({ ...inputValues, [field]: numericValue });
  };

  const handleBlur = (
    field: "startHour" | "startMinute" | "endHour" | "endMinute"
  ) => {
    const max = field.includes("Hour") ? 23 : 59;
    const numericValue = inputValues[field];
    const num = numericValue === "" ? 0 : parseInt(numericValue, 10);
    const clampedValue = Math.max(0, Math.min(max, num));

    setSettings({ ...settings, [field]: clampedValue });
    setFocusedField(null);
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
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ margin: 0, color: "#f5f5f5" }}>
          설정
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* 근무 시간 섹션 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ margin: 0, color: "#f5f5f5", fontSize: "1.1rem" }}>근무 시간</h3>
            <div>
              <label style={{ display: "block", marginBottom: "8px", color: "#ccc" }}>
                시작 시간
              </label>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={getDisplayValue("startHour", 23)}
                  onFocus={() => handleFocus("startHour")}
                  onChange={(e) => handleTimeChange("startHour", e.target.value)}
                  onBlur={() => handleBlur("startHour")}
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
                  value={getDisplayValue("startMinute", 59)}
                  onFocus={() => handleFocus("startMinute")}
                  onChange={(e) => handleTimeChange("startMinute", e.target.value)}
                  onBlur={() => handleBlur("startMinute")}
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
                  value={getDisplayValue("endHour", 23)}
                  onFocus={() => handleFocus("endHour")}
                  onChange={(e) => handleTimeChange("endHour", e.target.value)}
                  onBlur={() => handleBlur("endHour")}
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
                  value={getDisplayValue("endMinute", 59)}
                  onFocus={() => handleFocus("endMinute")}
                  onChange={(e) => handleTimeChange("endMinute", e.target.value)}
                  onBlur={() => handleBlur("endMinute")}
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
                근무 요일
              </label>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                {[
                  { key: "monday", label: "월" },
                  { key: "tuesday", label: "화" },
                  { key: "wednesday", label: "수" },
                  { key: "thursday", label: "목" },
                  { key: "friday", label: "금" },
                  { key: "saturday", label: "토" },
                  { key: "sunday", label: "일" },
                ].map(({ key, label }) => {
                  const isChecked = settings.workdays?.[key as keyof typeof settings.workdays] ?? false;
                  return (
                    <label
                      key={key}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: isChecked ? "#f5f5f5" : "#888",
                        cursor: "pointer",
                        padding: "6px 10px",
                        borderRadius: "4px",
                        backgroundColor: isChecked ? "#2a4a6a" : "#2a2a2a",
                        border: `1px solid ${isChecked ? "#4a9eff" : "#444"}`,
                        transition: "all 0.2s ease",
                        userSelect: "none",
                        fontSize: "0.9rem",
                      }}
                      onMouseEnter={(e) => {
                        if (!isChecked) {
                          e.currentTarget.style.backgroundColor = "#333";
                          e.currentTarget.style.borderColor = "#555";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isChecked) {
                          e.currentTarget.style.backgroundColor = "#2a2a2a";
                          e.currentTarget.style.borderColor = "#444";
                        }
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          e.stopPropagation();
                          const newWorkdays = {
                            ...(settings.workdays || {
                              monday: true,
                              tuesday: true,
                              wednesday: true,
                              thursday: true,
                              friday: true,
                              saturday: false,
                              sunday: false,
                            }),
                            [key]: e.target.checked,
                          };
                          setSettings({
                            ...settings,
                            workdays: newWorkdays,
                          });
                        }}
                        onClick={(e) => e.stopPropagation()}
                        style={{ display: "none" }}
                      />
                      {isChecked && (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                      <span style={{ fontWeight: isChecked ? "500" : "400" }}>{label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 카드 표시 섹션 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ margin: 0, color: "#f5f5f5", fontSize: "1.1rem" }}>카드 표시</h3>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {[
                { key: "hour", label: "Hour" },
                { key: "day", label: "Day" },
                { key: "workday", label: "Work Day" },
                { key: "week", label: "Week" },
                { key: "workweek", label: "Work Week" },
                { key: "month", label: "Month" },
                { key: "year", label: "Year" },
                { key: "decade", label: "Decade" },
                { key: "century", label: "Century" },
                { key: "millenium", label: "Millenium" },
              ].map(({ key, label }) => {
                const isChecked = settings.visibleCards?.[key] ?? true;
                return (
                  <label
                    key={key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      color: isChecked ? "#f5f5f5" : "#888",
                      cursor: "pointer",
                      padding: "6px 10px",
                      borderRadius: "4px",
                      backgroundColor: isChecked ? "#2a4a6a" : "#2a2a2a",
                      border: `1px solid ${isChecked ? "#4a9eff" : "#444"}`,
                      transition: "all 0.2s ease",
                      userSelect: "none",
                      fontSize: "0.9rem",
                    }}
                    onMouseEnter={(e) => {
                      if (!isChecked) {
                        e.currentTarget.style.backgroundColor = "#333";
                        e.currentTarget.style.borderColor = "#555";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isChecked) {
                        e.currentTarget.style.backgroundColor = "#2a2a2a";
                        e.currentTarget.style.borderColor = "#444";
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        e.stopPropagation();
                        const newVisibleCards = {
                          ...settings.visibleCards,
                          [key]: e.target.checked,
                        };
                        setSettings({
                          ...settings,
                          visibleCards: newVisibleCards,
                        });
                      }}
                      onClick={(e) => e.stopPropagation()}
                      style={{ display: "none" }}
                    />
                    {isChecked && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    <span style={{ fontWeight: isChecked ? "500" : "400" }}>{label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "8px",
            justifyContent: "flex-end",
            marginTop: "8px",
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
