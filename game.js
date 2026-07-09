const RESPONSES = [
  "The 2,000 voters in Nuneaton willing to consider both Labour and Conservative have decided they don't like your housing policy, and because of First Past the Post they are important, but the million adults who would like to move out of their childhood bedroom are not.\n\nI'm sorry, Prime Minister, but the lectern is ready for your resignation speech now, so is Steve Bray.",
  "The Electoral Commission return shows that nearly one pound in four of reported party donations came from one individual. The Chief Whip says it would be unwise to confuse a democratic mandate with party funding, particularly when the donor has asked for another Prime Minister.",
  "A dozen MPs in southern marginals have told the Chief Whip that 150,000 social-rent homes a year is admirable everywhere except within twenty miles of their constituencies. The landowners, planning committees and local papers are agreed that the national target is important, provided the houses remain elsewhere.",
  "The Treasury has classified the National Housing Bank as a cost before anyone at the OBR has been allowed to treat the homes as assets. Planning permission for your political legacy has been denied.",
  "Council tax rates were last revalued in 1991. It might be unfair, but it is a British tradition. While drafting your resignation letter, you realise you shouldn't have tried to fix things. Fixing things never works.",
  "A wealth tax is supported by the country at large, and indeed by most millionaires. But polls are vanity, donor cheques are reality. As another MP calls for your resignation, you wonder why did you even bother?",
  "The local paper that used to cover the planning committee closed three years ago. Compulsory purchase orders are now a culture-war story on Facebook. These problems didn't end your premiership, but in these final moments you wonder whether looking into this instead of whatever the focus groups suggested might at least have been useful.",
  "57.8 per cent of voters did not vote for their MP. No wonder you couldn't build any trust in the system during your limited time in office."
];

const LOOK_RESPONSE = "You are in a large dark paneled room sitting at an oak desk with a red box sitting open on top of it. To the far end of the room is a door and to your left there is a window.";
const XYZZY_RESPONSE = "Nothing happens.";

const screen = document.querySelector("#screen");
const form = document.querySelector("#command-form");
const input = document.querySelector("#command-input");
const betterLink = document.querySelector("#better-link");

let gameOver = false;
let extraPromptUsed = false;

function focusCommandInput() {
  if (input.disabled) {
    return;
  }

  input.focus({ preventScroll: true });
}

function appendLine(text, className) {
  const line = document.createElement("p");
  line.textContent = text;

  if (className) {
    line.className = className;
  }

  screen.append(line);
  return line;
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

function endGame(command) {
  const cleanCommand = command.trim() || "[silence]";
  input.value = cleanCommand;
  appendLine(pickResponse(), "verdict");
  appendLine("GAME OVER", "game-over");
  appendLine("Press Any Key to Pay Again", "restart-hint cursor");
  betterLink.hidden = false;

  gameOver = true;
  input.disabled = true;
  input.blur();
}

function continueGame(command, response) {
  const cleanCommand = command.trim() || "[silence]";
  appendCommandEcho(cleanCommand);
  appendLine(response, "verdict");
  screen.append(form);

  input.value = "";
  extraPromptUsed = true;
  focusCommandInput();
}

function resetGame() {
  screen.replaceChildren();
  appendLine("You are Prime Minister");
  appendLine("You're sitting at your desk in No. 10.");
  appendLine("The red box is open. A policy paper has escaped its folder.");
  appendLine("What do you do?");
  screen.append(form);

  input.value = "";
  input.disabled = false;
  betterLink.hidden = true;
  gameOver = false;
  extraPromptUsed = false;
  focusCommandInput();
}

function submitCommand() {
  if (input.disabled) {
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
  if (gameOver || event.target.closest("a, button, textarea, select")) {
    return;
  }

  focusCommandInput();
});

document.addEventListener("keydown", (event) => {
  if (!gameOver) {
    return;
  }

  if (
    event.ctrlKey ||
    event.metaKey ||
    event.altKey ||
    ["Alt", "CapsLock", "Control", "Meta", "Shift", "Tab"].includes(event.key) ||
    event.target.closest("a, button, textarea, select")
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

focusCommandInput();
