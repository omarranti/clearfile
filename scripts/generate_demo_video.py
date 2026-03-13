import math
from pathlib import Path

import imageio.v2 as imageio
import numpy as np
from PIL import Image, ImageDraw, ImageFont


W, H = 1920, 1072
FPS = 30
DURATION = 30
TOTAL_FRAMES = FPS * DURATION

BG = (245, 249, 255)
TEXT = (16, 42, 67)
MUTED = (79, 100, 120)
PRIMARY = (31, 157, 139)
PRIMARY_SOFT = (209, 244, 239)
BORDER = (214, 226, 239)
BLUE = (59, 130, 246)
RED = (220, 38, 38)


def clamp(v, lo=0.0, hi=1.0):
    return max(lo, min(hi, v))


def ease_out_cubic(t):
    t = clamp(t)
    return 1 - (1 - t) ** 3


def ease_in_out(t):
    t = clamp(t)
    return 0.5 - 0.5 * math.cos(math.pi * t)


def lerp(a, b, t):
    return a + (b - a) * t


def mix_color(a, b, t):
    return tuple(int(lerp(a[i], b[i], t)) for i in range(3))


def font(size, bold=False):
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Supplemental/Helvetica.ttf",
    ]
    for path in candidates:
        p = Path(path)
        if p.exists():
            return ImageFont.truetype(str(p), size)
    return ImageFont.load_default()


F_TITLE = font(68, True)
F_H2 = font(44, True)
F_H3 = font(30, True)
F_BODY = font(24, False)
F_BODY_B = font(24, True)
F_SM = font(20, False)
F_CODE = font(28, True)


def rounded(draw, xy, radius=18, fill=None, outline=None, width=1):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def draw_bg(draw, t):
    draw.rectangle((0, 0, W, H), fill=BG)
    orb_x = int(1560 + 50 * math.sin(t * 0.75))
    orb_y = int(180 + 30 * math.cos(t * 0.9))
    orb2_x = int(280 + 40 * math.cos(t * 0.6))
    orb2_y = int(860 + 26 * math.sin(t * 0.55))
    draw.ellipse((orb_x - 250, orb_y - 250, orb_x + 250, orb_y + 250), fill=(223, 247, 242))
    draw.ellipse((orb2_x - 260, orb2_y - 260, orb2_x + 260, orb2_y + 260), fill=(227, 237, 254))


def draw_header(draw, subtitle):
    draw.text((120, 78), "Taxed", font=F_H2, fill=PRIMARY)
    draw.text((260, 88), subtitle, font=F_SM, fill=MUTED)


def draw_intro(draw, sec):
    t = clamp(sec / 2.0)
    y = int(lerp(560, 498, ease_out_cubic(t)))
    a_col = mix_color((145, 165, 185), PRIMARY, t)
    draw.text((300, y - 86), "From onboarding", font=F_H2, fill=TEXT)
    draw.text((870, y - 86), "to report clarity", font=F_H2, fill=PRIMARY)
    draw.text((300, y - 14), "See how users go from setup to a full tax breakdown in 30 seconds.", font=F_BODY, fill=MUTED)
    pill_w = int(lerp(240, 560, t))
    rounded(draw, (300, y + 56, 300 + pill_w, y + 98), radius=21, fill=PRIMARY_SOFT, outline=(157, 226, 214), width=2)
    draw.text((324, y + 66), "Onboarding  ->  Breakdown", font=F_SM, fill=a_col)


def draw_onboarding(draw, sec):
    # Card container
    x0, y0, x1, y1 = 430, 170, 1490, 930
    rounded(draw, (x0, y0, x1, y1), radius=26, fill=(255, 255, 255), outline=BORDER, width=2)

    progress = clamp(sec / 12.0)
    rounded(draw, (x0, y0, x1, y0 + 8), radius=4, fill=(235, 242, 251))
    rounded(draw, (x0, y0, int(lerp(x0, x1, progress)), y0 + 8), radius=4, fill=PRIMARY)

    draw.text((x0 + 44, y0 + 36), "Smart onboarding in seconds", font=F_H3, fill=TEXT)
    draw.text((x0 + 44, y0 + 84), "Inputs adapt and prepare your personalized tax report.", font=F_BODY, fill=MUTED)

    step = 1 if sec < 4 else 2 if sec < 8 else 3
    draw.text((x1 - 220, y0 + 40), f"Step {step}/3", font=F_BODY_B, fill=PRIMARY)

    # Income step
    income_t = clamp(sec / 4.0)
    income = int(lerp(45000, 92000, ease_in_out(income_t)))
    if step == 1 or sec < 4.2:
        alpha = clamp(1 - max(0.0, (sec - 3.7) / 0.6))
        y_offset = int(20 * (1 - alpha))
        draw.text((x0 + 52, y0 + 170 + y_offset), "Gross annual income", font=F_BODY_B, fill=mix_color(MUTED, TEXT, alpha))
        draw.text((x0 + 52, y0 + 215 + y_offset), f"${income:,.0f}", font=F_TITLE, fill=mix_color(PRIMARY, PRIMARY, alpha))
        sx0, sy0, sx1, sy1 = x0 + 52, y0 + 310 + y_offset, x1 - 52, y0 + 330 + y_offset
        rounded(draw, (sx0, sy0, sx1, sy1), radius=10, fill=(232, 240, 249))
        rounded(draw, (sx0, sy0, int(lerp(sx0, sx1, income_t)), sy1), radius=10, fill=PRIMARY)
        draw.ellipse((int(lerp(sx0, sx1, income_t)) - 10, sy0 - 4, int(lerp(sx0, sx1, income_t)) + 10, sy1 + 4), fill=(255, 255, 255), outline=PRIMARY, width=3)

    # Filing step
    if sec >= 3.6:
        local = clamp((sec - 3.6) / 0.8)
        xoff = int((1 - ease_out_cubic(local)) * 26)
        opacity_col = mix_color((220, 228, 238), BORDER, ease_out_cubic(local))
        draw.text((x0 + 52 + xoff, y0 + 430), "Filing status", font=F_BODY_B, fill=TEXT)
        options = ["Single", "Married Joint", "Head of Household"]
        for i, label in enumerate(options):
            yy = y0 + 480 + i * 76
            selected = i == (1 if sec > 5.2 else 0)
            rounded(draw, (x0 + 52 + xoff, yy, x0 + 430 + xoff, yy + 56), radius=12, fill=(241, 251, 249) if selected else (255, 255, 255), outline=PRIMARY if selected else opacity_col, width=2)
            draw.text((x0 + 74 + xoff, yy + 16), label, font=F_SM, fill=PRIMARY if selected else TEXT)

    # Optional signals step
    if sec >= 7.4:
        local = clamp((sec - 7.4) / 0.9)
        yoff = int((1 - ease_out_cubic(local)) * 26)
        draw.text((x0 + 560, y0 + 430 + yoff), "Optional signals", font=F_BODY_B, fill=TEXT)
        opts = [
            ("Late filing penalty", sec > 8.8),
            ("Student loans", sec > 9.6),
            ("Retirement contributions", sec > 10.4),
        ]
        for i, (label, checked) in enumerate(opts):
            yy = y0 + 480 + i * 76 + yoff
            rounded(draw, (x0 + 560, yy, x1 - 52, yy + 56), radius=12, fill=(255, 255, 255), outline=BORDER, width=2)
            box = (x0 + 582, yy + 16, x0 + 608, yy + 42)
            rounded(draw, box, radius=6, fill=PRIMARY if checked else (255, 255, 255), outline=PRIMARY if checked else BORDER, width=2)
            if checked:
                draw.line((x0 + 587, yy + 30, x0 + 594, yy + 36), fill=(255, 255, 255), width=3)
                draw.line((x0 + 594, yy + 36, x0 + 604, yy + 22), fill=(255, 255, 255), width=3)
            draw.text((x0 + 620, yy + 16), label, font=F_SM, fill=TEXT)

    cta_t = clamp((sec - 10.5) / 1.5)
    c0, c1 = x1 - 360, x1 - 52
    yy = y1 - 90
    rounded(draw, (c0, yy, c1, yy + 52), radius=24, fill=mix_color((116, 197, 186), PRIMARY, cta_t))
    draw.text((c0 + 24, yy + 14), "See My Breakdown  >", font=F_BODY_B, fill=(255, 255, 255))


def draw_report(draw, sec):
    x0, y0, x1 = 120, 176, 1800
    draw.text((x0, y0), "Your Tax Situation, Broken Down", font=F_TITLE, fill=TEXT)
    draw.text((x0, y0 + 72), "Live scenario with effective rate, bracket exposure, and action plan.", font=F_BODY, fill=MUTED)

    # KPI cards
    kpi_y = 300
    card_w = 530
    gap = 20
    kpi_data = [
        ("Gross Income", "$92,000", BLUE),
        ("Est. Total Tax", "≈$22,140", RED),
        ("Effective Rate", "≈24.1%", PRIMARY),
    ]
    reveal = ease_out_cubic(clamp(sec / 2.2))
    for i, (title, value, color) in enumerate(kpi_data):
        x = x0 + i * (card_w + gap)
        rounded(draw, (x, kpi_y, x + card_w, kpi_y + 190), radius=20, fill=(255, 255, 255), outline=BORDER, width=2)
        rounded(draw, (x, kpi_y, x + card_w, kpi_y + 6), radius=4, fill=color)
        draw.text((x + 26, kpi_y + 24), title, font=F_SM, fill=MUTED)
        draw.text((x + 26, int(kpi_y + 88 - 16 * (1 - reveal))), value, font=F_H2, fill=mix_color((185, 198, 210), color, reveal))
        if i == 2:
            draw.text((x + 26, kpi_y + 128), "Take-home ≈ $69,860 / yr", font=F_SM, fill=TEXT)

    # Breakdown bars
    panel_y = 520
    rounded(draw, (x0, panel_y, x1, 860), radius=20, fill=(255, 255, 255), outline=BORDER, width=2)
    draw.text((x0 + 24, panel_y + 20), "Where Your Money Goes", font=F_H3, fill=TEXT)
    bars = [
        ("Gross Income", 1.00, "$92,000", BLUE),
        ("Federal Tax", 0.17, "≈$15,640", RED),
        ("State Tax", 0.07, "≈$6,500", (139, 92, 246)),
        ("Take-Home", 0.76, "≈$69,860", PRIMARY),
    ]
    anim = ease_out_cubic(clamp((sec - 1.2) / 8.4))
    by = panel_y + 86
    for label, pct, amount, color in bars:
        draw.text((x0 + 24, by), label, font=F_SM, fill=TEXT)
        draw.text((x1 - 220, by), amount, font=F_CODE, fill=color)
        rounded(draw, (x0 + 24, by + 30, x1 - 24, by + 46), radius=8, fill=(233, 241, 249))
        rounded(draw, (x0 + 24, by + 30, int(x0 + 24 + (x1 - x0 - 48) * pct * anim), by + 46), radius=8, fill=color)
        by += 70

    # Checklist actions
    act_t = clamp((sec - 7.0) / 3.5)
    ax0, ay0 = 120, 888
    rounded(draw, (ax0, ay0, 1800, 1020), radius=18, fill=(255, 255, 255), outline=BORDER, width=2)
    draw.text((ax0 + 24, ay0 + 18), "Next Actions", font=F_H3, fill=TEXT)
    actions = [
        ("Confirm credit eligibility with CPA", act_t > 0.2),
        ("Plan quarterly set-aside for side income", act_t > 0.5),
        ("Export report and prepare filing questions", act_t > 0.8),
    ]
    for i, (text, checked) in enumerate(actions):
        yy = ay0 + 62 + i * 28
        rounded(draw, (ax0 + 24, yy, ax0 + 44, yy + 20), radius=5, fill=PRIMARY if checked else (255, 255, 255), outline=PRIMARY, width=2)
        if checked:
            draw.line((ax0 + 28, yy + 10, ax0 + 34, yy + 15), fill=(255, 255, 255), width=2)
            draw.line((ax0 + 34, yy + 15, ax0 + 41, yy + 6), fill=(255, 255, 255), width=2)
        draw.text((ax0 + 54, yy - 2), text, font=F_SM, fill=TEXT)


def frame_at(i):
    t = i / FPS
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    draw_bg(d, t)

    if t < 2:
        draw_header(d, "Demo: Full user journey")
        draw_intro(d, t)
    elif t < 14:
        draw_header(d, "Demo: Onboarding flow")
        draw_onboarding(d, t - 2)
    else:
        sec = t - 14
        draw_header(d, "Demo: Report breakdown")
        draw_report(d, sec)

    # Cross-fade around transition
    if 13.3 <= t <= 14.5:
        fade = clamp((t - 13.3) / 1.2)
        if fade < 0.5:
            overlay = Image.new("RGB", (W, H), (255, 255, 255))
            img = Image.blend(img, overlay, fade * 0.34)
        else:
            overlay = Image.new("RGB", (W, H), (255, 255, 255))
            img = Image.blend(img, overlay, (1 - fade) * 0.22)

    return np.array(img)


def main():
    out_path = Path("public/media/model-demo.mp4")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with imageio.get_writer(
        out_path,
        fps=FPS,
        codec="libx264",
        quality=8,
        format="FFMPEG",
        pixelformat="yuv420p",
    ) as writer:
        for i in range(TOTAL_FRAMES):
            writer.append_data(frame_at(i))
    print(f"Wrote {out_path} ({DURATION}s @ {FPS}fps)")


if __name__ == "__main__":
    main()

