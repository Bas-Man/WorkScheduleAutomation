const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const weekRowIndex = [39,40,41,42,43,44];
const dateToRow = {
  18: 3,
  19: 4,
  20: 5,
  21: 6,
  22: 7,
  23: 8,
  24: 9,
  25: 10,
  26: 11,
  27: 12,
  28: 13,
  29: 14,
  30: 15,
  31: 16,
  1: 17,
  2: 18,
  3: 19,
  4: 20,
  5: 21,
  6: 22,
  7: 23,
  8: 24,
  9: 25,
  10: 26,
  11: 27,
  12: 28,
  13: 29,
  14: 30,
  15: 31,
  16: 32,
  17: 33,
}

const year = 2025

function createDate(year, month, date) {
  return new Date(month + " " + date + ", " + year + " 00:00:00");
}

function getNumberOfRows(dayIndex) {
  return 7 - dayIndex -1;
}

// Find the weekday of the 18th as an integer 0 = Monday, 1 = Tuesday....
function firstDayOfMonth(date) {
  const dayIndex = date.getDay();
  // 0 defaults to Sunday, the next line changes 0 to Monday and hence Sunday is 6
  return dayIndex === 0 ? 6 : dayIndex-1;
}

// Find the last date of the month. 
// Example February usually only has 28 days, but has 29 for leap year.
function lastDateOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function getSummaryRowIndexes(date) {
  let rowRanges = [];
  let firstRow = new Date(date);
  let lastRow = new Date(date);
  lastRow = new Date(lastRow.setDate(firstRow.getDate() + getNumberOfRows(firstDayOfMonth(date))));
  if (firstDayOfMonth(date) !== 0) {
    rowRanges.push([dateToRow[firstRow.getDate()], dateToRow[lastRow.getDate()]]);
  }
  while ((33 - dateToRow[lastRow.getDate()]) > 7) {
    firstRow = new Date(lastRow.getFullYear(), lastRow.getMonth(), lastRow.getDate() +1);
    lastRow.setDate(lastRow.getDate() + 7);
    rowRanges.push([dateToRow[firstRow.getDate()],dateToRow[lastRow.getDate()]]);
  
  }
  if (lastRow.getDate() <= 33) {
    firstRow.setDate(firstRow.getDate() + 7);
    rowRanges.push([dateToRow[firstRow.getDate()],33]);
  }
  return rowRanges;
}

function defaultFormulaStrings(startRow, cells) {
  let formula = [];

  cells.forEach((row, index) => { 
    const start = row[0] - startRow ;
    const end = row[1] - startRow;
    if (start === end) {
      formula.push(`=sum(R[${start - index}]C[0])`)
    } else {
    formula.push(`=sum(R[${start - index}]C[0]:R[${end - index}]C[0])`)
    }
  });
  return formula;
}
function travelFormulaStrings(startRow, cells) {
  let formula = [];

  cells.forEach((row, index) => { 
    const start = row[0] - startRow ;
    const end = row[1] - startRow;
    if (start === end) {
      formula.push(`=sum(R[${start - index}]C[-1])`)
    } else {
    formula.push(`=sum(R[${start - index}]C[-1]:R[${end - index}]C[-1])`)
    }
  });
  return formula;
}

function bonusFormulaStrings(startRow, cells) {
  let formula = [];

  cells.forEach((row, index) => { 
    const start = row[0] - startRow ;
    const end = row[1] - startRow;
    if (start === end) {
      formula.push(`=sum(R[${start - index}]C[1])`)
    } else {
    formula.push(`=sum(R[${start - index}]C[1]:R[${end - index}]C[1])`)
    }
  });
  return formula;
}

function weeklySummary() {
  const date = new Date();
  if (date.getMonth() != 0) {
    console.log("This does not need to be run!!");
    return
  }
  const year = date.getFullYear();
  let start_date = createDate(year, "January", 18);
  const ss = openSpreadSheet()
  const sheet = ss.getSheetByName(year);
  sheet.getRange("A1").setValue(year)
  for (let i=0; i < 12; i++) {
    let startRow = 39;
    let column = months[start_date.toLocaleString('default', { month: 'long' })];
    let cells = getSummaryRowIndexes(start_date);
    var formulas = defaultFormulaStrings(startRow, cells);
    formulas.forEach(formula => {
      sheet.getRange(startRow,column).setFormulaR1C1(formula);
      startRow +=1;
    });
    // Copy basic formula to all cells
    let cellReference = sheet.getRange(39,column,6);
    cellReference.copyTo(sheet.getRange(39,column + 1, 6,4));
    
    // Adjust travel cells
    startRow = 39;
    formulas = travelFormulaStrings(startRow, cells);
    formulas.forEach(formula => {
      sheet.getRange(startRow,column + 3).setFormulaR1C1(formula);
      startRow +=1;
    });
    
    // Adjust Bonus cells
    startRow = 39;
    formulas = bonusFormulaStrings(startRow, cells);
    formulas.forEach(formula => {
    sheet.getRange(startRow,column + 2).setFormulaR1C1(formula);
    startRow +=1;
    });
    start_date.setMonth(start_date.getMonth() + 1);
  }
  SpreadsheetApp.flush();
};

