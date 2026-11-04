#!/usr/bin/env python3
"""Fabrique les deux vidéos de démo des cartes « Chapters » à partir du vrai code ThemesTerm.

  theme1.mp4  Thème 1 — l'écran de choix, « Terminal classique », puis un terminal normal
  theme2.mp4  Thème 2 — l'écran de choix, on fait défiler les fonds, « hello », puis le shell
              par-dessus le fond (et `fond koi` qui change de fond)

Chaque image est rendue cellule par cellule (police Menlo) puis encodée avec ffmpeg.
Usage : python make_demos.py <dossier ThemeTerm> <dossier ThemesTerm.Site>/public
Nécessite pillow et pyte (et ffmpeg dans le PATH).
"""
import os
import random
import shutil
import subprocess
import sys
import tempfile

from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, os.path.abspath(sys.argv[1]))
import asciiterm as at  # noqa: E402
import asciiwall as aw  # noqa: E402
import intro  # noqa: E402
import pyte  # noqa: E402
import themesterm as tt  # noqa: E402

OUT = os.path.abspath(sys.argv[2])
COLS, ROWS = 96, 24          # taille du terminal filmé
CW, CH, TITLE = 15, 29, 36   # pixels par cellule, barre de titre
PAD = 14                     # marge intérieure : l'image fait ~1,93:1, comme les cartes (577×300)
FPS = 24
TERM_BG, TERM_FG = (24, 25, 30), (222, 222, 228)
GREEN, CYAN, DIM = (120, 210, 100), (90, 210, 220), (150, 155, 170)
FONT = ImageFont.truetype("/System/Library/Fonts/Menlo.ttc", 24, index=0)
BOLD = ImageFont.truetype("/System/Library/Fonts/Menlo.ttc", 24, index=1)
PROMPT = "\x1b[1;32m➜\x1b[0m  \x1b[36m~\x1b[0m "


# ---------------------------------------------------------------- rendu d'un écran

def blank():
    return [[(" ", TERM_FG, TERM_BG) for _ in range(COLS)] for _ in range(ROWS)]


def screen_to_buf(screen):
    """Écran pyte -> cellules (texte normal du terminal, sans fond animé)."""
    buf = blank()
    for y in range(ROWS):
        for x in range(COLS):
            c = screen.buffer[y][x]
            if c.data.strip():
                buf[y][x] = (c.data, at.color(c.fg, TERM_FG), at.color(c.bg, TERM_BG) if c.bg != "default" else TERM_BG)
    if pyte.modes.DECTCEM in screen.mode:
        cx, cy = screen.cursor.x, screen.cursor.y
        buf[cy][cx] = (buf[cy][cx][0], TERM_BG, TERM_FG)
    return buf


def pixels_to_buf(canvas, top_row=0):
    """Pixels demi-bloc de l'intro -> cellules ▀/▄ sur le fond du terminal."""
    buf = blank()
    for r in range(ROWS - top_row):
        for x in range(COLS):
            a, b = canvas.get((x, 2 * r)), canvas.get((x, 2 * r + 1))
            if a or b:
                buf[top_row + r][x] = ("▀", a or TERM_BG, b or TERM_BG)
    return buf


def draw(buf, title):
    img = Image.new("RGB", (COLS * CW + 2 * PAD, ROWS * CH + TITLE + 2 * PAD), TERM_BG)
    d = ImageDraw.Draw(img)
    # la marge prolonge la couleur des cellules du bord : le fond animé déborde jusqu'au cadre
    W, H, top = img.width, img.height, TITLE + PAD
    for y, row in enumerate(buf):
        y0 = top + y * CH
        d.rectangle([0, y0, PAD, y0 + CH], fill=row[0][2])
        d.rectangle([W - PAD - 1, y0, W, y0 + CH], fill=row[-1][2])
    for x in range(COLS):
        x0 = PAD + x * CW
        d.rectangle([x0, TITLE, x0 + CW, top], fill=buf[0][x][2])
        d.rectangle([x0, H - PAD - 1, x0 + CW, H], fill=buf[-1][x][2])
    for (cx, cy), cell in (((0, TITLE), buf[0][0]), ((W - PAD, TITLE), buf[0][-1]),
                           ((0, H - PAD), buf[-1][0]), ((W - PAD, H - PAD), buf[-1][-1])):
        d.rectangle([cx, cy, cx + PAD, cy + PAD], fill=cell[2])
    # barre de titre façon macOS
    d.rectangle([0, 0, img.width, TITLE], fill=(38, 39, 46))
    for i, col in enumerate(((255, 95, 87), (254, 188, 46), (40, 200, 64))):
        d.ellipse([16 + i * 24, 11, 30 + i * 24, 25], fill=col)
    tw = d.textlength(title, font=FONT) * 0.75
    d.text(((img.width - tw) / 2, 8), title, font=ImageFont.truetype("/System/Library/Fonts/Menlo.ttc", 18), fill=(170, 172, 182))
    for y, row in enumerate(buf):
        for x, (ch, fg, bg) in enumerate(row):
            x0, y0 = PAD + x * CW, TITLE + PAD + y * CH
            if ch == "▀":
                d.rectangle([x0, y0, x0 + CW - 1, y0 + CH // 2 - 1], fill=fg)
                d.rectangle([x0, y0 + CH // 2, x0 + CW - 1, y0 + CH - 1], fill=bg)
                continue
            if ch == "▄":
                d.rectangle([x0, y0, x0 + CW - 1, y0 + CH // 2 - 1], fill=bg)
                d.rectangle([x0, y0 + CH // 2, x0 + CW - 1, y0 + CH - 1], fill=fg)
                continue
            d.rectangle([x0, y0, x0 + CW - 1, y0 + CH - 1], fill=bg)
            if ch.strip():
                d.text((x0, y0 + 2), ch, font=FONT, fill=fg)
    return img


# ---------------------------------------------------------------- scénarios

def typed(text, t, start, speed=14):
    """Le texte tapé à la machine depuis `start` (speed caractères par seconde)."""
    return text[:max(0, int((t - start) * speed))]


def chooser_at(mode, choice, t):
    c = tt.Chooser({"default": "themesterm", "ask": "yes"})
    c.mode = mode
    c.choice = choice
    c.idx = choice if choice != at.RANDOM else 0
    c.theme = THEMES[c.idx]
    return c.frame(COLS, ROWS, t)


def shell(lines, t, cursor=True):
    scr = pyte.Screen(COLS, ROWS)
    st = pyte.ByteStream(scr)
    st.feed("\r\n".join(lines).encode())
    if not cursor:
        st.feed(b"\x1b[?25l")
    return scr


def classic(t):
    """Thème 1 : choix « Terminal classique » puis un terminal normal (4,5 s)."""
    if t < 1.3:
        return chooser_at(1 if t < 0.5 else 0, 3, t), "Nouveau terminal"
    lines = [PROMPT + typed("ls", t, 1.45)]
    if t >= 1.85:
        lines += ["\x1b[1;34mDesktop\x1b[0m    \x1b[1;34mDocuments\x1b[0m    \x1b[1;34mDeveloppement\x1b[0m    \x1b[1;34mDownloads\x1b[0m",
                  PROMPT + typed("git status", t, 2.05)]
    if t >= 2.95:
        lines += ["Sur la branche main", "rien à valider, la copie de travail est propre", PROMPT]
    blink = t < 2.95 or int(t * 2.5) % 2 == 0
    return screen_to_buf(shell(lines, t, blink)), "zsh — terminal classique"


def themed(t):
    """Thème 2 : on choisit un fond, « hello », puis le shell par-dessus le fond (5 s)."""
    if t < 1.4:
        choice = 6 + sum(t >= k for k in (0.35, 0.7, 1.05))  # Fireflies -> Moonlit -> Au hasard -> Claude Code
        return chooser_at(1, choice % len(at.CHOICES), t), "Nouveau terminal"
    if t < 2.85:
        canvas = intro.frame_pixels(HELLO[0], HELLO[1], 4, (t - 1.4) * 1.8, HELLO[2])
        return pixels_to_buf(canvas, 5), "ThemesTerm"
    theme = THEMES[0] if t < 4.15 else THEMES[3]  # Claude Code, puis Koi Pond après `fond koi`
    lines = [PROMPT + typed("fond koi", t, 3.25, 12)]
    if t >= 4.15:
        lines.append(PROMPT)
    return at.compose(theme, shell(lines, t), COLS, ROWS, t), "ThemesTerm — fond animé"


# ---------------------------------------------------------------- encodage

def render(name, scene, duration, blend=0.35):
    tmp = tempfile.mkdtemp(prefix="demo-")
    n = int(duration * FPS)
    first = None
    for i in range(n):
        t = i / FPS
        buf, title = scene(t)
        img = draw(buf, title)
        if first is None:
            first = img
        k = (t - (duration - blend)) / blend  # fondu vers la 1re image : boucle sans à-coup
        if k > 0:
            img = Image.blend(img, first, min(1.0, k))
        img.save(os.path.join(tmp, "%04d.png" % i))
    mp4 = os.path.join(OUT, name + ".mp4")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", str(FPS), "-i", os.path.join(tmp, "%04d.png"),
                    "-vf", "pad=ceil(iw/2)*2:ceil(ih/2)*2", "-c:v", "libx264", "-pix_fmt", "yuv420p",
                    "-crf", "24", "-preset", "slow", "-movflags", "+faststart", "-an", mp4], check=True)
    shutil.rmtree(tmp)
    return mp4


def poster(name, scene, t):
    buf, title = scene(t)
    draw(buf, title).save(os.path.join(OUT, name + ".jpg"), quality=86)


if __name__ == "__main__":
    random.seed(7)
    THEMES = [T() for T in aw.THEMES]
    letters, xs, h = intro.layout("HELLO", COLS, [intro.hex_rgb(c) for c in intro.CARTOON])
    HELLO = (letters, xs, (len(letters) * 0.07 + 0.85, 0.75, len(letters)))
    os.makedirs(OUT, exist_ok=True)
    print(render("theme1", classic, 4.5))
    poster("theme1", classic, 3.6)
    print(render("theme2", themed, 5.0))
    poster("theme2", themed, 3.9)
