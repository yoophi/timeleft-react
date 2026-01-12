import React, { useState } from "react";
import { type TimeItem, useColorLogic } from "../hooks/useTimeLeft";
import { getWorkdaySettings } from "../utils/workdaySettings";

interface WorkWeekCardProps {
  item: TimeItem;
  isActive: boolean;
  isHidden: boolean;
  onClick: () => void;
}

// 요일을 숫자로 변환 (0=일요일, 1=월요일, ..., 6=토요일)
function getDayOfWeekNumber(dayName: string): number {
  const mapping: { [key: string]: number } = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };
  return mapping[dayName] ?? -1;
}

export const WorkWeekCard: React.FC<WorkWeekCardProps> = ({
  item,
  isActive,
  isHidden,
  onClick,
}) => {
  const { percentage, specs, title, type } = item;
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  
  const style: React.CSSProperties = {
    display: isHidden ? "none" : "flex",
  };

  // 설정에서 근무 요일 가져오기
  const workdaySettings = getWorkdaySettings();
  const workdays = workdaySettings.workdays;
  
  // 근무 요일 목록 생성
  const enabledWorkdays: number[] = [];
  Object.entries(workdays).forEach(([dayName, enabled]) => {
    if (enabled) {
      const dayNum = getDayOfWeekNumber(dayName);
      if (dayNum >= 0) {
        enabledWorkdays.push(dayNum);
      }
    }
  });

  // 현재 시간 가져오기
  const now = new Date();
  const currentTime = now.getTime();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDay = now.getDate();
  const currentWeekday = now.getDay();

  // 각 근무일의 상태 계산
  const workDays: Array<{
    day: number;
    weekday: number;
    label: string;
    percentage: number;
    status: 'elapsed' | 'current' | 'future';
  }> = [];

  if (enabledWorkdays.length > 0) {
    const earliestWorkday = Math.min(...enabledWorkdays);
    const latestWorkday = Math.max(...enabledWorkdays);
    
    let weekStartDay = currentDay;
    if (currentWeekday < earliestWorkday) {
      weekStartDay = currentDay - 7 + (earliestWorkday - currentWeekday);
    } else if (currentWeekday > earliestWorkday) {
      weekStartDay = currentDay - (currentWeekday - earliestWorkday);
    }
    
    for (let d = weekStartDay; d <= weekStartDay + (latestWorkday - earliestWorkday); d++) {
      const checkDate = new Date(currentYear, currentMonth, d);
      const checkWeekday = checkDate.getDay();
      
      if (enabledWorkdays.includes(checkWeekday)) {
        const dayStartTime = new Date(
          currentYear,
          currentMonth,
          d,
          workdaySettings.startHour,
          workdaySettings.startMinute
        ).getTime();
        const dayEndTime = new Date(
          currentYear,
          currentMonth,
          d,
          workdaySettings.endHour,
          workdaySettings.endMinute
        ).getTime();
        
        let dayPercentage = 0;
        let dayStatus: 'elapsed' | 'current' | 'future' = 'future';
        
        if (d < currentDay) {
          // 지난 날짜
          dayStatus = 'elapsed';
          dayPercentage = 100;
        } else if (d === currentDay) {
          // 오늘
          dayStatus = 'current';
          if (currentTime < dayStartTime) {
            dayPercentage = 0;
          } else if (currentTime >= dayEndTime) {
            dayPercentage = 100;
          } else {
            dayPercentage = ((currentTime - dayStartTime) / (dayEndTime - dayStartTime)) * 100;
          }
        } else {
          // 미래 날짜
          dayStatus = 'future';
          dayPercentage = 0;
        }
        
        const dayLabels = ['일', '월', '화', '수', '목', '금', '토'];
        workDays.push({
          day: d,
          weekday: checkWeekday,
          label: dayLabels[checkWeekday],
          percentage: dayPercentage,
          status: dayStatus,
        });
      }
    }
  }

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
        
        {/* 각 근무일 사각형 */}
        <div 
          style={{
            display: "flex",
            gap: "4px",
            flexWrap: "nowrap",
            alignItems: "center",
            overflowX: "auto",
          }}
        >
          {workDays.map((workDay, index) => {
            const blockPercentage = ((index + 1) / workDays.length) * 100;
            const { progressColor, progressShadow, containerColor } = useColorLogic(blockPercentage);
            
            const isHovered = hoveredDay === workDay.day;
            
            return (
              <div
                key={workDay.day}
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
                onMouseEnter={() => setHoveredDay(workDay.day)}
                onMouseLeave={() => setHoveredDay(null)}
                title={`${workDay.label}요일`}
              >
                {/* 진행률 표시 (오늘만 - 가로 방향) */}
                {workDay.status === 'current' && (
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: `${workDay.percentage}%`,
                      backgroundColor: progressColor,
                      boxShadow: progressShadow,
                      transition: "all 0.3s ease-out",
                    }}
                  />
                )}
                {/* 지난 날짜는 완전히 채워진 배경 */}
                {workDay.status === 'elapsed' && (
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
      </div>
    </div>
  );
};

