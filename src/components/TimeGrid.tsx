import React, { useEffect } from "react";
import { useTimeLeft, TIME_TYPES } from "../hooks/useTimeLeft";
import { HourCard } from "./HourCard";
import { DayCard } from "./DayCard";
import { WeekCard } from "./WeekCard";
import { MonthCard } from "./MonthCard";
import { YearCard } from "./YearCard";
import { DecadeCard } from "./DecadeCard";
import { CenturyCard } from "./CenturyCard";
import { MilleniumCard } from "./MilleniumCard";
import { WorkDayCard } from "./WorkDayCard";
import { useLocation, useNavigate } from "react-router-dom";

export const TimeGrid: React.FC = () => {
  const times = useTimeLeft();
  const location = useLocation();
  const navigate = useNavigate();

  const hash = location.hash.replace("#", "");
  const activeType = hash || null;

  const handleCardClick = (type: string) => {
    if (activeType === type) {
      // Deactivate
      navigate("/");
    } else {
      // Activate
      navigate(`/#${type}`);
    }
  };

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!activeType) {
        if (event.key === "Enter") {
          handleCardClick("day"); // Default to day or first one? Original: nth-of-type(2) which is Day
        }
        return;
      }

      const currentIndex = TIME_TYPES.indexOf(activeType as any);
      if (currentIndex === -1) return;

      switch (event.key) {
        case "Escape":
          navigate("/");
          break;
        case "ArrowLeft":
        case "ArrowUp":
          const prevIndex =
            currentIndex > 0 ? currentIndex - 1 : TIME_TYPES.length - 1;
          navigate(`/#${TIME_TYPES[prevIndex]}`);
          break;
        case "ArrowRight":
        case "ArrowDown":
          const nextIndex =
            currentIndex < TIME_TYPES.length - 1 ? currentIndex + 1 : 0;
          navigate(`/#${TIME_TYPES[nextIndex]}`);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeType, navigate]);

  const hasActive = !!activeType;

  return (
    <div className={`m-cards ${hasActive ? "has-active" : ""}`}>
      <div className={`l-grid of-4 of-6-laptop of-12-phone`}>
        {/* Header Card - Only visible when NO active card */}
        <div className={`of-12-laptop ${hasActive ? "is-hidden" : ""}`}>
          <div className="c-card vgap">
            <div className="h-fill vgap">
              <h1 className="h4">Timeleft</h1>
              <p className="h5">Don't waste your time.</p>
              <div></div>
            </div>
            <div className="h6 l-stack">
              <div>
                + More info on{" "}
                <a href="https://github.com/aoueon/timeleft">GitHub</a>
              </div>
              <div>
                + Built by{" "}
                <a href="mailto:raulsimionas@gmail.com">Raoul Simionas</a>
              </div>
              <div>
                + Buy me a{" "}
                <a href="https://www.buymeacoffee.com/raoul">coffee</a>
              </div>
            </div>
          </div>
        </div>

        {/* Time Cards */}
        {TIME_TYPES.map((type) => {
          const item = times[type];
          if (!item) return null; // Wait for first render calculation

          const isActive = activeType === type;
          // If hasActive is true, hide all non-active cards.
          const isHidden = hasActive && !isActive;

          const cardProps = {
            item,
            isActive,
            isHidden,
            onClick: () => handleCardClick(type),
          };

          return (
            <div key={type}>
              {type === "hour" && <HourCard {...cardProps} />}
              {type === "day" && <DayCard {...cardProps} />}
              {type === "week" && <WeekCard {...cardProps} />}
              {type === "month" && <MonthCard {...cardProps} />}
              {type === "year" && <YearCard {...cardProps} />}
              {type === "decade" && <DecadeCard {...cardProps} />}
              {type === "century" && <CenturyCard {...cardProps} />}
              {type === "millenium" && <MilleniumCard {...cardProps} />}
              {type === "workday" && <WorkDayCard {...cardProps} />}
            </div>
          );
        })}
      </div>
    </div>
  );
};
