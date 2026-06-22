# TypeRush

A minimal, fast, dark-themed typing speed test — runs entirely in the browser with no dependencies or build step.

![JavaScript](https://img.shields.io/badge/JavaScript-ES2020-F7DF1E?logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-Canvas-E34F26?logo=html5&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-4caf77)
![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-181717?logo=github)

---

## Features

- **4 time modes** — 15 s, 30 s, 60 s, 120 s
- **Real-time feedback** — per-letter correct / wrong highlighting and a blinking caret
- **Live stats** — WPM and accuracy update every second while you type
- **Results panel** — WPM, raw WPM, accuracy, characters, and error count
- **Personal best** — stored in `localStorage` per time mode, with a "New PB" celebration
- **500+ word pool** — drawn from the most common English words
- Zero dependencies · Zero build step · Works offline

---

## Live Demo

[**Play now on GitHub Pages →**](https://YOUR_USERNAME.github.io/typerush)

---

## Getting Started

### Option A — Open locally (no install)

```bash
git clone https://github.com/YOUR_USERNAME/typerush.git
cd typerush
# Just open index.html in your browser
start index.html        # Windows
open  index.html        # macOS
xdg-open index.html     # Linux
```

### Option B — Deploy to GitHub Pages

1. Push this repo to GitHub.
2. Go to **Settings → Pages → Source** and select the `main` branch, `/ (root)`.
3. Your site will be live at `https://YOUR_USERNAME.github.io/typerush`.

---

## Controls

| Key | Action |
|---|---|
| Start typing | Timer begins automatically |
| `Space` | Submit current word and move to next |
| `Tab` or `Esc` | Restart the test |

---

## Project Structure

```
typerush/
├── index.html      # Page layout and results panel
├── style.css       # Dark minimal theme (CSS custom properties)
└── js/
    ├── words.js    # 500+ word bank (WORD_BANK constant)
    └── game.js     # Core game engine (timer, scoring, rendering)
```

### How scoring works

| Metric | Formula |
|---|---|
| **WPM** | `(correct characters ÷ 5) ÷ minutes elapsed` |
| **Raw WPM** | `(all characters typed ÷ 5) ÷ minutes elapsed` |
| **Accuracy** | `correct characters ÷ total characters × 100%` |

A "character" is any letter or space. The space between words counts as one correct character when submitted.

---

## Customising

**Add your own words** — edit `js/words.js` and add strings to `WORD_BANK`.

**Change the accent colour** — edit the `--accent` CSS variable at the top of `style.css`.

**Add a new time mode** — add a `<button class="mode-btn" data-time="N">Ns</button>` in `index.html`. No JS changes needed.

---

## License

[MIT](LICENSE) — free to use, fork, and modify.
