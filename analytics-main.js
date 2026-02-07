/* analytics-main.js: computes study data from localStorage and exposes a recompute function */

const DAILY_KEY = "studyTimeData";
const SUBJECT_KEY = "subjectTimeData";

function minutes(sec) {
  return Math.round(sec / 60);
}

function getLast7DaysFromDaily(dailyData) {
  const days = [];
  const mins = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);

    const key =
      d.getFullYear() + "-" +
      (d.getMonth() + 1) + "-" +
      d.getDate();

    days.push(d.toLocaleDateString("en-US", { weekday: "short" }));
    mins.push(dailyData[key] || 0);
  }

  return { days, mins };
}

function computeStudyData({ dailyDataOverride, subjectSecondsOverride } = {}) {
  const dailyData = dailyDataOverride || JSON.parse(localStorage.getItem(DAILY_KEY) || "{}");
  const subjectSeconds = subjectSecondsOverride || JSON.parse(localStorage.getItem(SUBJECT_KEY) || "{}");

  // weekly
  const weekly = getLast7DaysFromDaily(dailyData);

  // subjects (in minutes)
  const subjects = {};
  for (const sub in subjectSeconds) {
    subjects[sub] = minutes(subjectSeconds[sub]);
  }

  // monthly
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthly = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const key = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + d;
    monthly.push(dailyData[key] || 0);
  }

  // yearly
  const yearly = Array(12).fill(0);
  for (const key in dailyData) {
    const [y, m] = key.split("-").map(Number);
    if (y === now.getFullYear()) {
      yearly[m - 1] += dailyData[key];
    }
  }

  // summary
  const totalMinutes = Object.values(dailyData).reduce((a, b) => a + b, 0);
  const totalHours = +(totalMinutes / 60).toFixed(1);
  const totalSessions = Object.values(dailyData).filter(v => v > 0).length;
  const avgSession = totalSessions ? Math.round(totalMinutes / totalSessions) : 0;

  // best streak
  const dates = Object.keys(dailyData)
    .filter(k => dailyData[k] > 0)
    .map(k => {
      const [y, m, d] = k.split("-").map(Number);
      return new Date(y, m - 1, d).getTime();
    })
    .sort((a, b) => a - b);

  let bestStreak = 0, current = 0, prev = null;
  for (const ts of dates) {
    if (prev === null || ts - prev === 24 * 3600 * 1000) {
      current++;
    } else {
      current = 1;
    }
    if (current > bestStreak) bestStreak = current;
    prev = ts;
  }

  const summary = { totalHours, totalSessions, avgSession, bestStreak };

  return {
    weekly: { days: weekly.days, minutesPerDay: weekly.mins },
    subjects,
    monthly,
    yearly,
    summary
  };
}

// expose
window.computeStudyData = computeStudyData;
window.studyData = computeStudyData();