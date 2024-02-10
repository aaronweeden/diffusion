const WORLD_WIDTH = 512;
const WORLD_HEIGHT = 256;

const SIZES = [
    {
        ROW_COUNT: 8,
        COL_COUNT: 16
    },
    {
        ROW_COUNT: 16,
        COL_COUNT: 32
    },
    {
        ROW_COUNT: 32,
        COL_COUNT: 64
    },
    {
        ROW_COUNT: 64,
        COL_COUNT: 128
    }
];

let RowCount;
let ColCount;
let CellCount;
let RowHeight;
let ColWidth;
let Time = 0;
let OverallAverage = 0;
let CellValues = [];
let NextCellValues = [];
let DragValue = 100;
let IsDragging = false;
let IsRunning = false;
let Interval;

onload = function () {
  resize();
}

function resize() {
  const size = SIZES[document.getElementById('sizeSelect').selectedIndex];
  RowCount = size.ROW_COUNT;
  ColCount = size.COL_COUNT;
  CellCount = RowCount * ColCount;
  RowHeight = (WORLD_HEIGHT / RowCount) - 1 + 'px';
  ColWidth = (WORLD_WIDTH / ColCount) - 1 + 'px';
  const cells = document.getElementById('cells');
  cells.replaceChildren();
  for (let rowIdx = 0; rowIdx < RowCount; rowIdx++) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'row';
    for (let colIdx = 0; colIdx < ColCount; colIdx++) {
      const cellDiv = document.createElement('div');
      cellDiv.id = 'cell_' + rowIdx + '_' + colIdx;
      cellDiv.className = 'cell';
      cellDiv.style.width = ColWidth;
      cellDiv.style.height = RowHeight;
      cellDiv.addEventListener('mousedown', function (evt) {
        event.preventDefault();
        IsDragging = true;
        DragValue = (100 === CellValues[rowIdx][colIdx]) ? 0 : 100;
        dragCell(evt);
      });
      cellDiv.addEventListener('mousemove', function (evt) {
        if (IsDragging) {
          dragCell(evt);
        }
      });
      document.addEventListener('mouseup', function () {
        IsDragging = false;
      });
      rowDiv.appendChild(cellDiv);
    }
    cells.appendChild(rowDiv);
  }
  reset();
}

function reset() {
  stop();
  Time = 0;
  document.getElementById('time').innerHTML = Time;
  CellValues = [];
  NextCellValues = [];
  OverallAverage = 0;
  document.getElementById('average').innerHTML = '0.00';
  for (let rowIdx = 0; rowIdx < RowCount; rowIdx++) {
    CellValues[rowIdx] = [];
    NextCellValues[rowIdx] = [];
    for (let colIdx = 0; colIdx < ColCount; colIdx++) {
      CellValues[rowIdx][colIdx] = 0;
      document.getElementById(
        'cell_' + rowIdx + '_' + colIdx
      ).style.backgroundColor = 'blue';
    }
  }
}

function dragCell(evt) {
  const id = evt.target.id;
  const pieces = id.split('_');
  const rowIdx = parseInt(pieces[1]);
  const colIdx = parseInt(pieces[2]);
  if (!IsRunning) {
    OverallAverage -= CellValues[rowIdx][colIdx] / CellCount;
    CellValues[rowIdx][colIdx] = DragValue;
    OverallAverage += CellValues[rowIdx][colIdx] / CellCount;
    document.getElementById('average').innerHTML = OverallAverage.toFixed(2);
    evt.target.style.backgroundColor = 100 === DragValue ? 'red' : 'blue';
  }
}

function startStop() {
  startStopButton = document.getElementById('startStopButton');
  if ('Start' === startStopButton.innerHTML) {
    start();
  } else {
    stop();
  }
}

function start() {
  startStopButton = document.getElementById('startStopButton');
  stepButton = document.getElementById('stepButton');
  startStopButton.innerHTML = 'Stop';
  stepButton.disabled = true;
  Interval = setInterval(step, 60);
}

function stop() {
  startStopButton = document.getElementById('startStopButton');
  startStopButton.innerHTML = 'Start';
  stepButton.disabled = false;
  clearInterval(Interval);
}

function step() {
  for (let rowIdx = 0; rowIdx < RowCount; rowIdx++) {
    for (let colIdx = 0; colIdx < ColCount; colIdx++) {
      if (100 === CellValues[rowIdx][colIdx]) {
        continue;
      }
      NextCellValues[rowIdx][colIdx] = 0.25 * (
        (
            0 === rowIdx
            ? 0
            : CellValues[rowIdx - 1][colIdx]
        )
        + (
            0 === colIdx
            ? 0
            : CellValues[rowIdx][colIdx - 1]
        )
        + (
            RowCount - 1 === rowIdx
            ? 0
            : CellValues[rowIdx + 1][colIdx]
        )
        + (
            ColCount - 1 === colIdx
            ? 0
            : CellValues[rowIdx][colIdx + 1]
        )
      )
    }
  }
  OverallAverage = 0;
  for (let rowIdx = 0; rowIdx < RowCount; rowIdx++) {
    for (let colIdx = 0; colIdx < ColCount; colIdx++) {
      if (100 === CellValues[rowIdx][colIdx]) {
        OverallAverage += 100;
        continue;
      }
      const value = CellValues[rowIdx][colIdx] = (
        NextCellValues[rowIdx][colIdx]
      );
      OverallAverage += CellValues[rowIdx][colIdx];
      let red, green, blue;
      if (value <= 33) {
        red = green = (value * 255 / 33);
        blue = 255 - (value * 255 / 33)
      } else {
        red = 255;
        green = 255 - ((value - 33) * 255 / 67)
        blue = 0;
      }
      document.getElementById(
        'cell_' + rowIdx + '_' + colIdx
      ).style.backgroundColor = (
        'rgb(' + red + ', ' + green + ', ' + blue + ')'
      );
    }
  }
  OverallAverage /= CellCount;
  document.getElementById('average').innerHTML = OverallAverage.toFixed(2);
  Time++;
  document.getElementById('time').innerHTML = Time;
}
