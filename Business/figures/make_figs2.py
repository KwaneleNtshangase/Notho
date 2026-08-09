#!/usr/bin/env python3
"""Figures for the Notho judge-prep and funding documents."""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.patches import Rectangle
import matplotlib.patheffects as pe

TEAL="#01A0AA"; PRIM="#007A85"; DARK="#005F68"; GOLD="#EFB343"
NAVY="#0D368D"; GREY="#8A8F98"; LGREY="#E4E7EB"; RED="#C0392B"; GREEN="#1E8449"

plt.rcParams.update({
    "font.family":"DejaVu Sans","font.size":9,"axes.edgecolor":"#B9BFC7","axes.linewidth":0.8,
    "axes.labelcolor":"#2A2F36","text.color":"#2A2F36","xtick.color":"#4A5058","ytick.color":"#4A5058",
    "axes.titlesize":11,"axes.titleweight":"bold","figure.dpi":200,"savefig.dpi":200,
    "savefig.bbox":"tight","savefig.facecolor":"white",
})
OUT="figs2/"

def finish(fig,name,note=None):
    if note: fig.text(0.01,-0.02,note,fontsize=6.6,color=GREY,ha="left",va="top",wrap=True)
    fig.savefig(OUT+name,facecolor="white"); plt.close(fig); print("wrote",name)

def rands(n): return f"R{n:,.0f}".replace(",", " ")

# ---------------------------------------------------------------- J1
# Judge question bank: readiness heat map
def j1():
    cats = ["Founder & team","Problem & evidence","Product & learning science",
            "Gamification & behaviour","Market & competition","Model & unit economics",
            "Traction & measurement","Regulatory & ethics","Technology & scale",
            "Impact & sustainability","Funding & use of proceeds","Curveballs"]
    # strong / partial / cannot-answer-today
    strong  = [12, 17, 18, 11,  13, 8,  2,  7,  9,  8,  6,  7]
    partial = [ 7,  3,  3,  4,   5, 7,  4,  6,  3,  5,  4,  5]
    weak    = [ 4,  1,  1,  2,   3, 6,  9,  3,  1,  3,  3,  4]
    fig, ax = plt.subplots(figsize=(8.3,4.6))
    ys = np.arange(len(cats))[::-1]
    for y,(s,p,w) in zip(ys, zip(strong,partial,weak)):
        ax.barh(y, s, color=GREEN, alpha=.88, height=.6)
        ax.barh(y, p, left=s, color=GOLD, alpha=.9, height=.6)
        ax.barh(y, w, left=s+p, color=RED, alpha=.85, height=.6)
        ax.text(s+p+w+0.4, y, f"{s+p+w}", va="center", fontsize=7.6, color="#4A5058", fontweight="bold")
    ax.set_yticks(ys); ax.set_yticklabels(cats, fontsize=7.8)
    ax.set_xlabel("Number of questions in the bank")
    ax.set_xlim(0, 30)
    ax.set_title("Where Notho is ready for the room, and where it is not",
                 loc="left", pad=26)
    ax.spines[["top","right","left"]].set_visible(False)
    ax.tick_params(axis="y", length=0)
    h=[Rectangle((0,0),1,1,fc=c,alpha=.88) for c in [GREEN,GOLD,RED]]
    ax.legend(h,["Can answer well today","Can answer partially","Cannot answer today"],
              ncol=3, frameon=False, fontsize=7.6, loc="upper left", bbox_to_anchor=(0,1.10))
    finish(fig,"figJ1_readiness.png",
           "Assessment of 214 questions against the evidence available at 9 August 2026. 'Cannot answer today' means the answer "
           "depends on something that does not yet exist — most often measured outcomes, revenue, or a signed partner.")

# ---------------------------------------------------------------- F1
# Three tiers
def f1():
    tiers = ["Tier 0\nSurvival\n12 months","Tier 1\nLaunch\n12 months","Tier 2\nScale\n24 months"]
    comps = {
        "Infrastructure & tooling":      [ 8_898,  20_821, 150_000],
        "Legal, compliance & insurance": [ 8_370,  87_370, 159_040],
        "Accounting & statutory":        [14_400,  21_600,  43_200],
        "Build work (contracted)":       [     0, 161_250,  82_500],
        "Content & translation":         [     0,  96_000, 587_128],
        "Salaries (excl. founder)":      [     0,       0, 726_894],
        "Marketing":                     [     0,  60_000, 300_000],
        "Evaluation / RCT":              [     0,       0, 220_000],
        "Contingency 10%":               [ 3_167,  44_704, 226_876],
    }
    cols = [PRIM,NAVY,TEAL,GOLD,"#7BC5CA","#5A6069",RED,GREEN,GREY]
    fig, ax = plt.subplots(figsize=(8.3,4.8))
    x = np.arange(3); bottom = np.zeros(3)
    for (lab,vals),c in zip(comps.items(),cols):
        v=np.array(vals,dtype=float)
        ax.bar(x, v, .52, bottom=bottom, color=c, label=lab, edgecolor="white", linewidth=.6)
        bottom += v
    for xi,t in zip(x,bottom):
        ax.text(xi, t+70_000, rands(t), ha="center", fontsize=10.5, fontweight="bold", color=NAVY)
    ax.set_xticks(x); ax.set_xticklabels(tiers, fontsize=8.4)
    ax.set_ylabel("Rand")
    ax.set_ylim(0, 3_000_000)
    ax.set_yticks([0,500_000,1_000_000,1_500_000,2_000_000,2_500_000])
    ax.set_yticklabels(["0","R500k","R1.0m","R1.5m","R2.0m","R2.5m"])
    ax.set_title("What each tier costs, and what it is made of", loc="left", pad=10)
    ax.spines[["top","right"]].set_visible(False)
    ax.legend(frameon=False, fontsize=7.2, ncol=2, loc="upper left")
    finish(fig,"figF1_tiers.png",
           "Excludes any founder salary, which is presented separately in Figure F4. Every line item is costed in Appendix A of this document "
           "with its source and date. Tier 2 is a 24-month figure; Tiers 0 and 1 are 12-month figures.")

# ---------------------------------------------------------------- F2
# Tier 1 breakdown
def f2():
    items = [
        ("Measurement spine (80 hrs)", 60_000, NAVY),
        ("Content author, part-time (12 mo)", 96_000, TEAL),
        ("Marketing pilot", 60_000, RED),
        ("Contingency 10%", 44_704, GREY),
        ("Payment rails (50 hrs)", 37_500, PRIM),
        ("Landing page & funnel (45 hrs)", 33_750, PRIM),
        ("FAIS content & AI review", 30_000, GOLD),
        ("App store submission (40 hrs)", 30_000, PRIM),
        ("Trade mark, 3 classes", 29_000, GOLD),
        ("Accounting & bookkeeping", 21_600, "#7BC5CA"),
        ("Terms, privacy & POPIA review", 20_000, GOLD),
        ("Infrastructure & tooling", 18_812, DARK),
        ("Professional indemnity cover", 7_920, GOLD),
        ("Apple + Google developer", 2_009, DARK),
        ("CIPC annual return", 450, "#7BC5CA"),
    ]
    fig, ax = plt.subplots(figsize=(8.3,4.6))
    ys=np.arange(len(items))[::-1]
    tot=sum(i[1] for i in items)
    for y,(n,v,c) in zip(ys,items):
        ax.barh(y,v,color=c,height=.62,alpha=.9)
        ax.text(v+7_000,y,f"{rands(v)}   ({v/tot*100:.1f}%)",va="center",fontsize=7.3,color="#3A4048")
    ax.set_yticks(ys); ax.set_yticklabels([i[0] for i in items], fontsize=7.5)
    ax.set_xlim(0,128_000)
    ax.set_xticks([0,25_000,50_000,75_000,100_000])
    ax.set_xticklabels(["0","R25k","R50k","R75k","R100k"])
    ax.set_xlabel(f"Rand   ·   Tier 1 total {rands(tot)}")
    ax.set_title("Tier 1 — the launch budget, line by line", loc="left", pad=10)
    ax.spines[["top","right","left"]].set_visible(False)
    ax.tick_params(axis="y",length=0)
    finish(fig,"figF2_tier1.png",
           "Contracted build work is costed at R750 per hour, the mid-point of prevailing South African contract development rates. "
           "If the founder does this work himself the cash cost falls by R161 250 and the timeline lengthens accordingly.")

# ---------------------------------------------------------------- F3
# Break-even
def f3():
    fig, ax = plt.subplots(figsize=(8.3,3.9))
    subs = np.arange(0, 601)
    net_per_sub = 46.58   # R49 less Paystack 2.9% + R1
    rev = subs*net_per_sub*12
    t0 = 35_300; t1_run = 144_782
    ax.plot(subs, rev, color=PRIM, lw=2.6, label=f"Annual net subscription revenue at R49/month")
    ax.axhline(t0, color=GREEN, lw=1.8, ls="--", label=f"Tier 0 annual run rate  {rands(t0)}")
    ax.axhline(t1_run, color=RED, lw=1.8, ls="--", label=f"Tier 1 ongoing annual run rate  {rands(t1_run)}")
    b0 = t0/(net_per_sub*12); b1 = t1_run/(net_per_sub*12)
    for b,c,lab in [(b0,GREEN,f"{b0:.0f} subscribers"),(b1,RED,f"{b1:.0f} subscribers")]:
        ax.plot([b],[b*net_per_sub*12],"o",color=c,ms=9,mec="white",mew=1.5,zorder=5)
        ax.annotate(lab,(b,b*net_per_sub*12),textcoords="offset points",xytext=(10,-16),
                    fontsize=8.4,fontweight="bold",color=c)
    ax.set_xlabel("Paying subscribers")
    ax.set_ylabel("Rand per year")
    ax.set_xlim(0,600); ax.set_ylim(0,340_000)
    ax.set_yticks([0,100_000,200_000,300_000]); ax.set_yticklabels(["0","R100k","R200k","R300k"])
    ax.set_title("How many paying subscribers it takes to cover the run rate", loc="left", pad=10)
    ax.legend(frameon=False, fontsize=7.8, loc="upper left")
    ax.spines[["top","right"]].set_visible(False)
    ax.grid(alpha=.15, ls=":")
    finish(fig,"figF3_breakeven.png",
           "Net per subscriber is R46.58: R49.00 less Paystack's 2.9% + R1.00 per transaction, an effective 4.9% at this price point. "
           "Sold through Apple or Google in-app purchase instead, the 15% small-business commission would reduce net revenue to R41.65 "
           "and raise the Tier 1 break-even from 259 to 290 subscribers.")

# ---------------------------------------------------------------- F4
# Founder salary trade-off
def f4():
    fig, ax = plt.subplots(figsize=(8.3,3.9))
    scen = ["No founder salary\n(part-time on Notho)",
            "R15 000/month\n(part-time → full-time trigger)",
            "R35 000/month\n(full-time, near market)"]
    t1 = 491_745
    sal12 = [0, 189_000, 441_000]     # incl. ~5% statutory on-costs
    x=np.arange(3); w=.5
    b1=ax.bar(x, [t1]*3, w, color=PRIM, label="Tier 1 launch budget (12 months)")
    b2=ax.bar(x, sal12, w, bottom=[t1]*3, color=GOLD, label="Founder salary + statutory on-costs")
    for xi,s in zip(x,sal12):
        ax.text(xi, t1+s+22_000, rands(t1+s), ha="center", fontsize=10, fontweight="bold", color=NAVY)
    ax.set_xticks(x); ax.set_xticklabels(scen, fontsize=8)
    ax.set_ylabel("Total 12-month requirement")
    ax.set_ylim(0,1_050_000)
    ax.set_yticks([0,250_000,500_000,750_000,1_000_000])
    ax.set_yticklabels(["0","R250k","R500k","R750k","R1.0m"])
    ax.set_title("The founder-salary decision, priced", loc="left", pad=10)
    ax.legend(frameon=False, fontsize=8, loc="upper left")
    ax.spines[["top","right"]].set_visible(False)
    finish(fig,"figF4_salary.png",
           "Statutory on-costs applied at 5% for UIF and COIDA; the Skills Development Levy is not payable below a R500 000 annual payroll. "
           "R35 000 per month is materially below what a qualified financial adviser earns in practice, and should be presented as a discount "
           "the founder is accepting, not as a market salary.")

# ---------------------------------------------------------------- F5
# What marketing buys
def f5():
    fig, ax = plt.subplots(figsize=(8.3,3.6))
    budgets=[20_000,60_000,150_000,300_000,600_000]
    cac=175
    users=[b/cac for b in budgets]
    paid=[u*0.04 for u in users]
    x=np.arange(len(budgets)); w=.38
    ax.bar(x-w/2,users,w,color=TEAL,label="Registered users acquired")
    ax.bar(x+w/2,paid,w,color=GOLD,label="Of which paying, at 4% conversion")
    for xi,(u,p) in enumerate(zip(users,paid)):
        ax.text(xi-w/2,u+70,f"{u:,.0f}",ha="center",fontsize=8,fontweight="bold",color=PRIM)
        ax.text(xi+w/2,p+70,f"{p:,.0f}",ha="center",fontsize=8,fontweight="bold",color="#8a6a10")
    ax.set_xticks(x); ax.set_xticklabels([rands(b) for b in budgets], fontsize=8)
    ax.set_xlabel("Paid marketing budget")
    ax.set_ylabel("Users")
    ax.set_ylim(0,4200)
    ax.set_title("What paid acquisition actually buys at a R175 blended CAC", loc="left", pad=10)
    ax.legend(frameon=False, fontsize=8)
    ax.spines[["top","right"]].set_visible(False)
    finish(fig,"figF5_marketing.png",
           "The R175 CAC is carried from the May 2026 internal assessment and is an optimistic chain; it has not been validated against a live "
           "campaign. This figure is included to make a point rather than a promise: paid acquisition is the least efficient rand in the budget, "
           "and a single institutional partner would deliver more users than the largest column here.")

# ---------------------------------------------------------------- F6
# Cost per user reached vs literature benchmark
def f6():
    fig, ax = plt.subplots(figsize=(8.3,3.7))
    labels=["Literature benchmark\n(Kaiser et al., mean)","Literature benchmark\n(Kaiser et al., median)",
            "Frisancho (2018)\nPeru schools","Notho at\n1 000 users","Notho at\n10 000 users","Notho at\n50 000 users"]
    # USD converted at 16.20; Notho = Tier 1 ongoing run rate / users
    run=144_782
    vals=[60.40*16.20, 22.90*16.20, 4.80*16.20, run/1_000, run/10_000, run/50_000]
    cols=[NAVY,NAVY,GREY,TEAL,PRIM,GREEN]
    b=ax.bar(labels,vals,color=cols,width=.58)
    for bb,v in zip(b,vals):
        ax.text(bb.get_x()+bb.get_width()/2, v+18, f"R{v:,.0f}" if v>=10 else f"R{v:.2f}",
                ha="center",fontsize=8.6,fontweight="bold")
    ax.set_ylabel("Rand per participant reached, per year")
    ax.set_ylim(0,1180)
    ax.set_title("Cost per participant: Notho against the published benchmark", loc="left", pad=10)
    ax.spines[["top","right"]].set_visible(False)
    ax.tick_params(axis="x", labelsize=7.2)
    finish(fig,"figF6_costper.png",
           "Benchmark figures from Kaiser, Lusardi, Menkhoff & Urban (NBER WP 27057, 2020): mean USD 60.40 and median USD 22.90 per participant "
           "for approximately 0.2 SD improvement; Frisancho (2018) USD 4.80 per pupil. Converted at R16.20/USD. Notho columns divide the Tier 1 "
           "ongoing annual run rate by users reached and exclude one-time build costs and any founder salary. This is a cost comparison, not an "
           "effect comparison: Notho has not yet measured its own effect size.")

for f in [j1,f1,f2,f3,f4,f5,f6]:
    f()
print("done")
