const maxTries = 6;
let currentTry = 0;
let currentGuess = [];
let wordle;
let gameActive = true;

const words = [
  "avion",
  "belle",
  "chien",
  "droit",
  "eclat",
  "forme",
  "givre",
  "havre",
  "ideal",
  "jouer",
  "lourd",
  "mains",
  "noyer",
  "ombre",
  "porte",
  "rouge",
  "sable",
  "table",
  "usure",
  "vivre",
  "wagon",
  "zebre",
];

document.addEventListener("DOMContentLoaded", () => {
  wordle = words[Math.floor(Math.random() * words.length)].toUpperCase();
  console.log("Mot à trouver (pour les tricheurs 😊) : ", wordle);
  createGrid(wordle.length);
  createKeyboard();
  document.addEventListener("keydown", handlePhysicalKeyboard);
});

const createGrid = (wordLength) => {
  const grid = document.getElementById("wordle-grid");
  for (let i = 0; i < maxTries; i++) {
    for (let j = 0; j < wordLength; j++) {
      let cell = document.createElement("div");
      cell.className = "cell";
      cell.id = `cell-${i}-${j}`;
      grid.appendChild(cell);
    }
  }
};

const createKeyboard = () => {
  const keyboard = document.getElementById("keyboard");
  const rows = ["AZERTYUIOP", "QSDFGHJKLM", "WXCVBN"];
  rows.forEach((row, rowIndex) => {
    let rowDiv = document.createElement("div");
    rowDiv.className = "key-row";
    for (let key of row) {
      rowDiv.appendChild(createButton(key));
    }
    if (rowIndex === 2) {
      let enterButton = createSpecialKey("↵");
      let backButton = createSpecialKey("⌫");
      rowDiv.insertBefore(enterButton, rowDiv.firstChild);
      rowDiv.appendChild(backButton);
    }
    keyboard.appendChild(rowDiv);
  });
};

const createButton = (key) => {
  let button = document.createElement("button");
  button.textContent = key;
  button.id = `key-${key}`;
  button.className = "key";
  button.addEventListener("click", () => handleKeyPress(key));
  return button;
};

const createSpecialKey = (text) => {
  let button = document.createElement("button");
  button.textContent = text;
  button.className = "key special";
  button.addEventListener("click", () => {
    if (text === "↵") {
      submitGuess();
    } else {
      deleteLast();
    }
  });
  return button;
};

const handlePhysicalKeyboard = (e) => {
  if (!gameActive) return;
  let key = e.key.toUpperCase();
  if (key.length === 1 && key >= "A" && key <= "Z") {
    handleKeyPress(key);
  } else if (e.key === "Enter") {
    submitGuess();
  } else if (e.key === "Backspace") {
    deleteLast();
  }
};

const handleKeyPress = (key) => {
  if (!gameActive || currentGuess.length >= wordle.length) return;
  currentGuess.push(key);
  let cell = document.getElementById(
    `cell-${currentTry}-${currentGuess.length - 1}`
  );
  cell.textContent = key;
};

const deleteLast = () => {
  if (!gameActive || currentGuess.length === 0) return;
  let lastIndex = currentGuess.length - 1;
  let lastCellId = `cell-${currentTry}-${lastIndex}`;
  let cell = document.getElementById(lastCellId);
  if (cell) {
    cell.textContent = "";
  } else {
    console.error(`Cell with id ${lastCellId} not found`);
  }
  currentGuess.pop();
};

const submitGuess = () => {
  if (currentGuess.length === wordle.length) {
    let guess = currentGuess.join("");
    for (let i = 0; i < wordle.length; i++) {
      setTimeout(() => {
        let cell = document.getElementById(`cell-${currentTry}-${i}`);
        let key = document.getElementById(`key-${currentGuess[i]}`);
        if (cell && key) {
          if (wordle[i] === currentGuess[i]) {
            cell.classList.add("correct");
            key.classList.add("correct");
            cell.classList.add("animated");
          } else if (wordle.includes(currentGuess[i])) {
            cell.classList.add("current");
            key.classList.add("current");
            cell.classList.add("animated");
          } else {
            cell.classList.add("missing");
            key.classList.add("missing");
          }
        } else {
          console.error("cell or key is undefined");
        }
      }, i * 500);
    }
    handleEndOfGuessSequence(guess);
  }
};

const handleEndOfGuessSequence = (guess) => {
  setTimeout(() => {
    if (guess === wordle) {
      showConfetti();
      showModal(
        `Bravo ! Vous avez trouvé le mot "${wordle}" après ${
          currentTry + 1
        } essai(s).`
      );
      gameActive = false;
    } else if (currentTry === maxTries - 1) {
      showModal(`Dommage ! Le mot était ${wordle}.`);
    }
    if (currentTry < maxTries - 1) {
      currentTry++;
      currentGuess = [];
    } else {
      currentTry = 0;
      currentGuess = [];
      // addReplayButton(); // Ajout du bouton pour rejouer ?
    }
  }, wordle.length * 500 + 500);
};

const showConfetti = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });
};

const showModal = (message) => {
  const modal = document.getElementById("modal");
  const messageParagraph = document.getElementById("resultMessage");
  const closeButton = document.querySelector(".close");
  let restartButton = document.getElementById("restartButton");
  if (!restartButton) {
    restartButton = document.createElement("button");
    restartButton.id = "restartButton";
    restartButton.textContent = "Recommencer";
    restartButton.className = "restart-button";
    modal.querySelector(".modal-content").appendChild(restartButton);
  }
  messageParagraph.textContent = message;
  modal.style.display = "block";
  closeButton.onclick = () => {
    modal.style.display = "none";
  };
  restartButton.onclick = () => {
    modal.style.display = "none";
    resetGame();
  };
  window.onclick = (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  };
};

const calculateScore = (triesUsed) => {
  return maxTries - triesUsed;
};

const resetGame = () => {
  gameActive = true;
  currentTry = 0;
  currentGuess = [];
  wordle = words[Math.floor(Math.random() * words.length)].toUpperCase();
  document.querySelectorAll(".cell").forEach((cell) => {
    cell.textContent = "";
    cell.className = "cell";
  });
  document.querySelectorAll(".key").forEach((key) => {
    key.classList.remove("correct", "current", "missing");
  });
};

console.log(`
_     _  _______  ______   ______   ___      _______
| | _ | ||       ||    _ | |      | |   |    |       |
| || || ||   _   ||   | || |  _    ||   |    |    ___|
|       ||  | |  ||   |_|| | | |   ||   |    |   |___
|       ||  |_|  ||    __ || |_|   ||   |___ |    ___|
|   _   ||       ||   |  |||       ||       ||   |___
|__| |__||_______||___|  |||______| |_______||_______|
`);
