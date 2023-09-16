let canvas = document.createElement("canvas");
let context;
let x;
let y;
let thickness = 5;
let color = "#e66465";
let isDrawing = false;
let isEraser = false;
let eraserColor = color;
const whiteBoard = document.getElementById("white-board");
const whiteBoardControls = document.getElementById("white-board-controls");
let whiteBoardActive = false;
const reduceThick = document.getElementById("reduce-brush-thickness");
const addThick = document.getElementById("add-brush-thickness");
const brushColor = document.getElementById("brush-color");
brushColor.value = color;
const brushThickness = document.getElementById("brush-thickness");
brushThickness.innerHTML = thickness;
const eraser = document.getElementById("white-board-eraser");

whiteBoard.addEventListener("click", () => {
  if (!whiteBoardActive) {
    startWhiteBoard();
    whiteBoardActive = true;
    whiteBoard.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
    whiteBoardTrack.send("start-whiteboard");
  } else {
    appActive = false;
    whiteBoardActive = false;
    appContainer.style.display = "none";
    resizeVideos();
    whiteBoard.innerHTML = '<i class="fa-solid fa-chalkboard"></i>';
    whiteBoardTrack.send("end-whiteboard");
  }
});

addThick.onclick = () => {
  thickness++;
  brushThickness.innerHTML = thickness;
};
reduceThick.onclick = () => {
  thickness--;
  brushThickness.innerHTML = thickness;
};
eraser.onclick = () => {
  if (!isEraser) {
    color = "#FFFFFF";
    isEraser = true;
    eraser.style.color = "orange";
  } else {
    color = eraserColor;
    isEraser = false;
    eraser.style.color = "";
  }
};
brushColor.oninput = (event) => {
  color = event.target.value;
  eraserColor = color;
};
const startWhiteBoard = () => {
  appActive = true;
  appContainer.style.display = "flex";
  appContainer.innerHTML = "";
  resizeVideos("whiteboard");

  canvas.id = "white-board-canvas";
  canvas.className = "white-board-canvas";
  context = canvas.getContext("2d");
  context.lineJoin = "round";

  const whiteBoardDiv = document.createElement("div");
  whiteBoardDiv.className = "white-board";
  whiteBoardDiv.append(whiteBoardControls, canvas);
  whiteBoardControls.style.display = "flex";
  appContainer.append(whiteBoardDiv);

  appContainer.clientWidth >= appContainer.clientHeight
    ? (whiteBoardDiv.style.height = "100%")
    : (whiteBoardDiv.style.width = "100%");
  canvas.height = whiteBoardDiv.clientHeight - 2;
  canvas.width = whiteBoardDiv.clientWidth - 2;
};

canvas.onmousedown = (e) => {
  const coordinates = getCoordinates(e.clientX, e.clientY);
  x = coordinates.x;
  y = coordinates.y;
  isDrawing = true;
  canvas.onmousemove = (event) => {
    if (isDrawing) {
      const coordinates1 = getCoordinates(event.clientX, event.clientY);
      const x1 = coordinates1.x;
      const y1 = coordinates1.y;
      draw(x, y, x1, y1, thickness, color);
      whiteBoardTrack.send(
        JSON.stringify({
          x: x,
          y: y,
          x1: x1,
          y1: y1,
          thickness: thickness,
          color: color,
          canvasH: canvas.height,
          canvasW: canvas.width,
        })
      );
      x = x1;
      y = y1;
    }
  };
};

canvas.onmouseup = () => {
  isDrawing = false;
  canvas.onmousemove = null;
};

const draw = (xx, yy, xx1, yy1, thickness1, color1) => {
  context.strokeStyle = color1;
  context.lineWidth = thickness1;
  context.beginPath();
  context.moveTo(xx, yy);
  context.lineTo(xx1, yy1);
  context.closePath();
  context.stroke();
};

const getCoordinates = (clientX, clientY) => {
  const rect = canvas.getBoundingClientRect();
  const x = ((clientX - rect.left) / (rect.right - rect.left)) * canvas.width;
  const y = ((clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height;
  return { x: x, y: y };
};
