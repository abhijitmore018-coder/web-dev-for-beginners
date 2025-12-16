let currentUser = "";
let selectedText = "";
let timer = 0, interval;
let totalTyped = 0;
let started = false;
let maxTime = 60;
let streak = 0, bestStreak = 0;

const input = document.getElementById("typingInput");
const display = document.getElementById("textDisplay");

/* LOGIN */
function login() {
    const name = document.getElementById("username").value.trim();
    if (!name) return alert("Enter username");
    currentUser = name;
    document.getElementById("loginScreen").classList.add("hidden");
    document.getElementById("gameScreen").classList.remove("hidden");
}

/* SENTENCE GENERATOR */
function generateSentence(level) {
    const pool = {
        easy: ["typing", "practice", "learn", "code", "focus"],
        medium: ["javascript", "keyboard", "accuracy", "performance"],
        hard: ["implementation", "optimization", "functionality"]
    }[level];

    const count = level === "easy" ? 4 : level === "medium" ? 6 : 8;
    return Array.from({length: count}, () =>
        pool[Math.floor(Math.random() * pool.length)]
    ).join(" ");
}

function loadSentence() {
    selectedText = generateSentence(document.getElementById("difficulty").value);
    display.innerHTML = "";
    input.value = "";
    selectedText.split("").forEach(c => {
        let s = document.createElement("span");
        s.innerText = c;
        display.appendChild(s);
    });
}

/* START GAME */
function startGame() {
    loadSentence();
    input.disabled = false;
    input.focus();

    timer = 0;
    totalTyped = 0;
    streak = 0;
    bestStreak = 0;

    document.getElementById("time").innerText = 0;
    document.getElementById("streak").innerText = 0;
    document.getElementById("bestStreak").innerText = 0;

    const mode = document.getElementById("timeMode").value;
    maxTime = mode === "custom"
        ? Number(document.getElementById("customTime").value || 60)
        : Number(mode);

    clearInterval(interval);
    interval = setInterval(() => {
        timer++;
        document.getElementById("time").innerText = timer;
        updateWPM();
        if (timer >= maxTime) endGame();
    }, 1000);

    started = true;
}

/* END GAME */
function endGame() {
    clearInterval(interval);
    input.disabled = true;
    started = false;
    saveScore();
    saveHistory();
    showResult();
}

/* INPUT HANDLING */
input.addEventListener("input", () => {
    if (!started) return;

    totalTyped++;
    const typed = input.value.split("");
    const spans = display.querySelectorAll("span");
    let correct = 0;
    let mistake = false;

    spans.forEach((s, i) => {
        if (!typed[i]) s.className = "";
        else if (typed[i] === s.innerText) {
            s.className = "correct";
            correct++;
        } else {
            s.className = "wrong";
            mistake = true;
        }
    });

    if (!mistake) {
        streak++;
        bestStreak = Math.max(bestStreak, streak);
    } else streak = 0;

    document.getElementById("streak").innerText = streak;
    document.getElementById("bestStreak").innerText = bestStreak;

    document.getElementById("accuracy").innerText =
        Math.round((correct / selectedText.length) * 100);

    if (typed.length === selectedText.length && correct === selectedText.length)
        setTimeout(loadSentence, 300);

    if (document.getElementById("beginnerMode").checked)
        showFingerHint(typed[typed.length - 1]);
});

/* WPM */
function updateWPM() {
    document.getElementById("wpm").innerText =
        Math.round((totalTyped / 5) / (timer / 60 || 1));
}

/* CAPS LOCK */
document.addEventListener("keydown", e => {
    document.getElementById("capsIndicator").innerText =
        e.getModifierState("CapsLock") ? "Caps Lock ON" : "Caps Lock OFF";
});

/* FINGER HINTS */
function showFingerHint(ch) {
    const hint = document.getElementById("fingerHint");
    if (!ch) return;
    if ("qaz".includes(ch)) hint.innerText = "Use LEFT PINKY";
    else if ("wsx".includes(ch)) hint.innerText = "Use LEFT RING";
    else if ("edc".includes(ch)) hint.innerText = "Use LEFT MIDDLE";
    else if ("rfvtgb".includes(ch)) hint.innerText = "Use LEFT INDEX";
    else if ("yhnujm".includes(ch)) hint.innerText = "Use RIGHT INDEX";
    else if ("ik".includes(ch)) hint.innerText = "Use RIGHT MIDDLE";
    else if ("ol".includes(ch)) hint.innerText = "Use RIGHT RING";
    else hint.innerText = "Use RIGHT PINKY";
}

/* LEADERBOARD */
function saveScore() {
    const wpm = Number(document.getElementById("wpm").innerText);
    let data = JSON.parse(localStorage.getItem("leaderboard") || "[]");
    const existing = data.find(u => u.name === currentUser);
    if (!existing || wpm > existing.wpm) {
        data = data.filter(u => u.name !== currentUser);
        data.push({ name: currentUser, wpm });
    }
    data.sort((a, b) => b.wpm - a.wpm);
    localStorage.setItem("leaderboard", JSON.stringify(data.slice(0,10)));
}

function showLeaderboard() {
    const list = document.getElementById("leaderboardList");
    list.innerHTML = "";
    JSON.parse(localStorage.getItem("leaderboard") || "[]")
        .forEach(u => {
            let li = document.createElement("li");
            li.innerText = `${u.name} - ${u.wpm} WPM`;
            list.appendChild(li);
        });
    document.getElementById("leaderboardScreen").classList.remove("hidden");
}

function closeLeaderboard() {
    document.getElementById("leaderboardScreen").classList.add("hidden");
}

/* RESULT */
function showResult() {
    document.getElementById("rTime").innerText = timer;
    document.getElementById("rAccuracy").innerText =
        document.getElementById("accuracy").innerText;
    document.getElementById("rWpm").innerText =
        document.getElementById("wpm").innerText;
    document.getElementById("resultScreen").classList.remove("hidden");
}

function closeResult() {
    document.getElementById("resultScreen").classList.add("hidden");
}

/* PROGRESS HISTORY */
function saveHistory() {
    let history = JSON.parse(localStorage.getItem("history") || "[]");
    history.push({
        date: new Date().toLocaleDateString(),
        wpm: document.getElementById("wpm").innerText,
        acc: document.getElementById("accuracy").innerText
    });
    localStorage.setItem("history", JSON.stringify(history));
    loadHistory();
}

function loadHistory() {
    const table = document.getElementById("historyTable");
    table.innerHTML = "";
    JSON.parse(localStorage.getItem("history") || "[]")
        .forEach(h => {
            table.innerHTML +=
                `<tr><td>${h.date}</td><td>${h.wpm}</td><td>${h.acc}</td></tr>`;
        });
}
loadHistory();

/* VIRTUAL KEYBOARD */
const layout = [
 ["Esc","F1","F2","F3","F4","F5","F6","F7","F8","F9","F10","F11","F12"],
 ["`","1","2","3","4","5","6","7","8","9","0","-","=","Backspace"],
 ["Tab","Q","W","E","R","T","Y","U","I","O","P","[","]","\\"],
 ["Caps","A","S","D","F","G","H","J","K","L",";","'","Enter"],
 ["Shift","Z","X","C","V","B","N","M",",",".","/","Shift"],
 ["Space"]
];

const keyboard = document.getElementById("keyboard");
layout.forEach(row => {
    let r = document.createElement("div");
    r.className = "kb-row";
    row.forEach(k => {
        let d = document.createElement("div");
        d.className = "kb-key";
        if (["Backspace","Enter","Shift","Caps","Tab"].includes(k)) d.classList.add("kb-wide");
        if (k === "Space") d.classList.add("kb-extra-wide");
        d.id = "kb_" + k.toLowerCase();
        d.innerText = k;
        r.appendChild(d);
    });
    keyboard.appendChild(r);
});

document.addEventListener("keydown", e => {
    const id = "kb_" + (e.key === " " ? "space" : e.key.toLowerCase());
    document.getElementById(id)?.classList.add("kb-active");
});
document.addEventListener("keyup", e => {
    const id = "kb_" + (e.key === " " ? "space" : e.key.toLowerCase());
    document.getElementById(id)?.classList.remove("kb-active");
});
