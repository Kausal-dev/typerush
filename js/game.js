// ── State ────────────────────────────────────────────────────────────────────
let words        = [];
let wordIndex    = 0;
let typed        = "";
let timer        = null;
let timeLeft     = 15;
let selectedTime = 15;
let started      = false;
let finished     = false;
let correctChars = 0;
let rawChars     = 0;
let errorCount   = 0;

// ── DOM refs ─────────────────────────────────────────────────────────────────
const wordInner   = document.getElementById("wordInner");
const wordArea    = document.getElementById("wordArea");
const typeInput   = document.getElementById("typeInput");
const timerVal    = document.getElementById("timerVal");
const wpmVal      = document.getElementById("wpmVal");
const accVal      = document.getElementById("accVal");
const results     = document.getElementById("results");
const pbDisplay   = document.getElementById("pbDisplay");

// ── Word generation ───────────────────────────────────────────────────────────
function pickWords(n) {
    const out = [];
    for (let i = 0; i < n; i++) {
        out.push(WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)]);
    }
    return out;
}

// ── Rendering ─────────────────────────────────────────────────────────────────
function renderAll() {
    wordInner.style.transform = "translateY(0)";
    wordInner.innerHTML = words
        .map((word, wi) =>
            `<span class="word" id="w${wi}">${word
                .split("")
                .map(ch => `<span class="letter">${ch}</span>`)
                .join("")}</span>`
        )
        .join(" ");
}

// Rebuild the innerHTML of the current word with per-letter classes + caret.
function refreshCurrentWord() {
    const el = document.getElementById(`w${wordIndex}`);
    if (!el) return;

    const word = words[wordIndex];
    const spans = word.split("").map((ch, i) => {
        let cls = "letter";
        if (i < typed.length) cls += typed[i] === ch ? " correct" : " wrong";
        return `<span class="${cls}">${ch}</span>`;
    });

    // Extra characters typed beyond the word's length
    for (let i = word.length; i < typed.length; i++) {
        spans.push(`<span class="letter extra wrong">${typed[i]}</span>`);
    }

    // Inject caret at cursor position
    const caretPos = Math.min(typed.length, spans.length);
    spans.splice(caretPos, 0, '<span class="caret"></span>');

    el.innerHTML = spans.join("");
}

// Lift the word container so the current word is always near the top.
function shiftView() {
    const el = document.getElementById(`w${wordIndex}`);
    if (!el) return;
    const lineH = el.offsetHeight * 2.5;       // one line height ≈ line-height * fontSize
    const shift = Math.max(0, el.offsetTop - lineH);
    wordInner.style.transform = `translateY(-${shift}px)`;
}

// ── Timer & live stats ────────────────────────────────────────────────────────
function startTimer() {
    started = true;
    typeInput.placeholder = "";
    timer = setInterval(() => {
        timeLeft--;
        timerVal.textContent = timeLeft;
        timerVal.classList.toggle("danger", timeLeft <= 5);
        updateLiveStats();
        if (timeLeft <= 0) endGame();
    }, 1000);
}

function updateLiveStats() {
    const elapsed = (selectedTime - timeLeft) / 60;
    if (elapsed > 0) {
        wpmVal.textContent = Math.round(correctChars / 5 / elapsed);
    }
    accVal.textContent = rawChars > 0
        ? Math.round((correctChars / rawChars) * 100) + "%"
        : "—";
}

// ── Input handling ────────────────────────────────────────────────────────────
typeInput.addEventListener("input", () => {
    if (finished) return;

    const val = typeInput.value;

    if (val.endsWith(" ")) {
        // ── Submit current word ──────────────────────────────────────────────
        const submitted = val.trimEnd();
        const target    = words[wordIndex];
        const maxLen    = Math.max(submitted.length, target.length);

        for (let i = 0; i < maxLen; i++) {
            rawChars++;
            if (
                i < submitted.length &&
                i < target.length &&
                submitted[i] === target[i]
            ) {
                correctChars++;
            } else {
                errorCount++;
            }
        }
        // Count the space itself as a correct char
        rawChars++;
        correctChars++;

        // Mark letters on the completed word
        const wordEl = document.getElementById(`w${wordIndex}`);
        if (wordEl) {
            wordEl.querySelectorAll(".caret").forEach(c => c.remove());
            wordEl.querySelectorAll(".letter").forEach((el, i) => {
                el.className = "letter";
                if (i < submitted.length && i < target.length) {
                    el.classList.add(submitted[i] === target[i] ? "correct" : "wrong");
                } else {
                    el.classList.add("wrong");
                }
            });
        }

        wordIndex++;
        typed = "";
        typeInput.value = "";

        if (!started) startTimer();
        shiftView();
        refreshCurrentWord();
        return;
    }

    // ── Live letter feedback ─────────────────────────────────────────────────
    typed = val;
    if (!started && val.length > 0) startTimer();
    refreshCurrentWord();
});

typeInput.addEventListener("keydown", (e) => {
    if (e.key === "Tab" || e.key === "Escape") {
        e.preventDefault();
        restartGame();
    }
    // Block backspace when input is already empty (no crossing word boundary)
    if (e.key === "Backspace" && typeInput.value === "") {
        e.preventDefault();
    }
});

// ── End game ──────────────────────────────────────────────────────────────────
function endGame() {
    finished = true;
    clearInterval(timer);
    typeInput.disabled = true;

    const elapsed = selectedTime / 60;
    const wpm = Math.round(correctChars / 5 / elapsed);
    const raw = Math.round(rawChars    / 5 / elapsed);
    const acc = rawChars > 0 ? Math.round((correctChars / rawChars) * 100) : 100;

    document.getElementById("resWpm").textContent    = wpm;
    document.getElementById("resRaw").textContent    = raw;
    document.getElementById("resAcc").textContent    = acc + "%";
    document.getElementById("resChars").textContent  = correctChars;
    document.getElementById("resErrors").textContent = errorCount;

    const pbKey  = `typerush_pb_${selectedTime}`;
    const prevPb = parseInt(localStorage.getItem(pbKey) || "0", 10);

    if (wpm > prevPb) {
        localStorage.setItem(pbKey, wpm);
        pbDisplay.textContent = wpm;
        document.getElementById("newPb").style.display = "block";
    } else {
        document.getElementById("newPb").style.display = "none";
    }

    results.style.display = "flex";
}

// ── Restart ───────────────────────────────────────────────────────────────────
function restartGame() {
    clearInterval(timer);
    wordIndex    = 0;
    typed        = "";
    timeLeft     = selectedTime;
    started      = false;
    finished     = false;
    correctChars = 0;
    rawChars     = 0;
    errorCount   = 0;

    timerVal.textContent = selectedTime;
    timerVal.classList.remove("danger");
    wpmVal.textContent = "—";
    accVal.textContent = "—";

    typeInput.value       = "";
    typeInput.disabled    = false;
    typeInput.placeholder = "click here or start typing…";

    results.style.display = "none";

    words = pickWords(200);
    renderAll();
    refreshCurrentWord();
    typeInput.focus();
}

// ── Mode buttons ──────────────────────────────────────────────────────────────
document.querySelectorAll(".mode-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".mode-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        selectedTime = parseInt(btn.dataset.time, 10);
        const pb = localStorage.getItem(`typerush_pb_${selectedTime}`);
        pbDisplay.textContent = pb || "—";
        restartGame();
    });
});

// Click on word display focuses the hidden input
wordArea.addEventListener("click", () => typeInput.focus());

// ── Boot ─────────────────────────────────────────────────────────────────────
window.addEventListener("load", () => {
    const pb = localStorage.getItem(`typerush_pb_${selectedTime}`);
    pbDisplay.textContent = pb || "—";
    words = pickWords(200);
    renderAll();
    refreshCurrentWord();
    typeInput.focus();
});
