import { useState, useEffect } from "react";
import { getWorkdaySettings } from "../utils/workdaySettings";

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

export interface TimeSpec {
  value: string;
  label: string;
}

export interface TimeItem {
  type: string;
  title: string;
  percentage: number;
  specs: { [key: string]: string }; // e.g. "ms": "1,000"
}

export const TIME_TYPES = [
  "hour",
  "day",
  "workday",
  "week",
  "workweek",
  "month",
  "year",
  "decade",
  "century",
  "millenium",
] as const;

export type TimeType = (typeof TIME_TYPES)[number];

function numberWithCommas(x: number) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function hslToHex(h: number, s: number, l: number) {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function useTimeLeft() {
  const [times, setTimes] = useState<Record<string, TimeItem>>({});

  const calculate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const weekday = now.getDay();
    const day = now.getDate();
    const hour = now.getHours();
    const time = now.getTime();
    const yearLastDigit = parseInt(year.toString().substring(3));

    const msHour = 3600000;
    const msDay = 86400000;

    const newTimes: Record<string, TimeItem> = {};

    TIME_TYPES.forEach((type) => {
      let start = 0;
      let end = 0;
      let diff = 0;
      let amount = 0;

      let msLeft = 0;
      let secondsLeft = 0;
      let minutesLeft = 0;
      let hoursLeft = 0;
      let daysLeft = 0;
      let weeksLeft = 0;
      let monthsLeft = 0;
      let yearsLeft = 0;
      let decadesLeft = 0;
      // let centuriesLeft = 0; // Not used in original explicitly as variable but calculated

      const specs: { [key: string]: string } = {};

      switch (type) {
        case "hour":
          start = new Date(year, month, day, hour).getTime();
          end = start + msHour;
          diff = time - start;
          amount = diff / msHour;

          msLeft = Math.round(end - time);
          specs["ms"] = numberWithCommas(msLeft);
          secondsLeft = Math.floor((end - time) * 0.001);
          specs["s"] = numberWithCommas(secondsLeft);
          minutesLeft = Math.floor(secondsLeft / 60);
          specs["m"] = numberWithCommas(minutesLeft);
          break;

        case "day":
          start = new Date(year, month, day).getTime();
          end = start + msDay;
          diff = time - start;
          amount = diff / msDay;

          secondsLeft = Math.floor((end - time) * 0.001);
          specs["s"] = numberWithCommas(secondsLeft);
          minutesLeft = Math.floor(secondsLeft / 60);
          specs["m"] = numberWithCommas(minutesLeft);
          hoursLeft = Math.floor(minutesLeft / 60);
          specs["h"] = numberWithCommas(hoursLeft);
          break;

        case "week":
          // Logic form original:
          // if weekday == 1 (Monday) -> start today
          // if weekday == 0 (Sunday) -> monday = day - 6
          // else -> monday = day - weekday + 1
          if (weekday === 1) {
            start = new Date(year, month, day).getTime();
          } else if (weekday === 0) {
            const monday = day - 6;
            if (monday >= 0) {
              start = new Date(year, month, monday).getTime();
            } else {
              start = new Date(year, month).getTime() - msDay * (monday * -1);
            }
          } else {
            const monday = day - weekday + 1;
            if (monday >= 0) {
              start = new Date(year, month, monday).getTime();
            } else {
              start = new Date(year, month).getTime() - msDay * (monday * -1);
            }
          }
          end = start + msDay * 7;
          diff = time - start;
          amount = diff / (end - start);

          secondsLeft = Math.floor((end - time) * 0.001);
          minutesLeft = Math.floor(secondsLeft / 60);
          specs["m"] = numberWithCommas(minutesLeft);
          hoursLeft = Math.floor(minutesLeft / 60);
          specs["h"] = numberWithCommas(hoursLeft);
          daysLeft = Math.floor(hoursLeft / 24);
          specs["d"] = numberWithCommas(daysLeft);
          break;

        case "workweek":
          // 설정에서 근무 요일 가져오기
          const workweekSettings = getWorkdaySettings();
          const workweekDays = workweekSettings.workdays;
          
          // 근무 요일 목록 생성 (0=일요일, 1=월요일, ..., 6=토요일)
          const enabledWorkdays: number[] = [];
          Object.entries(workweekDays).forEach(([dayName, enabled]) => {
            if (enabled) {
              const dayNum = getDayOfWeekNumber(dayName);
              if (dayNum >= 0) {
                enabledWorkdays.push(dayNum);
              }
            }
          });
          
          if (enabledWorkdays.length === 0) {
            // 근무 요일이 없으면 0%로 설정
            amount = 0;
            specs["d"] = "0";
            specs["h"] = "0";
            specs["m"] = "0";
            break;
          }
          
          // 현재 주의 시작일 찾기 (가장 이른 근무 요일)
          const currentWeekday = weekday; // 0=일요일, 1=월요일, ..., 6=토요일
          const earliestWorkday = Math.min(...enabledWorkdays);
          const latestWorkday = Math.max(...enabledWorkdays);
          
          // 현재 주의 시작일 계산 (가장 이른 근무 요일)
          let weekStartDay = day;
          if (currentWeekday < earliestWorkday) {
            // 현재 요일이 가장 이른 근무 요일보다 이전이면, 이전 주의 가장 이른 근무 요일
            weekStartDay = day - 7 + (earliestWorkday - currentWeekday);
          } else if (currentWeekday > earliestWorkday) {
            // 현재 요일이 가장 이른 근무 요일보다 이후면, 이번 주의 가장 이른 근무 요일
            weekStartDay = day - (currentWeekday - earliestWorkday);
          }
          
          // 현재 주의 종료일 계산 (가장 늦은 근무 요일의 종료 시간)
          const weekEndDay = weekStartDay + (latestWorkday - earliestWorkday);
          
          // 주의 시작 시간 (가장 이른 근무 요일의 시작 시간)
          const weekStartTime = new Date(
            year,
            month,
            weekStartDay,
            workweekSettings.startHour,
            workweekSettings.startMinute
          ).getTime();
          
          // 주의 종료 시간 (가장 늦은 근무 요일의 종료 시간)
          const weekEndTime = new Date(
            year,
            month,
            weekEndDay,
            workweekSettings.endHour,
            workweekSettings.endMinute
          ).getTime();
          
          const weekDuration = weekEndTime - weekStartTime;
          
          // 현재 시간이 주의 시작 시간 이전이면 0%, 종료 시간 이후면 100%
          if (time < weekStartTime) {
            amount = 0;
            secondsLeft = Math.floor((weekEndTime - weekStartTime) * 0.001);
          } else if (time >= weekEndTime) {
            amount = 1;
            secondsLeft = 0;
          } else {
            // 현재 시간이 주 내에 있는 경우
            // 현재까지의 근무 시간 계산
            let elapsedTime = 0;
            
            // 주의 시작일부터 현재 날짜까지의 각 근무일 계산
            for (let d = weekStartDay; d <= day; d++) {
              const checkDate = new Date(year, month, d);
              const checkWeekday = checkDate.getDay();
              
              if (enabledWorkdays.includes(checkWeekday)) {
                const dayStartTime = new Date(
                  year,
                  month,
                  d,
                  workweekSettings.startHour,
                  workweekSettings.startMinute
                ).getTime();
                const dayEndTime = new Date(
                  year,
                  month,
                  d,
                  workweekSettings.endHour,
                  workweekSettings.endMinute
                ).getTime();
                
                if (d < day) {
                  // 과거 날짜는 전체 근무 시간 추가
                  elapsedTime += dayEndTime - dayStartTime;
                } else if (d === day) {
                  // 오늘 날짜는 현재 시간까지의 경과 시간 추가
                  if (time >= dayStartTime && time < dayEndTime) {
                    elapsedTime += time - dayStartTime;
                  } else if (time >= dayEndTime) {
                    elapsedTime += dayEndTime - dayStartTime;
                  }
                }
              }
            }
            
            amount = elapsedTime / weekDuration;
            secondsLeft = Math.floor((weekEndTime - time) * 0.001);
          }
          
          minutesLeft = Math.floor(secondsLeft / 60);
          specs["m"] = numberWithCommas(minutesLeft);
          hoursLeft = Math.floor(minutesLeft / 60);
          specs["h"] = numberWithCommas(hoursLeft);
          daysLeft = Math.floor(hoursLeft / 24);
          specs["d"] = numberWithCommas(daysLeft);
          break;

        case "month":
          start = new Date(year, month).getTime();
          if (month === 11) {
            end = new Date(year + 1, 0).getTime();
          } else {
            end = new Date(year, month + 1).getTime();
          }
          diff = time - start;
          amount = diff / (end - start);

          secondsLeft = Math.floor((end - time) * 0.001);
          minutesLeft = Math.floor(secondsLeft / 60);
          specs["m"] = numberWithCommas(minutesLeft);
          hoursLeft = Math.floor(minutesLeft / 60);
          specs["h"] = numberWithCommas(hoursLeft);
          // Original code repeats 'h' twice, assuming it meant 'd' for the second one?
          // No, original:
          // item.querySelector('.f-time-specs-h').innerText = numberWithCommas(hoursLeft);
          // hoursLeft = Math.floor(minutesLeft / 60);
          // item.querySelector('.f-time-specs-h').innerText = numberWithCommas(hoursLeft);
          // It seems redundant but effectively sets H.
          // Then days:
          daysLeft = Math.floor(hoursLeft / 24);
          specs["d"] = numberWithCommas(daysLeft);
          break;

        case "year":
          start = new Date(year, 0).getTime();
          end = new Date(year + 1, 0).getTime();
          diff = time - start;
          amount = diff / (end - start);

          secondsLeft = Math.floor((end - time) * 0.001);
          minutesLeft = Math.floor(secondsLeft / 60);
          hoursLeft = Math.floor(minutesLeft / 60);
          daysLeft = Math.floor(hoursLeft / 24);
          specs["d"] = numberWithCommas(daysLeft);
          weeksLeft = Math.floor(daysLeft / 7);
          specs["w"] = numberWithCommas(weeksLeft);
          monthsLeft = Math.floor(daysLeft / 30);
          specs["mo"] = numberWithCommas(monthsLeft);
          break;

        case "decade":
          if (yearLastDigit === 1) {
            start = new Date(year, 0).getTime();
            end = new Date(year + 10, 0).getTime();
          } else if (yearLastDigit === 0) {
            start = new Date(year - 9, 0).getTime();
            end = new Date(year + 1, 0).getTime();
          } else {
            start = new Date(year - (yearLastDigit - 1), 0).getTime();
            end = new Date(year + (11 - yearLastDigit), 0).getTime();
          }
          diff = time - start;
          amount = diff / (end - start);

          secondsLeft = Math.floor((end - time) * 0.001);
          minutesLeft = Math.floor(secondsLeft / 60);
          hoursLeft = Math.floor(minutesLeft / 60);
          daysLeft = Math.floor(hoursLeft / 24);
          weeksLeft = Math.floor(daysLeft / 7);
          specs["w"] = numberWithCommas(weeksLeft);
          monthsLeft = Math.floor(daysLeft / 30);
          specs["mo"] = numberWithCommas(monthsLeft);
          yearsLeft = Math.floor(monthsLeft / 12);
          specs["y"] = numberWithCommas(yearsLeft);
          break;

        case "century":
          start = new Date(2001, 0).getTime();
          end = new Date(2101, 0).getTime();
          diff = time - start;
          amount = diff / (end - start);

          secondsLeft = Math.floor((end - time) * 0.001);
          minutesLeft = Math.floor(secondsLeft / 60);
          hoursLeft = Math.floor(minutesLeft / 60);
          daysLeft = Math.floor(hoursLeft / 24);
          monthsLeft = Math.floor(daysLeft / 30);
          specs["mo"] = numberWithCommas(monthsLeft);
          yearsLeft = Math.floor(monthsLeft / 12);
          specs["y"] = numberWithCommas(yearsLeft);
          decadesLeft = Math.floor(yearsLeft / 10);
          specs["de"] = numberWithCommas(decadesLeft);
          break;

        case "millenium":
          const startYear = 2001;
          const endYear = 3001;
          amount = (year - startYear) / (endYear - startYear);

          specs["y"] = numberWithCommas(endYear - year);
          specs["de"] = numberWithCommas(Math.floor((endYear - year) / 10));
          specs["c"] = numberWithCommas(Math.floor((endYear - year) / 100));
          break;

        case "workday":
          // localStorage에서 설정값 가져오기
          const workdaySettings = getWorkdaySettings();
          const workStartHour = workdaySettings.startHour;
          const workStartMinute = workdaySettings.startMinute;
          const workEndHour = workdaySettings.endHour;
          const workEndMinute = workdaySettings.endMinute;
          
          const workStartTime = new Date(year, month, day, workStartHour, workStartMinute).getTime();
          const workEndTime = new Date(year, month, day, workEndHour, workEndMinute).getTime();
          const workDuration = workEndTime - workStartTime;
          
          // 현재 시간이 출근 시간 이전이면 0%, 퇴근 시간 이후면 100%
          if (time < workStartTime) {
            amount = 0;
            // 남은 시간을 출근 시간부터 계산
            secondsLeft = Math.floor((workEndTime - workStartTime) * 0.001);
          } else if (time >= workEndTime) {
            amount = 1;
            secondsLeft = 0;
          } else {
            diff = time - workStartTime;
            amount = diff / workDuration;
            secondsLeft = Math.floor((workEndTime - time) * 0.001);
          }
          
          minutesLeft = Math.floor(secondsLeft / 60);
          specs["m"] = numberWithCommas(minutesLeft);
          hoursLeft = Math.floor(minutesLeft / 60);
          specs["h"] = numberWithCommas(hoursLeft);
          break;
      }

      let percentage = Math.floor(amount * 100);
      let title = type.charAt(0).toUpperCase() + type.slice(1);
      if (type === "workday") {
        title = "Work Day";
      } else if (type === "workweek") {
        title = "Work Week";
      }
      newTimes[type] = {
        type,
        title,
        percentage,
        specs,
      };
    });

    setTimes(newTimes);
  };

  useEffect(() => {
    calculate();
    const interval = setInterval(() => {
      calculate();
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return times;
}

export function useColorLogic(percentage: number) {
  const hue = Math.floor(199 - (199 / 100) * percentage);
  const hueLight = hue + 10;

  const progressColor = hslToHex(hue, 56, 52);
  const progressShadow = `0 0 .5em ${hslToHex(hueLight, 76, 62)}`;
  const containerColor = hslToHex(hue, 15, 35);
  // Original SVG: <circle r="12" ... stroke-dasharray="565.48" ...>
  // Wait, 2 * pi * 12 = 75.39.
  // Why 565.48?
  // Ah, the svg in original:
  // <svg width="36" height="36" viewPort="0 0 18 18" ...>
  // <circle ... r="12" cx="18" cy="18" ... stroke-dasharray="565.48" ...>
  // 565.48 / (2 * pi * 12) = 565.48 / 75.4 = ~7.5 ?
  // Maybe the circle is scaled?
  // Let's preserve the constant 565.48 and the calculation logic.
  // circleAmount = 76 / 100 * percentage; // 76 seems to be the circumference used?
  // strokeDashoffset = (566 - circleAmount) + 'px';
  // Wait, if circumference is ~76 (75.4), then 566 is huge.
  // Maybe it loops multiple times?
  // Or maybe the r is different?
  // Original is: <circle class="f-time-circle-line" r="12" cx="18" cy="18" ...>
  // Script: item.querySelector('.f-time-circle-progress').style.strokeDashoffset = (566 - circleAmount) + 'px';

  // I will just export these helpers or calculated values.

  return {
    progressColor,
    progressShadow,
    containerColor,
  };
}
