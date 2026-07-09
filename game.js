const RESPONSES = [
  "The 2,000 voters in Nuneaton willing to consider both Labour and Conservative have decided they don't like your housing policy, and because of First Past the Post they are important, but the million adults who would like to move out of their childhood bedroom are not.\n\nI'm sorry, Prime Minister, but the lectern is ready for your resignation speech now, so is Steve Bray.",
  "The Electoral Commission return shows that nearly one pound in four of reported party donations came from one individual. The Chief Whip says it would be unwise to confuse a democratic mandate with party funding, particularly when the donor has asked for another Prime Minister.",
  "The Treasury has classified the National Housing Bank as a cost before anyone at the OBR has been allowed to treat the homes as assets. Planning permission for your political legacy has been denied.",
  "Council tax rates have not been revalued since 1991. While drafting your resignation letter, you realise you shouldn't have tried to fix things. Fixing things never works.",
  "A wealth tax is supported by the country at large, and indeed by most millionaires. But polls are vanity, donor cheques are reality. As the election looms, another MP calls for your resignation, you wonder why did you even bother?",
  "The local paper that used to cover the planning committee closed three years ago. Compulsory purchase orders are now a culture-war story on Facebook. These problems didn't end your premiership, but in these final moments you wonder whether looking into this instead of whatever the focus groups suggested might at least have been useful.",
  "57.8 per cent of voters did not vote for their MP. No wonder you couldn't build any trust in the system during your limited time in office."
];

const LOOK_RESPONSE = "You are in a large dark paneled room sitting at an oak desk with a red box sitting open on top of it. To the far end of the room is a door and to your left there is a window.";
const XYZZY_RESPONSE = "Nothing happens.";
const INITIAL_LINES = [
  "You are Prime Minister",
  "You're sitting at your desk in No. 10.",
  "The red box is open. A policy paper has escaped its folder.",
  "What do you do?"
];

const screen = document.querySelector("#screen");
const form = document.querySelector("#command-form");
const input = document.querySelector("#command-input");
const commandSubmit = document.querySelector("#command-submit");
const betterLink = document.querySelector("#better-link");

const TYPEWRITER_CHARACTERS_PER_SECOND = 100;
const TYPEWRITER_SCROLL_INTERVAL = 125;

let gameOver = false;
let extraPromptUsed = false;
let isPrinting = false;
let restartReady = false;

function focusCommandInput() {
  if (input.disabled) {
    return;
  }

  try {
    input.focus({ preventScroll: true });
  } catch {
    input.focus();
  }
}

function isInteractiveTarget(target) {
  return Boolean(target && typeof target.closest === "function" && target.closest("a, button, textarea, select"));
}

function scrollIntoView(element) {
  const scroll = () => {
    if (typeof element.scrollIntoView === "function") {
      element.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  };

  if (typeof requestAnimationFrame === "function") {
    requestAnimationFrame(scroll);
  } else {
    scroll();
  }
}

function updateCommandSubmit() {
  commandSubmit.hidden = input.disabled || document.activeElement === input || input.value.trim() === "";
}

function appendBlankLine(className) {
  const line = document.createElement("p");

  if (className) {
    line.className = className;
  }

  screen.append(line);
  return line;
}

function appendLine(text, className) {
  const line = appendBlankLine(className);
  line.textContent = text;
  return line;
}

function getAnimationTime() {
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    return performance.now();
  }

  return Date.now();
}

function requestAnimationTick(callback) {
  if (typeof requestAnimationFrame === "function") {
    requestAnimationFrame(callback);
    return;
  }

  setTimeout(() => callback(getAnimationTime()), 16);
}

function typeLine(text, className) {
  const line = appendBlankLine(className);
  const startedAt = getAnimationTime();
  let lastLength = 0;
  let lastScrollAt = 0;

  return new Promise((resolve) => {
    const tick = (timestamp) => {
      const now = typeof timestamp === "number" ? timestamp : getAnimationTime();
      const elapsedSeconds = Math.max(0, (now - startedAt) / 1000);
      const nextLength = Math.min(
        text.length,
        Math.floor(elapsedSeconds * TYPEWRITER_CHARACTERS_PER_SECOND)
      );

      if (nextLength !== lastLength) {
        line.textContent = text.slice(0, nextLength);
        lastLength = nextLength;
      }

      if (now - lastScrollAt >= TYPEWRITER_SCROLL_INTERVAL || nextLength === text.length) {
        scrollIntoView(line);
        lastScrollAt = now;
      }

      if (nextLength >= text.length) {
        line.textContent = text;
        resolve(line);
        return;
      }

      requestAnimationTick(tick);
    };

    requestAnimationTick(tick);
  });
}

function appendCommandEcho(text) {
  const line = document.createElement("p");
  const prompt = document.createElement("span");
  const command = document.createElement("span");

  line.className = "echo";
  prompt.className = "echo-prompt";
  prompt.textContent = "> ";
  command.className = "echo-command";
  command.textContent = text;
  line.append(prompt, command);
  screen.append(line);
}

function getSpecialResponse(command) {
  const normalisedCommand = command.trim().toLowerCase().replace(/\s+/g, " ");

  if (normalisedCommand === "look" || normalisedCommand === "look around") {
    return LOOK_RESPONSE;
  }

  if (normalisedCommand === "xyzzy") {
    return XYZZY_RESPONSE;
  }

  return "";
}

function pickResponse() {
  if (RESPONSES.length === 1) {
    return RESPONSES[0];
  }

  if (Math.random() < 1 / 3) {
    return RESPONSES[0];
  }

  const remainingIndex = 1 + Math.floor(Math.random() * (RESPONSES.length - 1));
  return RESPONSES[remainingIndex];
}

async function endGame(command) {
  const cleanCommand = command.trim() || "[silence]";
  input.value = cleanCommand;

  gameOver = true;
  restartReady = false;
  isPrinting = true;
  input.disabled = true;
  commandSubmit.hidden = true;
  input.blur();
  await typeLine(pickResponse(), "verdict");
  await typeLine("GAME OVER", "game-over");
  const restartHint = await typeLine("Press Any Key to Pay Again", "restart-hint cursor");
  betterLink.hidden = false;
  isPrinting = false;
  restartReady = true;
  scrollIntoView(restartHint);
}

async function continueGame(command, response) {
  const cleanCommand = command.trim() || "[silence]";
  input.disabled = true;
  commandSubmit.hidden = true;
  isPrinting = true;
  input.blur();
  input.value = "";
  form.remove();
  appendCommandEcho(cleanCommand);
  await typeLine(response, "verdict");
  input.disabled = false;
  isPrinting = false;
  extraPromptUsed = true;
  screen.append(form);
  focusCommandInput();
  scrollIntoView(form);
}

async function startGame() {
  screen.replaceChildren();
  input.value = "";
  commandSubmit.hidden = true;
  betterLink.hidden = true;
  gameOver = false;
  extraPromptUsed = false;
  isPrinting = true;
  restartReady = false;

  input.disabled = true;
  input.blur();

  for (const line of INITIAL_LINES) {
    await typeLine(line);
  }

  screen.append(form);
  input.disabled = false;
  isPrinting = false;
  focusCommandInput();
  scrollIntoView(form);
}

function resetGame() {
  startGame();
}

function submitCommand() {
  if (input.disabled || isPrinting) {
    return;
  }

  const specialResponse = getSpecialResponse(input.value);

  if (!extraPromptUsed && specialResponse) {
    continueGame(input.value, specialResponse);
    return;
  }

  endGame(input.value);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  submitCommand();
});

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    event.stopPropagation();
    submitCommand();
  }
});

document.addEventListener("click", (event) => {
  if (isInteractiveTarget(event.target)) {
    return;
  }

  if (gameOver && restartReady) {
    resetGame();
    return;
  }

  if (!gameOver) {
    focusCommandInput();
  }
});

document.addEventListener("keydown", (event) => {
  if (!gameOver || !restartReady) {
    return;
  }

  if (
    event.ctrlKey ||
    event.metaKey ||
    event.altKey ||
    ["Alt", "CapsLock", "Control", "Meta", "Shift", "Tab"].includes(event.key) ||
    isInteractiveTarget(event.target)
  ) {
    return;
  }

  event.preventDefault();
  resetGame();
});

betterLink.addEventListener("click", (event) => {
  const opened = window.open(
    betterLink.href,
    "better-than-this",
    "popup=yes,width=1040,height=820,noopener,noreferrer"
  );

  if (opened) {
    event.preventDefault();
  }
});

input.addEventListener("input", updateCommandSubmit);
input.addEventListener("focus", updateCommandSubmit);
input.addEventListener("blur", updateCommandSubmit);

startGame();
