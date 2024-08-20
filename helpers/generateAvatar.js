const { createCanvas } = require("canvas");

const colors = [
  "#F44336", // Red
  "#E91E63", // Pink
  "#9C27B0", // Purple
  "#673AB7", // Deep Purple
  "#3F51B5", // Indigo
  "#2196F3", // Blue
  "#03A9F4", // Light Blue
  "#00BCD4", // Cyan
  "#009688", // Teal
  "#4CAF50", // Green
  "#8BC34A", // Light Green
  "#CDDC39", // Lime
  "#FFEB3B", // Yellow
  "#FFC107", // Amber
  "#FF9800", // Orange
];

function getRandomColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}

const createAvatar = (initials) => {
  const size = 100;
  const canvas = createCanvas(size, size);
  const context = canvas.getContext("2d");

  // Випадковий колір фону
  const bgColor = getRandomColor();
  context.fillStyle = bgColor;
  context.fillRect(0, 0, size, size);

  // Налаштування шрифту та кольору тексту
  context.font = "50px Arial";
  context.fillStyle = "white";
  context.textAlign = "center";
  context.textBaseline = "middle";

  // Малювання тексту (ініціалів)
  context.fillText(initials, size / 2, size / 2);

  // Перетворення на base64
  return canvas.toDataURL();
};

const generateAvatar = (name) => {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("");
  return createAvatar(initials);
};

module.exports = generateAvatar;
