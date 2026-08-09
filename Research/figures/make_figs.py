#!/usr/bin/env python3
"""Figures for the Notho Evidence Dossier. Brand palette from docs/REBRAND-NOTHO.md."""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.patches import Rectangle, FancyArrowPatch
import matplotlib.patheffects as pe

TEAL   = "#01A0AA"
PRIM   = "#007A85"
DARK   = "#005F68"
GOLD   = "#EFB343"
NAVY   = "#0D368D"
GREY   = "#8A8F98"
LGREY  = "#E4E7EB"
RED    = "#C0392B"
GREEN  = "#1E8449"

plt.rcParams.update({
    "font.family": "DejaVu Sans",
    "font.size": 9,
    "axes.edgecolor": "#B9BFC7",
    "axes.linewidth": 0.8,
    "axes.labelcolor": "#2A2F36",
    "text.color": "#2A2F36",
    "xtick.color": "#4A5058",
    "ytick.color": "#4A5058",
    "axes.titlesize": 11,
    "axes.titleweight": "bold",
    "figure.dpi": 200,
    "savefig.dpi": 200,
    "savefig.bbox": "tight",
    "savefig.facecolor": "white",
})

OUT = "figs/"

def finish(fig, name, note=None):
    if note:
        fig.text(0.01, -0.02, note, fontsize=6.6, color=GREY, ha="left", va="top", wrap=True)
    fig.savefig(OUT + name, facecolor="white")
    plt.close(fig)
    print("wrote", name)


# ---------------------------------------------------------------- FIG 1
# Forest plot: effect sizes across the evidence base
def fig1():
    rows = [
        # label, estimate, lo, hi, group   — ALL values and intervals as published
        ("Fernandes et al. (2014) → behaviour\nas re-estimated in Kaiser et al. (2020)", 0.018, -0.004, 0.022, "fin"),
        ("Kaiser et al. → behaviour,\ncommon-effect model", 0.065, 0.043, 0.089, "fin"),
        ("Kaiser et al. → behaviour,\nrandom-effects RVE (preferred)", 0.1003, 0.071, 0.129, "fin"),
        ("Kaiser et al. → behaviour,\n≥24 months after treatment", 0.0574, 0.0013, 0.1136, "fin"),
        ("Kaiser et al. → knowledge,\nrandom-effects RVE", 0.204, 0.152, 0.255, "fin"),
        ("Kaiser & Menkhoff (2017) — meta-regression\ncoefficient on ‘teachable moment’", 0.079, 0.038, 0.120, "mod"),
        ("Cannistrà et al. (2024) — game-based\ncourse → literacy (RCT, n = 2 220)", 0.313, None, None, "gam"),
        ("Sailer & Homner (2020) — gamification\n→ behavioural outcomes (k = 9)", 0.25, 0.04, 0.46, "gam"),
        ("Sailer & Homner (2020) — gamification\n→ motivational outcomes (k = 16)", 0.36, 0.18, 0.54, "gam"),
        ("Sailer & Homner (2020) — gamification\n→ cognitive outcomes (k = 19)", 0.49, 0.30, 0.69, "gam"),
        ("Rowland (2014) — retrieval practice vs\nrestudy (159 effect sizes)", 0.50, None, None, "learn"),
    ]
    colours = {"fin": NAVY, "gam": TEAL, "learn": PRIM, "mod": GOLD}
    labels  = {"fin": "Financial education", "gam": "Gamification",
               "learn": "Learning-science mechanics", "mod": "Design moderator"}

    fig, ax = plt.subplots(figsize=(8.2, 5.6))
    ys = np.arange(len(rows))[::-1]
    for y, (lab, d, lo, hi, g) in zip(ys, rows):
        c = colours[g]
        if lo is not None:
            ax.plot([lo, hi], [y, y], color=c, lw=2.2, solid_capstyle="round", alpha=.75)
            ax.plot([lo, lo], [y - .13, y + .13], color=c, lw=1.6, alpha=.75)
            ax.plot([hi, hi], [y - .13, y + .13], color=c, lw=1.6, alpha=.75)
            xt = hi + 0.02
        else:
            ax.plot([d], [y], marker="D", color=c, ms=6, mec="white", mew=1.0, zorder=3)
            xt = d + 0.03
        ax.plot([d], [y], "o", color=c, ms=8, mec="white", mew=1.2, zorder=4)
        lbl = f"{d:.3f}".rstrip("0").rstrip(".")
        if lo is None:
            lbl += "  (no CI published)"
        ax.text(xt, y, lbl, va="center", fontsize=7.6, color=c, fontweight="bold")
    ax.set_yticks(ys)
    ax.set_yticklabels([r[0] for r in rows], fontsize=7.4)
    ax.axvline(0, color="#444", lw=0.9)
    for x, lbl in [(0.2, "small"), (0.5, "medium")]:
        ax.axvline(x, color=LGREY, lw=0.9, ls="--", zorder=0)
        ax.text(x, len(rows) - 0.35, lbl, fontsize=7, color=GREY, ha="center")
    ax.set_xlim(-0.06, 0.86)
    ax.set_xlabel("Standardised effect size (SD units / Hedges' g). Bars are published 95% confidence intervals.")
    ax.set_title("The evidence base Notho stands on, to scale",
                 loc="left", pad=22)
    ax.spines[["top", "right", "left"]].set_visible(False)
    ax.tick_params(axis="y", length=0)
    handles = [plt.Line2D([], [], color=colours[k], lw=3, label=labels[k])
               for k in ["fin", "mod", "gam", "learn"]]
    ax.legend(handles=handles, loc="upper right", frameon=True, framealpha=.95,
              edgecolor="none", fontsize=7.5)
    finish(fig, "fig01_forest.png",
           "All point estimates and intervals as published. Kaiser et al. figures from NBER WP 27057 (2020), the working-paper version of the 2022 "
           "Journal of Financial Economics article; the Fernandes et al. (2014) value is their estimate as re-computed by Kaiser et al. for direct comparison. "
           "Kaiser & Menkhoff (2017) interval computed from the published coefficient 0.079 and standard error 0.021. Cannistrà et al. (2024) and "
           "Rowland (2014) are plotted as point estimates because no interval is reported in the sources consulted. Cohen's thresholds shown for reference only.")


# ---------------------------------------------------------------- FIG 2
# SA financial literacy across instruments
def fig2():
    fig, (a1, a2) = plt.subplots(1, 2, figsize=(8.2, 3.5),
                                 gridspec_kw={"width_ratios": [1.15, 1]})
    names = ["FSCA/HSRC 2020\ncomposite score",
             "S&P Global FinLit\n(2015)",
             "NIDS Wave 5\n(Nanziri & Olckers 2019)",
             "OECD/INFE 2016\nknowledge minimum"]
    vals = [52, 42, 40.6, 31]
    bars = a1.barh(names[::-1], vals[::-1], color=[GREY, PRIM, TEAL, NAVY][::-1], height=.62)
    for b, v in zip(bars, vals[::-1]):
        a1.text(v + 1.5, b.get_y() + b.get_height()/2, f"{v}%", va="center",
                fontsize=8.5, fontweight="bold", color="#2A2F36")
    a1.set_xlim(0, 72)
    a1.set_xlabel("Score / % classified financially literate")
    a1.set_title("Four instruments, four answers", loc="left", fontsize=9.5)
    a1.spines[["top", "right", "left"]].set_visible(False)
    a1.tick_params(axis="y", length=0, labelsize=7.6)

    # inflation question — single published value, no invented comparators
    a2.axis("off")
    a2.add_patch(Rectangle((0.04, 0.30), 0.92, 0.52, transform=a2.transAxes,
                           facecolor="#FBF0EF", edgecolor=RED, lw=1.2))
    a2.text(0.5, 0.70, "25%", transform=a2.transAxes, ha="center", va="center",
            fontsize=40, fontweight="bold", color=RED)
    a2.text(0.5, 0.455, "of South African adults answered the\ninflation question correctly",
            transform=a2.transAxes, ha="center", va="center", fontsize=8.4, linespacing=1.5)
    a2.text(0.5, 0.345, "among the lowest of 39 economies surveyed",
            transform=a2.transAxes, ha="center", va="center", fontsize=7.4,
            style="italic", color="#7a3a33")
    a2.text(0.5, 0.20, "OECD/INFE 2023 International Survey\nof Adult Financial Literacy",
            transform=a2.transAxes, ha="center", va="center", fontsize=6.8, color=GREY, linespacing=1.4)
    a2.set_title("The single worst result: inflation", loc="left", fontsize=9.5)
    fig.suptitle("South African financial literacy is not one number",
                 x=0.005, ha="left", fontsize=11, fontweight="bold", y=1.04)
    finish(fig, "fig02_literacy.png",
           "Left: FSCA/HSRC (2020) composite score out of 100; S&P Global FinLit (Klapper, Lusardi & van Oudheusden, 2015) and NIDS Wave 5 "
           "(Nanziri & Olckers, 2019) percentages classified financially literate; OECD/INFE (2016) minimum-target knowledge score. These are "
           "different constructs and are not directly comparable. Right: OECD/INFE (2023). No comparator country values are shown because no "
           "verified per-country figures were obtained for this dossier.")


# ---------------------------------------------------------------- FIG 3
# Household stress dashboard
def fig3():
    fig, axes = plt.subplots(1, 4, figsize=(8.4, 2.9))
    panels = [
        ("Household debt\nto disposable income", 62.2, 100, "%", "SARB QB, Q1 2026", PRIM),
        ("Debt-service cost\nof disposable income", 8.4, 20, "%", "SARB QB, Q1 2026", TEAL),
        ("Credit-active consumers\nwith impaired records", 36.0, 100, "%", "NCR CBM Q3 2024", GOLD),
        ("On track for a\ncomfortable retirement", 6.0, 100, "%", "10X RRR", RED),
    ]
    for ax, (title, val, cap, unit, src, col) in zip(axes, panels):
        ang = np.linspace(np.pi, 0, 200)
        ax.plot(np.cos(ang), np.sin(ang), color=LGREY, lw=9, solid_capstyle="butt")
        frac = val / cap
        ang2 = np.linspace(np.pi, np.pi - np.pi * frac, 200)
        ax.plot(np.cos(ang2), np.sin(ang2), color=col, lw=9, solid_capstyle="butt")
        ax.text(0, 0.18, f"{val:g}{unit}", ha="center", fontsize=17, fontweight="bold", color=col)
        ax.text(0, -0.22, title, ha="center", fontsize=7.6, linespacing=1.35)
        ax.text(0, -0.62, src, ha="center", fontsize=6.2, color=GREY)
        ax.set_xlim(-1.25, 1.25); ax.set_ylim(-0.75, 1.2); ax.axis("off")
    fig.suptitle("The downstream damage is measurable, and it is not improving",
                 x=0.005, ha="left", fontsize=11, fontweight="bold", y=1.02)
    finish(fig, "fig03_stress.png",
           "Gauge scales: debt-to-income and impairment shown against 100%; debt-service cost against a 20% ceiling for legibility.")


# ---------------------------------------------------------------- FIG 4
# Two-pot cumulative
def fig4():
    fig, ax = plt.subplots(figsize=(8.2, 3.4))
    xs = ["Sep 2024\nlaunch", "Jan 2025\n(5 months)", "Feb 2025\n(6 months)", "Feb 2026\n(18 months)"]
    vals = [0, 43.42, 47.7, 79.3]
    tax  = [0, 12.9, 13.0, 21.4]
    x = np.arange(len(xs))
    ax.fill_between(x, vals, color=TEAL, alpha=.16)
    ax.plot(x, vals, "-o", color=PRIM, lw=2.4, ms=7, mec="white", mew=1.4, label="Gross withdrawals approved (R bn)")
    ax.plot(x, tax, "-o", color=GOLD, lw=2.0, ms=6, mec="white", mew=1.2, label="Tax collected on withdrawals (R bn)")
    for xi, v in zip(x, vals):
        if v: ax.annotate(f"R{v:g}bn", (xi, v), textcoords="offset points", xytext=(0, 9),
                          ha="center", fontsize=8, fontweight="bold", color=PRIM)
    for xi, v in zip(x, tax):
        if v: ax.annotate(f"R{v:g}bn", (xi, v), textcoords="offset points", xytext=(0, -15),
                          ha="center", fontsize=7.5, color="#9a7318")
    ax.set_xticks(x); ax.set_xticklabels(xs, fontsize=8)
    ax.set_ylabel("Cumulative, R billion")
    ax.set_ylim(0, 92)
    ax.set_title("Two-pot: the largest involuntary financial-literacy event in SA history",
                 loc="left", pad=12)
    ax.spines[["top", "right"]].set_visible(False)
    ax.legend(frameon=False, fontsize=8, loc="upper left")
    ax.text(0.02, 0.60, "5.6 million tax directives applied for\nby 28 February 2026",
            transform=ax.transAxes, fontsize=8.2, color=NAVY, fontweight="bold",
            bbox=dict(boxstyle="round,pad=0.45", fc="#EEF6F7", ec=TEAL, lw=.8))
    finish(fig, "fig04_twopot.png",
           "Sources: SARS media release 31 Jan 2025; Moneyweb / SARS data to 28 Feb 2026. SARS' original first-year forecast was ~R5bn of tax.")


# ---------------------------------------------------------------- FIG 5
# Notho pedagogy scorecard vs evidence
def fig5():
    mechanics = [
        ("Retrieval practice\n(question-first lessons)", 0.50, 5, "Every lesson is answer-driven; 2 440 authored variants"),
        ("Mastery / re-queue loop\n(lesson ends only at 100%)", 0.45, 5, "lessonMastery.ts re-queues misses to the end"),
        ("Spaced repetition\n(SM-2 on 168 concepts)", 0.28, 4, "Built; misses reset interval to 1 day"),
        ("Variability / interleaving\n(4 slots × 3 variants)", 0.30, 4, "Anti-memorisation pool; selection not yet SR-weighted"),
        ("Gamified feedback\n(XP, badges, levels)", 0.36, 3, "Present; risk of overjustification unmeasured"),
        ("Streaks with forgiveness\n(freezes + repair)", 0.25, 4, "Forgiveness mechanic is evidence-aligned"),
        ("Just-in-time delivery\nat teachable moments", 0.079, 2, "Push/lifecycle crons exist; not moment-triggered"),
        ("Commitment devices\n(goals, automated rules)", 0.60, 1, "Goals exist as gamified quests, not binding devices"),
        ("Rules-of-thumb framing\nover curriculum", 0.35, 2, "Curriculum-shaped: 22 courses, ~199 lessons"),
        ("Personalised follow-up\n/ counselling complement", 0.40, 2, "Cosmo AI chat, but not outcome-directed"),
    ]
    fig, ax = plt.subplots(figsize=(8.4, 5.0))
    ys = np.arange(len(mechanics))[::-1]
    for y, (name, ev, impl, note) in zip(ys, mechanics):
        # evidence strength bar (left, mirrored)
        ax.barh(y, -ev, color=NAVY, alpha=.80, height=.52)
        ax.text(-ev - 0.02, y, f"{ev:.2f}".rstrip("0").rstrip("."), va="center", ha="right",
                fontsize=7.6, color=NAVY, fontweight="bold")
        # implementation 0-5 scaled to same axis
        w = impl / 5 * 0.72
        col = GREEN if impl >= 4 else (GOLD if impl == 3 else RED)
        ax.barh(y, w, left=0.10, color=col, alpha=.85, height=.52)
        ax.text(0.10 + w + 0.012, y, f"{impl}/5", va="center", fontsize=7.6,
                color=col, fontweight="bold")
        ax.text(0.98, y, note, va="center", fontsize=6.6, color="#454b53")
    ax.set_yticks(ys)
    ax.set_yticklabels([m[0] for m in mechanics], fontsize=7.4)
    ax.axvline(0.05, color="#CBD1D8", lw=.9)
    ax.set_xlim(-0.75, 2.35)
    ax.set_xticks([-0.6, -0.3, 0, 0.10, 0.46, 0.82])
    ax.set_xticklabels(["0.6", "0.3", "0", "0", "", "5"], fontsize=7)
    ax.text(-0.35, len(mechanics)-0.25, "← published effect size (SD)", fontsize=7.6,
            color=NAVY, ha="center", fontweight="bold")
    ax.text(0.45, len(mechanics)-0.25, "Notho implementation strength →", fontsize=7.6,
            color=PRIM, ha="center", fontweight="bold")
    ax.set_title("Does Notho build what the evidence rewards?",
                 loc="left", pad=20)
    ax.spines[["top", "right", "left", "bottom"]].set_visible(False)
    ax.tick_params(axis="both", length=0)
    finish(fig, "fig05_pedagogy.png",
           "Left bars: representative published effect sizes for the mechanic (see Figure 1 and the reference list); commitment-device and "
           "counselling figures are indicative of the field-experiment literature rather than single pooled estimates. "
           "Right bars: this dossier's assessment of Notho's current implementation, graded 0–5 from the codebase.")


# ---------------------------------------------------------------- FIG 6
# Competitive positioning
def fig6():
    fig, ax = plt.subplots(figsize=(8.2, 5.2))
    # x = distribution reach (log users), y = depth of dedicated financial-literacy pedagogy (0-10)
    pts = [
        ("Capitec MoneyUp\nAcademy", 15_300_000, 6.0, TEAL, 1700),
        ("Discovery Vitality\nMoney", 1_200_000, 5.5, NAVY, 900),
        ("Vault22", 200_000, 3.5, GREY, 620),
        ("Franc", 120_000, 4.5, GOLD, 480),
        ("Old Mutual\nOn The Money", 400_000, 4.0, "#7D8B99", 520),
        ("Absa ReadyToWork", 548_000, 4.5, "#6F7C8A", 540),
        ("EasyEquities +\nJust One Lap", 2_600_000, 3.0, "#9AA5B1", 800),
        ("Notho", 3_000, 8.6, PRIM, 380),
    ]
    for name, users, depth, col, size in pts:
        ax.scatter(users, depth, s=size, color=col, alpha=.55, edgecolors=col, linewidths=1.6, zorder=3)
        dy = 0.45 if name != "Notho" else -0.85
        ax.annotate(name, (users, depth), textcoords="offset points", xytext=(0, 14 if dy > 0 else -30),
                    ha="center", fontsize=7.4, fontweight="bold" if name == "Notho" else "normal",
                    color=col if name == "Notho" else "#3A4048")
    ax.set_xscale("log")
    ax.set_xlim(800, 4e7)
    ax.set_ylim(1.2, 10.4)
    ax.set_xlabel("Reach — registered users / app users (log scale)")
    ax.set_ylabel("Depth of dedicated learning design  (0–10, this dossier's assessment)")
    ax.set_title("Notho owns the pedagogy corner and none of the distribution",
                 loc="left", pad=12)
    ax.grid(alpha=.18, ls=":")
    ax.spines[["top", "right"]].set_visible(False)
    ax.axhspan(7, 10.4, color=PRIM, alpha=.05)
    ax.axvspan(1e6, 4e7, color=GOLD, alpha=.05)
    ax.text(1.6e6, 9.6, "the quadrant nobody occupies:\ndeep pedagogy at national scale",
            fontsize=7.8, color="#5A6069", style="italic")
    arr = FancyArrowPatch((4e3, 8.4), (7e5, 8.6), arrowstyle="-|>", mutation_scale=13,
                          color=PRIM, lw=1.5, ls=(0, (4, 3)), alpha=.8)
    ax.add_patch(arr)
    ax.text(3e4, 8.05, "the only strategically\ncoherent move", fontsize=7, color=PRIM, style="italic")
    finish(fig, "fig06_position.png",
           "Reach: Capitec 15.3m app users (FY to Feb 2026); Purple Group/EasyEquities 2.6m registered; Absa ReadyToWork 548 100 cumulative; Old Mutual On The Money ~400 000 workshop participants (lifetime); Vault22 ~200 000 pre-registered at launch (Nov 2024); Discovery Bank ~1.2m accounts (carried from May 2026, not re-verified). "
           "Notho reach is an order-of-magnitude placeholder — no verified public user count exists. Depth scores are this dossier's judgement.")


# ---------------------------------------------------------------- FIG 7
# Feature matrix heatmap
def fig7():
    feats = ["Structured\ncurriculum", "Question banks /\nanti-memorisation", "Spaced\nrepetition",
             "Mastery\ncompletion", "Streaks &\nforgiveness", "SA-specific\ntax & product detail",
             "Bank statement\nimport", "Behavioural\nreport", "AI coach", "Faith-based\ncontent",
             "Professional exam\nprep (RE5)", "Distribution\nat scale", "Payment /\nmonetisation live",
             "Vernacular\nlanguages", "Native app\nstore presence"]
    apps = ["Notho", "Capitec\nMoneyUp", "Vault22", "Franc", "Discovery\nVitality Money", "Bank literacy\nprogrammes"]
    #        0 none, 1 partial, 2 full
    M = np.array([
        [2,2,2,2,2,2,2,2,2,2,2,0,0,0,1],   # Notho  (native = capacitor shell, not shipped)
        [2,0,0,1,1,2,2,1,1,0,0,2,2,1,2],   # Capitec MoneyUp
        [1,0,0,0,1,2,2,2,1,0,0,1,2,0,2],   # Vault22
        [1,0,0,0,1,2,1,1,0,0,0,1,2,0,2],   # Franc
        [1,0,0,0,2,2,2,2,1,0,0,1,2,0,2],   # Discovery
        [1,0,0,0,0,2,0,0,0,0,0,2,2,1,2],   # Bank programmes
    ])
    fig, ax = plt.subplots(figsize=(8.6, 3.6))
    cmap = matplotlib.colors.ListedColormap(["#F2F4F6", GOLD, PRIM])
    ax.imshow(M, cmap=cmap, aspect="auto", vmin=0, vmax=2)
    ax.set_xticks(range(len(feats))); ax.set_xticklabels(feats, fontsize=6.3, rotation=42, ha="right")
    ax.set_yticks(range(len(apps)));  ax.set_yticklabels(apps, fontsize=7.4)
    for i in range(M.shape[0]):
        for j in range(M.shape[1]):
            s = {0: "–", 1: "~", 2: "●"}[M[i, j]]
            ax.text(j, i, s, ha="center", va="center", fontsize=8,
                    color="white" if M[i, j] == 2 else ("#7a5a10" if M[i, j] == 1 else "#AAB0B8"))
    ax.set_xticks(np.arange(-.5, len(feats), 1), minor=True)
    ax.set_yticks(np.arange(-.5, len(apps), 1), minor=True)
    ax.grid(which="minor", color="white", lw=2.2)
    ax.tick_params(which="minor", length=0); ax.tick_params(length=0)
    ax.set_title("Feature coverage: Notho wins the learning column and loses the business column",
                 loc="left", pad=10, fontsize=10.5)
    handles = [Rectangle((0,0),1,1, fc=c) for c in [PRIM, GOLD, "#F2F4F6"]]
    ax.legend(handles, ["full", "partial", "absent"], ncol=3, frameon=False,
              fontsize=7, loc="upper left", bbox_to_anchor=(0.0, -0.55))
    finish(fig, "fig07_features.png",
           "Assessment as at August 2026 from public product surfaces and, for Notho, from the repository. "
           "Notho's native-store cell is 'partial': a Capacitor shell exists in-repo but nothing has been submitted.")


# ---------------------------------------------------------------- FIG 8
# TAM SAM SOM funnel
def fig8():
    fig, ax = plt.subplots(figsize=(8.2, 4.4))
    stages = [
        ("TAM — SA working-age population 15–64\n(Stats SA MYPE 2025)", 42.4, "42.4m", NAVY),
        ("With internet access, mobile-dominated\n(ICASA 2026: 82.1%)", 34.8, "34.8m", PRIM),
        ("SAM — employed\n(Stats SA QLFS Q1:2026)", 16.8, "16.8m", TEAL),
        ("Employed, banked, with\ndiscretionary income (dossier estimate)", 6.0, "~6m", "#7BC5CA"),
        ("SOM Yr 3 — registered users,\nbase case (dossier estimate)", 0.25, "~250k", GOLD),
        ("Paying subscribers at 4%\n(dossier estimate)", 0.010, "~10k", RED),
    ]
    maxw = 1.0
    y = 0
    for i, (label, val, lab, col) in enumerate(stages):
        w = (val / stages[0][1]) ** 0.42 * maxw
        ax.add_patch(Rectangle((-w/2, -y-0.42), w, 0.72, color=col, alpha=.85))
        ax.text(0, -y-0.06, lab, ha="center", va="center", fontsize=10.5,
                fontweight="bold", color="white",
                path_effects=[pe.withStroke(linewidth=1.6, foreground=col)])
        ax.text(w/2 + 0.05, -y-0.06, label, ha="left", va="center", fontsize=8, color="#2A2F36")
        y += 0.88
    ax.set_xlim(-0.72, 1.35); ax.set_ylim(-y, 0.5); ax.axis("off")
    ax.set_title("From 38 million to ten thousand: the funnel that matters",
                 loc="left", fontsize=11, pad=8)
    finish(fig, "fig08_funnel.png",
           "TAM from Stats SA mid-year estimates; connectivity from ICASA State of the ICT Sector 2026 (82.1% internet access, mobile-dominated); "
           "employment from Stats SA QLFS Q1:2026 (16.8m employed). SOM is this dossier's base case, not a forecast. "
           "At R79/month and 4% conversion, ~10 000 subscribers ≈ R9.5m annual subscription revenue.")


# ---------------------------------------------------------------- FIG 9
# Price ladder
def fig9():
    fig, ax = plt.subplots(figsize=(8.2, 3.6))
    items = [("MoneyUp Academy\n(Capitec, free)", 0, GREEN),
             ("Disney+\n(entry plan)", 49, GREY),
             ("Netflix Mobile", 59, GREY),
             ("1GB prepaid data\n(monthly, 2025)", 79, GOLD),
             ("Notho Pro\n(planned)", 79, PRIM),
             ("Netflix Premium", 199, "#9AA5B1")]
    items.sort(key=lambda t: t[1])
    names = [i[0] for i in items]; vals = [i[1] for i in items]; cols = [i[2] for i in items]
    b = ax.bar(names, vals, color=cols, width=.6)
    for bb, v in zip(b, vals):
        ax.text(bb.get_x()+bb.get_width()/2, v+3.5, f"R{v}", ha="center", fontsize=8.5, fontweight="bold")
    ax.axhspan(29, 49, color=TEAL, alpha=.10)
    ax.text(0.02, 0.62, "the SA mass-market\nsubscription comfort band\n(R29–R49)", transform=ax.transAxes,
            fontsize=7.6, color=PRIM, fontweight="bold")
    ax.set_ylabel("Rand per month")
    ax.set_ylim(0, 232)
    ax.set_title("Notho Pro is priced at a month of mobile data, against a free direct competitor",
                 loc="left", pad=10, fontsize=10.5)
    ax.spines[["top", "right"]].set_visible(False)
    ax.tick_params(axis="x", labelsize=7.2)
    finish(fig, "fig09_price.png",
           "Streaming prices are South African list prices reported in 2026 trade sources; they change frequently and should be re-checked before external use. "
           "Showmax is excluded because it closed permanently on 30 April 2026. Data price is the reported average prepaid 1GB 30-day bundle in 2025. "
           "Notho Pro is the planned price in the March 2026 business plan and is not currently chargeable — no payment infrastructure exists.")


# ---------------------------------------------------------------- FIG 10
# Retention benchmarks
def fig10():
    fig, ax = plt.subplots(figsize=(8.2, 3.6))
    days = [1, 7, 30]
    series = {
        "Education apps (global median)": ([14.5, 5.0, 2.1], GREY, "-"),
        "Finance / banking apps": ([30.3, 18.0, 11.6], NAVY, "-"),
        "All categories": ([25.0, 10.0, 5.0], "#C2C8D0", ":"),
        "Notho business-plan target": ([55.0, 40.0, 25.0], PRIM, "--"),
    }
    for lab, (vals, col, ls) in series.items():
        ax.plot(days, vals, ls, color=col, lw=2.4 if col == PRIM else 1.9,
                marker="o", ms=6, mec="white", mew=1.2, label=lab)
        ax.annotate(f"{vals[-1]:.1f}%", (30, vals[-1]), textcoords="offset points",
                    xytext=(8, 0), fontsize=7.8, color=col, fontweight="bold")
    ax.set_xticks(days); ax.set_xticklabels(["Day 1", "Day 7", "Day 30"])
    ax.set_ylabel("% of installs still active")
    ax.set_ylim(0, 62); ax.set_xlim(0.5, 34)
    ax.set_title("The retention target in the business plan is 12× the education-app benchmark",
                 loc="left", pad=10, fontsize=10.5)
    ax.legend(frameon=False, fontsize=7.6)
    ax.spines[["top", "right"]].set_visible(False)
    ax.grid(alpha=.16, ls=":")
    finish(fig, "fig10_retention.png",
           "Benchmarks are 2025–26 industry medians and vary widely by source and measurement window. The Notho line plots the plan's stated "
           "40% Day-7 goal with Day-1 and Day-30 points interpolated on the same curve shape for comparison.")


# ---------------------------------------------------------------- FIG 11
# LTV:CAC sensitivity heatmap
def fig11():
    arpu = np.array([29, 39, 49, 79, 99])          # R/month
    life  = np.array([3, 6, 9, 12, 18, 24])        # months
    CAC = 175.0
    ratio = np.outer(arpu, life) / CAC
    fig, ax = plt.subplots(figsize=(7.4, 3.6))
    im = ax.imshow(ratio, cmap="RdYlGn", vmin=0, vmax=8, aspect="auto")
    ax.set_xticks(range(len(life))); ax.set_xticklabels([f"{m}m" for m in life])
    ax.set_yticks(range(len(arpu))); ax.set_yticklabels([f"R{a}" for a in arpu])
    ax.set_xlabel("Average paying lifetime")
    ax.set_ylabel("Monthly ARPU")
    for i in range(len(arpu)):
        for j in range(len(life)):
            v = ratio[i, j]
            ax.text(j, i, f"{v:.1f}", ha="center", va="center", fontsize=8,
                    fontweight="bold" if v >= 3 else "normal",
                    color="#1b1b1b")
    ax.set_title("LTV : CAC at a R175 blended acquisition cost", loc="left", pad=10, fontsize=10.5)
    cb = fig.colorbar(im, ax=ax, fraction=.035, pad=.02)
    cb.set_label("LTV : CAC", fontsize=8)
    cb.ax.tick_params(labelsize=7)
    ax.plot(3, 3, marker="s", ms=17, mfc="none", mec=NAVY, mew=2.2)
    ax.annotate("business-plan\nassumption", (3, 3), textcoords="offset points", xytext=(0, -34),
                ha="center", fontsize=7, color=NAVY, fontweight="bold")
    finish(fig, "fig11_ltvcac.png",
           "CAC of R175 derived from SA Meta CPM (~$2.82) at 1% CTR, 20% install, 30% signup, 5% paid conversion — an optimistic chain. "
           "Gross of payment-processing fees, VAT and support cost. A ratio below 3.0 is generally considered unfundable for consumer subscription.")


# ---------------------------------------------------------------- FIG 12
# Build completeness
def fig12():
    items = [
        ("Learning engine (banks, SR, mastery)", 95, GREEN),
        ("SA-specific content depth", 90, GREEN),
        ("Budget / statement import", 80, GREEN),
        ("Gamification systems", 85, GREEN),
        ("Analytics instrumentation (defined)", 75, GREEN),
        ("Compliance surfaces (POPIA, AI disclosure)", 70, GOLD),
        ("Behaviour-outcome measurement", 25, RED),
        ("Native app store presence", 20, RED),
        ("Marketing landing page / funnel", 5, RED),
        ("Payment + subscription infrastructure", 0, RED),
        ("Vernacular language support", 0, RED),
        ("Distribution partnerships signed", 0, RED),
        ("Just-in-time / moment triggers", 15, RED),
        ("Commitment devices", 10, RED),
    ]
    fig, ax = plt.subplots(figsize=(8.2, 4.6))
    ys = np.arange(len(items))[::-1]
    for y, (name, pct, col) in zip(ys, items):
        ax.barh(y, 100, color="#F1F3F5", height=.6)
        ax.barh(y, pct, color=col, height=.6, alpha=.9)
        ax.text(101.5, y, f"{pct}%", va="center", fontsize=7.8, fontweight="bold", color=col)
    ax.set_yticks(ys); ax.set_yticklabels([i[0] for i in items], fontsize=7.8)
    ax.set_xlim(0, 112); ax.set_xticks([0, 25, 50, 75, 100])
    ax.set_xlabel("Completeness (this dossier's assessment of the repository, August 2026)")
    ax.set_title("Notho is a finished learning product attached to an unbuilt business",
                 loc="left", pad=10)
    ax.spines[["top", "right", "left"]].set_visible(False)
    ax.tick_params(axis="y", length=0)
    ax.axvline(50, color="#CBD1D8", lw=.8, ls=":")
    finish(fig, "fig12_completeness.png",
           "Scored from the repository at commit d5f5b1b. 'Payment infrastructure 0%' reflects that no payment provider "
           "(PayFast, Paystack, Yoco, Stripe, RevenueCat) appears in the codebase and no subscription table exists in the Supabase migrations, "
           "although paywall analytics events are already specified.")


# ---------------------------------------------------------------- FIG 13
# Revenue model stress test
def fig13():
    fig, ax = plt.subplots(figsize=(8.2, 3.8))
    streams = ["Notho Pro\nsubscriptions", "B2B corporate\nwellness", "Advisor\nlead-gen", "Branded\npartnerships", "Workshops"]
    plan   = [474_000, 60_000, 20_000, 0, 72_000]
    benchmark_low  = [0, 0, 0, 0, 36_000]
    benchmark_high = [95_000, 60_000, 12_000, 0, 90_000]
    x = np.arange(len(streams)); w = .34
    ax.bar(x - w/2, plan, w, color=GOLD, label="Business-plan Year 1 target")
    ax.bar(x + w/2, benchmark_high, w, color=PRIM, label="Benchmark-implied Year 1 ceiling")
    for xi, (p, b) in enumerate(zip(plan, benchmark_high)):
        ax.text(xi - w/2, p + 12000, f"R{p/1000:.0f}k", ha="center", fontsize=7.6, fontweight="bold", color="#8a6a10")
        ax.text(xi + w/2, b + 12000, f"R{b/1000:.0f}k", ha="center", fontsize=7.6, fontweight="bold", color=PRIM)
    ax.set_xticks(x); ax.set_xticklabels(streams, fontsize=7.6)
    ax.set_ylabel("Year 1 revenue (Rand)")
    ax.set_ylim(0, 560_000)
    ax.set_yticks([0, 100_000, 200_000, 300_000, 400_000, 500_000])
    ax.set_yticklabels(["0", "R100k", "R200k", "R300k", "R400k", "R500k"])
    ax.set_title("The subscription line carries 74% of the plan and is the least defensible",
                 loc="left", pad=10, fontsize=10.5)
    ax.legend(frameon=False, fontsize=7.8)
    ax.spines[["top", "right"]].set_visible(False)
    finish(fig, "fig13_revenue.png",
           "Benchmark ceiling assumes 10 000 registered users in Year 1 (aggressive without a partner), 4% paid conversion at R79/month with "
           "8-month average paying life. It also assumes zero revenue is possible until payment infrastructure exists — which today it does not.")


for f in [fig1, fig2, fig3, fig4, fig5, fig6, fig7, fig8, fig9, fig10, fig11, fig12, fig13]:
    f()
print("all figures done")
