import React from "react";
import { type TimeItem, useColorLogic } from "../hooks/useTimeLeft";

interface DayCardProps {
  item: TimeItem;
  isActive: boolean;
  isHidden: boolean;
  onClick: () => void;
}

export const DayCard: React.FC<DayCardProps> = ({
  item,
  isActive,
  isHidden,
  onClick,
}) => {
  const { percentage, specs, title, type } = item;
  const { progressColor, progressShadow, containerColor } =
    useColorLogic(percentage);

  const circleCircumference = 76; // Approx 2 * PI * 12
  const maxOffset = 566;
  const circleAmount = (circleCircumference / 100) * percentage;
  const strokeDashoffset = maxOffset - circleAmount;

  const style: React.CSSProperties = {
    display: isHidden ? "none" : "flex",
  };

  const progressLineStyle: React.CSSProperties = {
    width: `${percentage}%`,
    backgroundColor: progressColor,
    boxShadow: progressShadow,
  };

  const progressContainerStyle: React.CSSProperties = {
    backgroundColor: containerColor,
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
                      strokeDashoffset={strokeDashoffset}
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
      <div className="c-card-footer">
        <div className="a-progress" style={progressContainerStyle}>
          <div className="a-progress-line" style={progressLineStyle}></div>
        </div>
      </div>
    </div>
  );
};

