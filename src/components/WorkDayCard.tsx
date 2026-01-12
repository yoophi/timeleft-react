import React, { useState } from "react";
import { type TimeItem, useColorLogic } from "../hooks/useTimeLeft";
import { getWorkdaySettings } from "../utils/workdaySettings";

interface WorkDayCardProps {
  item: TimeItem;
  isActive: boolean;
  isHidden: boolean;
  onClick: () => void;
}

export const WorkDayCard: React.FC<WorkDayCardProps> = ({
  item,
  isActive,
  isHidden,
  onClick,
}) => {
  const { percentage, specs, title, type } = item;
  const [hoveredBlock, setHoveredBlock] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  
  // localStorage에서 설정값 가져오기
  const workdaySettings = getWorkdaySettings();
  const startMinutesTotal = workdaySettings.startHour * 60 + workdaySettings.startMinute;
  const endMinutesTotal = workdaySettings.endHour * 60 + workdaySettings.endMinute;
  const totalMinutes = endMinutesTotal - startMinutesTotal;
  
  // 30분 단위로 나누기
  const minutesPerBlock = 30;
  const totalBlocks = Math.ceil(totalMinutes / minutesPerBlock);
  
  // 현재 시간 가져오기
  const now = new Date();
  const currentTime = now.getTime();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // 각 블록의 상태를 확인하는 함수
  const getBlockStatus = (blockIndex: number): 'elapsed' | 'current' | 'future' => {
    const blockStartMinutes = startMinutesTotal + blockIndex * minutesPerBlock;
    const blockEndMinutes = Math.min(blockStartMinutes + minutesPerBlock, endMinutesTotal);
    
    const blockStartTime = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      Math.floor(blockStartMinutes / 60),
      blockStartMinutes % 60
    ).getTime();
    const blockEndTime = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      Math.floor(blockEndMinutes / 60),
      blockEndMinutes % 60
    ).getTime();
    
    if (currentTime >= blockEndTime) {
      return 'elapsed';
    } else if (currentTime >= blockStartTime && currentTime < blockEndTime) {
      return 'current';
    } else {
      return 'future';
    }
  };
  
  const style: React.CSSProperties = {
    display: isHidden ? "none" : "flex",
  };

  const handleBlockMouseEnter = (index: number, event: React.MouseEvent<HTMLDivElement>) => {
    setHoveredBlock(index);
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
  };

  const handleBlockMouseLeave = () => {
    setHoveredBlock(null);
    setTooltipPosition(null);
  };

  const handleBlockMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (hoveredBlock !== null) {
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
    }
  };

  return (
    <div
      className={`c-card f-time vgap ${isActive ? "is-active" : ""}`}
      data-type={type}
      onClick={onClick}
      style={style}
    >
      <div className="l-bar gap">
        <div className="l-stack vgap">
          <div>
            <div className="l-bunch gap-s">
              <div>
                <div className="f-time-circle">
                  <svg
                    width="36"
                    height="36"
                    viewBox="0 0 18 18"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      className="f-time-circle-line"
                      r="12"
                      cx="18"
                      cy="18"
                      strokeWidth="6"
                      stroke="red"
                      fill="transparent"
                      strokeDasharray="565.48"
                      strokeDashoffset="0"
                    ></circle>
                    <circle
                      className="f-time-circle-progress"
                      r="12"
                      cx="18"
                      cy="18"
                      strokeWidth="6"
                      stroke="blue"
                      fill="transparent"
                      strokeDasharray="565.48"
                      strokeDashoffset={566 - (76 / 100) * percentage}
                      style={{
                        stroke: "#f5f5f5",
                        transition: "all 1s ease-out",
                      }}
                    ></circle>
                  </svg>
                </div>
              </div>
              <div>
                <h2 className="h3">{title}</h2>
              </div>
            </div>
          </div>
          <div>
            <div className="h1">
              <span className="f-time-percentage">{percentage}</span>
              <span className="t-gray">%</span>
            </div>
          </div>
        </div>
        <div>
          <div className="h5 text-right">
            <div className="f-time-specs l-stack">
              {Object.entries(specs).map(([key, value]) => (
                <span key={key}>
                  <span className={`f-time-specs-${key}`}>{value}</span>{" "}
                  <span className="t-gray">{key.toUpperCase()}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="c-card-footer" style={{ position: "relative" }}>
        <div
          style={{
            display: "flex",
            gap: "4px",
            flexWrap: "nowrap",
            alignItems: "center",
            overflowX: "auto",
          }}
        >
          {Array.from({ length: totalBlocks }).map((_, index) => {
            // 각 블록의 시작 시간 계산
            const startMinutes = startMinutesTotal + index * minutesPerBlock;
            const endMinutes = Math.min(startMinutes + minutesPerBlock, endMinutesTotal);
            const startHour = Math.floor(startMinutes / 60);
            const startMin = startMinutes % 60;
            const endHour = Math.floor(endMinutes / 60);
            const endMin = endMinutes % 60;

            const timeString = `${startHour}:${startMin.toString().padStart(2, "0")} - ${endHour}:${endMin.toString().padStart(2, "0")}`;

            // 각 블록의 경과 비율에 따른 색깔 계산
            const blockPercentage = ((index + 1) / totalBlocks) * 100;
            const { progressColor, progressShadow, containerColor } = useColorLogic(blockPercentage);

            // 현재 시간 기준으로 블록 상태 확인
            const blockStatus = getBlockStatus(index);
            const isHovered = hoveredBlock === index;

            // 현재 블록의 진행률 계산
            const getBlockProgress = (): number => {
              if (blockStatus === 'elapsed') return 100;
              if (blockStatus === 'future') return 0;

              // 현재 블록의 진행률 계산
              const blockStartMinutes = startMinutesTotal + index * minutesPerBlock;
              const blockEndMinutes = Math.min(blockStartMinutes + minutesPerBlock, endMinutesTotal);

              const blockStartTime = new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate(),
                Math.floor(blockStartMinutes / 60),
                blockStartMinutes % 60
              ).getTime();
              const blockEndTime = new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate(),
                Math.floor(blockEndMinutes / 60),
                blockEndMinutes % 60
              ).getTime();

              return ((currentTime - blockStartTime) / (blockEndTime - blockStartTime)) * 100;
            };

            const blockProgress = getBlockProgress();

            return (
              <div
                key={index}
                style={{
                  position: "relative",
                  flex: 1,
                  height: "12px",
                  backgroundColor: containerColor,
                  borderRadius: "4px",
                  border: "1px solid #444",
                  overflow: "hidden",
                  cursor: "pointer",
                  transform: isHovered ? "scale(1.1)" : "scale(1)",
                  transition: "all 0.3s ease-out",
                  zIndex: isHovered ? 10 : 1,
                }}
                onMouseEnter={(e) => handleBlockMouseEnter(index, e)}
                onMouseLeave={handleBlockMouseLeave}
                onMouseMove={handleBlockMouseMove}
                title={timeString}
              >
                {/* 진행률 표시 (현재 블록만 - 가로 방향) */}
                {blockStatus === 'current' && (
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: `${blockProgress}%`,
                      backgroundColor: progressColor,
                      boxShadow: progressShadow,
                      transition: "all 0.3s ease-out",
                    }}
                  />
                )}
                {/* 지난 블록은 완전히 채워진 배경 */}
                {blockStatus === 'elapsed' && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: progressColor,
                      boxShadow: progressShadow,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
        {hoveredBlock !== null && tooltipPosition && (
          <div
            style={{
              position: "fixed",
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y}px`,
              transform: "translateX(-50%) translateY(-100%)",
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              color: "white",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              whiteSpace: "nowrap",
              pointerEvents: "none",
              zIndex: 1000,
              marginBottom: "4px",
            }}
          >
            {(() => {
              const index = hoveredBlock;
              const startMinutes = startMinutesTotal + index * minutesPerBlock;
              const endMinutes = Math.min(startMinutes + minutesPerBlock, endMinutesTotal);
              const startHour = Math.floor(startMinutes / 60);
              const startMin = startMinutes % 60;
              const endHour = Math.floor(endMinutes / 60);
              const endMin = endMinutes % 60;
              return `${startHour}:${startMin.toString().padStart(2, "0")} - ${endHour}:${endMin.toString().padStart(2, "0")}`;
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

