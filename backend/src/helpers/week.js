function getWeekRange(date = new Date()) {
  const day = date.getDay(); // 0 sunday, 1 monday...
  const monday = new Date(date);
  monday.setDate(date.getDate() - (day === 0 ? 6 : day - 1));

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    week_start: monday.toISOString().slice(0, 10),
    week_end: sunday.toISOString().slice(0, 10)
  };
}

// Convert: "Wednesday" + week_start → tanggal fix (YYYY-MM-DD)
function convertDayNameToDate(dayName, weekStartDate) {
  const daysMap = {
    Monday: 0,
    Tuesday: 1,
    Wednesday: 2,
    Thursday: 3,
    Friday: 4,
    Saturday: 5,
    Sunday: 6
  };

  const offset = daysMap[dayName];
  const start = new Date(weekStartDate);
  
  start.setDate(start.getDate() + offset);

  return start.toISOString().slice(0, 10);
}

module.exports = { getWeekRange, convertDayNameToDate };
