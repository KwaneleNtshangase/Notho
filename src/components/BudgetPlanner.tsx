"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { analytics } from "@/lib/analytics";
import { isNativePlatform } from "@/lib/capacitorPlatform";
import { shareFileBlob } from "@/lib/nativeShare";
import { sastToday } from "@/lib/dates";
import { bumpWeeklyStats } from "@/lib/weeklyStats";
import { monthAlignedDefaults, resolvePeriod, type PeriodPreset } from "@/lib/budget/report/period";
import { trackBehaviorEvent } from "@/lib/behaviorTracking";
import { resolveDefaultBudget, resolveMonthlyBudget, type BudgetTargetRow } from "@/lib/budget/budgetResolve";
import { CosmoCoachCard } from "@/components/CosmoCoachCard";
import { CosmoCoachChat } from "@/components/CosmoCoachChat";
import { reportClientError } from "@/lib/errorReporting";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ArrowLeftRight,
  Award,
  BarChart2,
  Brain,
  Briefcase,
  Building2,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  CreditCard,
  FileText,
  Flag,
  Flame,
  GraduationCap,
  Hash,
  Heart,
  Home as HomeIcon,
  Landmark,
  Lightbulb,
  Lock,
  MoreHorizontal,
  Pencil,
  PiggyBank,
  Plus,
  Shield,
  ShoppingCart,
  Smartphone,
  Target,
  Trash2,
  TrendingUp,
  Tv,
  Umbrella,
  Wallet,
  X,
  Zap,
  Fuel,
  Utensils,
  Coffee,
  Dumbbell,
  Shirt,
  Gift,
  Plane,
  PawPrint,
  Users,
  Church,
  Receipt,
  Scissors,
  Pill,
  Bus,
  Wifi,
  Droplet,
  Wrench,
  Music,
  Baby,
  Sprout,
} from "@/components/icons/NothoIcons";
import { formatRand } from "@/lib/viewHelpers";
import { BudgetImportPanel } from "@/components/BudgetImportPanel";
import { findSimilarEntries, merchantLabelFor, merchantPatternFor } from "@/lib/budget/similar";
import { InteractiveReportModal } from "@/components/InteractiveReportModal";

// ─── Types ────────────────────────────────────────────────────────────────────

type BankAccount = {
  id: string;
  institution_name: string;
  custom_label: string | null;
  created_at: string;
};

type BudgetEntry = {
  id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  description?: string | null;
  entry_date: string;
  is_transfer?: boolean;
  account_id?: string | null;
  entry_method?: "imported" | "manual";
  source?: string | null;
  account_label?: string | null;
  bank_accounts?: { institution_name: string; custom_label: string | null } | null;
};

type CustomBudgetCat = {
  id: string;
  name: string;
  color: string;
  icon_name: string;
  type: "expense" | "income";
};

// ─── Icon palette ─────────────────────────────────────────────────────────────

const ICON_PICKER_OPTIONS: { name: string; Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }> }[] = [
  { name: "ShoppingCart",   Icon: ShoppingCart },   // groceries
  { name: "Utensils",       Icon: Utensils },       // dining / eating out
  { name: "Coffee",         Icon: Coffee },         // coffee / snacks
  { name: "Car",            Icon: Car },            // transport / car
  { name: "Fuel",           Icon: Fuel },           // fuel / petrol
  { name: "Bus",            Icon: Bus },            // taxi / public transport
  { name: "Home",           Icon: HomeIcon },       // rent / housing
  { name: "Zap",            Icon: Zap },            // electricity / utilities
  { name: "Droplet",        Icon: Droplet },        // water
  { name: "Wifi",           Icon: Wifi },           // internet / data
  { name: "Smartphone",     Icon: Smartphone },     // airtime / phone
  { name: "Tv",             Icon: Tv },             // subscriptions / streaming
  { name: "Music",          Icon: Music },          // entertainment
  { name: "Shirt",          Icon: Shirt },          // clothing
  { name: "Scissors",       Icon: Scissors },       // beauty / salon
  { name: "Dumbbell",       Icon: Dumbbell },       // gym / fitness
  { name: "Heart",          Icon: Heart },          // healthcare
  { name: "Pill",           Icon: Pill },           // pharmacy / medical
  { name: "GraduationCap",  Icon: GraduationCap },  // education
  { name: "Baby",           Icon: Baby },           // childcare
  { name: "PawPrint",       Icon: PawPrint },       // pets
  { name: "Gift",           Icon: Gift },           // gifts
  { name: "Plane",          Icon: Plane },          // travel
  { name: "Users",          Icon: Users },          // family
  { name: "Church",         Icon: Church },         // tithe / church
  { name: "PiggyBank",      Icon: PiggyBank },      // savings
  { name: "Sprout",         Icon: Sprout },         // investments / growth
  { name: "TrendingUp",     Icon: TrendingUp },     // investments
  { name: "CreditCard",     Icon: CreditCard },     // debt / credit
  { name: "Landmark",       Icon: Landmark },       // bank / stokvel
  { name: "Umbrella",       Icon: Umbrella },       // insurance
  { name: "Shield",         Icon: Shield },         // insurance / cover
  { name: "Receipt",        Icon: Receipt },        // bills / tax / fees
  { name: "Wrench",         Icon: Wrench },         // repairs / maintenance
  { name: "Briefcase",      Icon: Briefcase },      // business
  { name: "Building2",      Icon: Building2 },      // business / property
  { name: "Wallet",         Icon: Wallet },         // general money
  { name: "Target",         Icon: Target },         // goals
  { name: "Flame",          Icon: Flame },          // streak / hot
  { name: "Award",          Icon: Award },          // rewards
  { name: "Flag",           Icon: Flag },           // milestone
  { name: "Brain",          Icon: Brain },          // learning
  { name: "Hash",           Icon: Hash },           // misc / number
  { name: "MoreHorizontal", Icon: MoreHorizontal }, // other
];

function getIconByName(name: string): React.ComponentType<{ size?: number; style?: React.CSSProperties }> {
  return ICON_PICKER_OPTIONS.find((o) => o.name === name)?.Icon ?? MoreHorizontal;
}

const CAT_COLOR_SWATCHES = [
  "#007A85","#00A97A","#00BFA5","#0EA5A0","#0891B2",
  "#1976D2","#3B7DD8","#4F6BED","#6366F1","#7C4DFF",
  "#8E24AA","#C2185B","#D81B60","#EC4899","#F43F5E",
  "#DE6B62","#F4511E","#F57C00","#EFB343","#EAB308",
  "#65A30D","#43A047","#0F766E","#64748B","#9E9E9E",
];
/** Softer over-budget red - the harsh #E03C31 as a wall of bars was fatiguing. */
const OVER_RED = "#DE6B62";
const OVER_RED_SOFT = "rgba(222,107,98,0.14)";

const BUDGET_EXPENSE_CATS = [
  { id: "food",          label: "Food & Groceries", color: "#007A85", tag: "needs",   Icon: ShoppingCart },
  { id: "transport",     label: "Transport",         color: "#EFB343", tag: "needs",   Icon: Car },
  { id: "housing",       label: "Housing/Rent",      color: "#3B7DD8", tag: "needs",   Icon: HomeIcon },
  { id: "debt",          label: "Debt Repayments",   color: "#E03C31", tag: "debt",    Icon: CreditCard },
  { id: "savings",       label: "Savings",           color: "#00BFA5", tag: "savings", Icon: PiggyBank },
  { id: "entertainment", label: "Entertainment",     color: "#7C4DFF", tag: "wants",   Icon: Tv },
  { id: "airtime",       label: "Airtime & Data",    color: "#F57C00", tag: "needs",   Icon: Smartphone },
  { id: "healthcare",    label: "Healthcare",        color: "#C2185B", tag: "needs",   Icon: Heart },
  { id: "education",     label: "Education",         color: "#1976D2", tag: "needs",   Icon: GraduationCap },
  { id: "other",         label: "Other",             color: "#9E9E9E", tag: "other",   Icon: MoreHorizontal },
] as const;

const BUDGET_INCOME_CATS = [
  { id: "salary",       label: "Salary / Wages",   Icon: Briefcase },
  { id: "freelance",    label: "Freelance",         Icon: Zap },
  { id: "business",     label: "Business Income",  Icon: Building2 },
  { id: "other-income", label: "Other Income",     Icon: Wallet },
] as const;

// ─── Swipeable transaction row (mobile: swipe left to reveal Delete) ───────────

function SwipeableRow({
  onOpen,
  onDelete,
  children,
}: {
  onOpen: () => void;
  onDelete: () => void;
  children: React.ReactNode;
}) {
  const [dx, setDx] = useState(0);
  const sx = useRef(0);
  const sy = useRef(0);
  const drag = useRef(false);
  const moved = useRef(false);
  const REVEAL = 76;
  return (
    <div style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid var(--color-border)" }}>
      <button
        type="button"
        aria-label="Delete transaction"
        onClick={onDelete}
        style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: REVEAL, border: "none", background: "#E03C31", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
      >
        <Trash2 size={18} />
      </button>
      <div
        role="button"
        tabIndex={0}
        onTouchStart={(e) => { sx.current = e.touches[0].clientX; sy.current = e.touches[0].clientY; drag.current = false; moved.current = false; }}
        onTouchMove={(e) => {
          const dX = e.touches[0].clientX - sx.current;
          const dY = e.touches[0].clientY - sy.current;
          if (!drag.current && Math.abs(dX) > Math.abs(dY) + 4 && Math.abs(dX) > 8) drag.current = true;
          if (drag.current) { moved.current = true; setDx(Math.max(-REVEAL, Math.min(0, dX))); }
        }}
        onTouchEnd={() => { if (drag.current) setDx((p) => (p < -REVEAL / 2 ? -REVEAL : 0)); }}
        onClick={() => { if (moved.current) { moved.current = false; return; } if (dx !== 0) { setDx(0); return; } onOpen(); }}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(); } }}
        style={{ transform: `translateX(${dx}px)`, transition: drag.current ? "none" : "transform .2s ease", background: "var(--color-surface)", cursor: "pointer" }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── BudgetView ───────────────────────────────────────────────────────────────

export function BudgetView() {
  const now = new Date();
  const [viewMode, setViewMode] = useState<"month" | "year">("month");
  const [monthOffset, setMonthOffset] = useState(0);
  const [entries, setEntries] = useState<BudgetEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addType, setAddType] = useState<"income" | "expense" | "transfer">("expense");
  const [addCategory, setAddCategory] = useState("");
  const [addAmount, setAddAmount] = useState("");
  const [addDesc, setAddDesc] = useState("");
  const [addFrom, setAddFrom] = useState("");
  const [addTo, setAddTo] = useState("");
  const [addDate, setAddDate] = useState(() => sastToday());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editEntry, setEditEntry] = useState<BudgetEntry | null>(null);
  const [editType, setEditType] = useState<"income" | "expense">("expense");
  const [editCategory, setEditCategory] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editIsTransfer, setEditIsTransfer] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  // "Apply to similar" flow: after a category change, offer to recategorise
  // other transactions from the same merchant (and remember it for imports).
  const [similarPrompt, setSimilarPrompt] = useState<{
    candidates: BudgetEntry[];
    newCategory: string;
    type: "income" | "expense";
    merchantLabel: string;
    pattern: string;
  } | null>(null);
  const [similarSelected, setSimilarSelected] = useState<Set<string>>(new Set());
  const [similarRemember, setSimilarRemember] = useState(true);
  const [similarSaving, setSimilarSaving] = useState(false);
  const [yearEntries, setYearEntries] = useState<BudgetEntry[]>([]);
  const [budgetTargets, setBudgetTargets] = useState<Record<string, number>>({});
  const [defaultTargets, setDefaultTargets] = useState<Record<string, number>>({});
  const [monthIsCustomised, setMonthIsCustomised] = useState(false);
  const [budgetScope, setBudgetScope] = useState<"default" | "month">("default");
  const [budgetApplyAll, setBudgetApplyAll] = useState(false);
  const [showSetBudget, setShowSetBudget] = useState(false);
  const [budgetDraft, setBudgetDraft] = useState<Record<string, string>>({});
  const [budgetSaving, setBudgetSaving] = useState(false);
  const [customCats, setCustomCats] = useState<CustomBudgetCat[]>([]);
  const [showAddCustomCat, setShowAddCustomCat] = useState(false);
  const [newCatType, setNewCatType] = useState<"expense" | "income">("expense");
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("#007A85");
  const [newCatIcon, setNewCatIcon] = useState("MoreHorizontal");
  const [savingCustomCat, setSavingCustomCat] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [benchmarks, setBenchmarks] = useState<Record<string, number>>({});
  const [userGoalLabel, setUserGoalLabel] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportPreset, setExportPreset] = useState<PeriodPreset>("this_month");
  const [exportCustomStart, setExportCustomStart] = useState(() => monthAlignedDefaults().periodStart);
  const [exportCustomEnd, setExportCustomEnd] = useState(() => monthAlignedDefaults().periodEnd);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  // Interactive in-app report (hover + drill-down); PDF stays as the export.
  const [showInteractiveReport, setShowInteractiveReport] = useState(false);
  const [reportPeriod, setReportPeriod] = useState<{ start: string; end: string }>(() => {
    const d = monthAlignedDefaults();
    return { start: d.periodStart, end: d.periodEnd };
  });

  // New states for account attribution
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [addAccountId, setAddAccountId] = useState<string | null>(null);
  const [editAccountId, setEditAccountId] = useState<string | null>(null);

  // Escape closes the topmost open modal (keyboard parity with click-outside)
  useEffect(() => {
    const anyOpen = showAdd || !!editEntry || showExportModal || showSetBudget || showAddCustomCat || !!similarPrompt;
    if (!anyOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (showAddCustomCat) { setShowAddCustomCat(false); return; }
      if (similarPrompt) { setSimilarPrompt(null); return; }
      if (showAdd) { setShowAdd(false); return; }
      if (editEntry) { setEditEntry(null); return; }
      if (showExportModal) { setShowExportModal(false); return; }
      if (showSetBudget) { setShowSetBudget(false); return; }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showAdd, editEntry, showExportModal, showSetBudget, showAddCustomCat, similarPrompt]);

  // Read the user's onboarding goal from localStorage to show as header context
  useEffect(() => {
    if (typeof window === "undefined") return;
    const GOAL_LABELS: Record<string, string> = {
      "debt-free": "Get debt-free",
      emergency: "Build emergency fund",
      invest: "Start investing",
      home: "Save for a home",
      retire: "Plan for retirement",
      business: "Grow my business",
    };
    const goalId = localStorage.getItem("notho-user-goal");
    const desc = localStorage.getItem("notho-goal-description");
    if (goalId) {
      setUserGoalLabel(GOAL_LABELS[goalId] ?? desc ?? goalId);
    }
    const onStorage = (e: StorageEvent) => {
      if (e.key === "notho-user-goal" && e.newValue) {
        setUserGoalLabel(GOAL_LABELS[e.newValue] ?? e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const targetDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  const monthLabel = targetDate.toLocaleString("en-ZA", { month: "long", year: "numeric" });

  const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const loadBankAccounts = React.useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("bank_accounts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    setBankAccounts((data ?? []) as BankAccount[]);
  }, []);

  const loadEntries = React.useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    let { data, error } = await supabase
      .from("budget_entries")
      .select("id, type, category, amount, description, entry_date, is_transfer, account_id, account_label, entry_method")
      .eq("user_id", user.id)
      .gte("entry_date", startDate)
      .lte("entry_date", endDate)
      .order("entry_date", { ascending: false })
      .order("created_at", { ascending: false });

    // Fallback if the new schema (account_id/entry_method) is not yet applied on
    // the remote environment. account_label + source DO exist wherever import
    // works, so keep them - that's how imported rows still show their bank.
    if (error && (error.code === "PGRST200" || error.code === "42703" || error.message?.includes("does not exist") || error.message?.includes("Could not find"))) {
      const fallback = await supabase
        .from("budget_entries")
        .select("id, type, category, amount, description, entry_date, is_transfer, account_label, source")
        .eq("user_id", user.id)
        .gte("entry_date", startDate)
        .lte("entry_date", endDate)
        .order("entry_date", { ascending: false })
        .order("created_at", { ascending: false });
      data = fallback.data as any;
      error = fallback.error;
    }

    let finalData = data ?? [];

    // Manually merge bank accounts to guarantee no rows are dropped by PostgREST joins
    if (finalData.length > 0) {
      const { data: accountsData } = await supabase
        .from("bank_accounts")
        .select("id, institution_name, custom_label")
        .eq("user_id", user.id);
        
      if (accountsData && accountsData.length > 0) {
        const accountMap = new Map();
        accountsData.forEach(acc => accountMap.set(acc.id, acc));
        
        finalData = finalData.map(entry => ({
          ...entry,
          bank_accounts: entry.account_id ? accountMap.get(entry.account_id) || null : null
        }));
      }
    }

    setEntries(finalData as unknown as BudgetEntry[]);
    setLoading(false);
  }, [startDate, endDate]);

  useEffect(() => { loadEntries(); loadBankAccounts(); }, [loadEntries, loadBankAccounts]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isoDay = sastToday();
      localStorage.setItem(`notho-budget-visited-${isoDay}`, "1");
      // Also sync to Supabase for cross-device daily challenge tracking
      supabase.auth.getUser().then(async ({ data: { user } }) => {
        if (!user) return;
        // Weekly challenge counter ("open the Budget Planner N days") —
        // merged server-side so days from any device count once.
        bumpWeeklyStats(user.id, { budgetDayToday: true });
        await supabase.from("user_progress").upsert(
          { user_id: user.id, budget_visited_date: isoDay } as any,
          { onConflict: "user_id" }
        );
      }).catch(() => {});
    }
  }, []);

  const monthYear = `${year}-${String(month + 1).padStart(2, "0")}`;

  const loadBudgetTargets = React.useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("budget_targets")
      .select("category, monthly_limit, month_year")
      .eq("user_id", user.id);
    const rows = (data ?? []) as BudgetTargetRow[];
    const cats = new Set(rows.map((r) => r.category));
    const def: Record<string, number> = {};
    const eff: Record<string, number> = {};
    cats.forEach((c) => {
      const d = resolveDefaultBudget(rows, c, monthYear);
      if (d > 0) def[c] = d;
      const e = resolveMonthlyBudget(rows, c, monthYear);
      if (e > 0) eff[c] = e;
    });
    setDefaultTargets(def);
    // This month is "customised" only if it has its own override row.
    setMonthIsCustomised(rows.some((r) => r.month_year === monthYear));
    setBudgetTargets(eff);
  }, [monthYear]);

  useEffect(() => { loadBudgetTargets(); }, [loadBudgetTargets]);

  const loadCustomCats = React.useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("custom_budget_categories")
      .select("id, name, color, icon_name, type")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    setCustomCats((data ?? []) as CustomBudgetCat[]);
  }, []);

  useEffect(() => { loadCustomCats(); }, [loadCustomCats]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("budget_benchmarks").select("category, avg_pct, user_count");
      if (data) {
        const map: Record<string, number> = {};
        (data as { category: string; avg_pct: number }[]).forEach((r) => { map[r.category] = Number(r.avg_pct); });
        setBenchmarks(map);
      }
    })();
  }, []);

  const resetCustomCatForm = () => {
    setEditingCatId(null);
    setNewCatName(""); setNewCatColor("#007A85"); setNewCatIcon("MoreHorizontal");
  };

  // Load an existing custom category into the form for editing.
  const startEditCustomCat = (c: CustomBudgetCat) => {
    setEditingCatId(c.id);
    setNewCatType(c.type);
    setNewCatName(c.name);
    setNewCatColor(c.color);
    setNewCatIcon(c.icon_name);
  };

  const handleSaveCustomCat = async () => {
    if (!newCatName.trim()) return;
    setSavingCustomCat(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSavingCustomCat(false); return; }
    if (editingCatId) {
      // Update name / colour / icon of an existing category (id and type kept).
      await supabase.from("custom_budget_categories")
        .update({ name: newCatName.trim(), color: newCatColor, icon_name: newCatIcon })
        .eq("id", editingCatId);
    } else {
      await supabase.from("custom_budget_categories").insert({
        user_id: user.id, name: newCatName.trim(), color: newCatColor, icon_name: newCatIcon, type: newCatType,
      });
    }
    setSavingCustomCat(false);
    setShowAddCustomCat(false);
    resetCustomCatForm();
    loadCustomCats();
  };

  const handleDeleteCustomCat = async (id: string) => {
    if (!window.confirm("Delete this category? Transactions in it move to Other.")) return;
    await supabase.from("custom_budget_categories").delete().eq("id", id);
    setCustomCats((prev) => prev.filter((c) => c.id !== id));
    if (editingCatId === id) resetCustomCatForm();
  };

  const allExpCats = useMemo(() => {
    const statics = BUDGET_EXPENSE_CATS.filter(c => c.id !== "other");
    const custom = customCats.filter(c => c.type === "expense").map(c => ({
      id: c.id, label: c.name, color: c.color, tag: "custom" as const, Icon: getIconByName(c.icon_name),
    }));
    const other = BUDGET_EXPENSE_CATS.find(c => c.id === "other")!;

    const knownIds = new Set([...statics.map(s => s.id), ...custom.map(c => c.id), "other", "transfer"]);
    const historicalIds = new Set(
      yearEntries.filter(e => e.type === "expense" && !knownIds.has(e.category)).map(e => e.category)
    );
    const historical = Array.from(historicalIds).map(id => ({
      id, label: id, color: "#9E9E9E", tag: "historical" as const, Icon: getIconByName("MoreHorizontal"),
    }));

    return [...statics, ...custom, ...historical, other];
  }, [customCats, yearEntries]);

  const allIncCats = useMemo(() => {
    const custom = customCats.filter(c => c.type === "income").map(c => ({
      id: c.id, label: c.name, Icon: getIconByName(c.icon_name),
    }));
    const knownIds = new Set([...BUDGET_INCOME_CATS.map(s => s.id), ...custom.map(c => c.id), "transfer"]);
    const historicalIds = new Set(
      yearEntries.filter(e => e.type === "income" && !knownIds.has(e.category)).map(e => e.category)
    );
    const historical = Array.from(historicalIds).map(id => ({
      id, label: id, Icon: getIconByName("MoreHorizontal"),
    }));

    return [...BUDGET_INCOME_CATS, ...custom, ...historical];
  }, [customCats, yearEntries]);

  const openSetBudget = (scope: "default" | "month" = monthIsCustomised ? "month" : "default") => {
    setBudgetScope(scope);
    const source = scope === "default" ? defaultTargets : budgetTargets;
    const draft: Record<string, string> = {};
    allExpCats.forEach((c) => { draft[c.id] = source[c.id] ? String(source[c.id]) : ""; });
    setBudgetDraft(draft);
    setShowSetBudget(true);
  };

  // Remove this month's overrides so it follows the default budget again.
  const resetMonthToDefault = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("budget_targets").delete()
      .eq("user_id", user.id).eq("month_year", monthYear);
    loadBudgetTargets();
  };

  const handleSaveBudgetTargets = async () => {
    setBudgetSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setBudgetSaving(false); return; }

    if (budgetScope === "default" && budgetApplyAll) {
      // "All months": make this the budget for every month (past + future) and
      // clear all month-specific budgets, so nothing keeps an older figure.
      await supabase.from("budget_targets").delete().eq("user_id", user.id);
      const rows = allExpCats
        .filter((c) => c.id !== "other")
        .map((c) => ({ category: c.id, monthly_limit: Number(budgetDraft[c.id]) }))
        .filter((r) => r.monthly_limit > 0)
        .map((r) => ({ user_id: user.id, category: r.category, monthly_limit: r.monthly_limit, month_year: "default" }));
      if (rows.length) await supabase.from("budget_targets").insert(rows);
    } else {
      // "default" scope writes a default version effective from the selected month
      // (so earlier months keep the default that was in force then); "month" scope
      // writes an override for just the selected month.
      const targetMonth = budgetScope === "default" ? `default:${monthYear}` : monthYear;
      for (const cat of allExpCats) {
        if (cat.id === "other") continue;
        const val = Number(budgetDraft[cat.id]);
        if (val > 0) {
          await supabase.from("budget_targets").upsert(
            { user_id: user.id, category: cat.id, monthly_limit: val, month_year: targetMonth },
            { onConflict: "user_id,category,month_year" }
          );
        } else {
          await supabase.from("budget_targets").delete()
            .eq("user_id", user.id).eq("category", cat.id).eq("month_year", targetMonth);
        }
      }
    }
    // Behavioral outcome: track if user set a savings target
    const savingsDraft = Number(budgetDraft["savings"] ?? 0);
    if (savingsDraft > 0) {
      analytics.savingsGoalSet(savingsDraft);
      void trackBehaviorEvent("savings_goal_set");
    }
    setBudgetSaving(false);
    setShowSetBudget(false);
    setBudgetApplyAll(false);
    loadBudgetTargets();
  };

  const loadYearEntries = React.useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const yr = now.getFullYear();
    let { data, error } = await supabase
      .from("budget_entries")
      .select("id, type, category, amount, description, entry_date, is_transfer, account_id, account_label, entry_method, bank_accounts!left(institution_name, custom_label)")
      .eq("user_id", user.id)
      .gte("entry_date", `${yr}-01-01`)
      .lte("entry_date", `${yr}-12-31`);
    // Same schema fallback as loadEntries - prod may lack account_id/entry_method.
    if (error && (error.code === "PGRST200" || error.code === "42703" || error.message?.includes("does not exist") || error.message?.includes("Could not find"))) {
      const fallback = await supabase
        .from("budget_entries")
        .select("id, type, category, amount, description, entry_date, is_transfer, account_label, source")
        .eq("user_id", user.id)
        .gte("entry_date", `${yr}-01-01`)
        .lte("entry_date", `${yr}-12-31`);
      data = fallback.data as any;
      error = fallback.error;
    }
    setYearEntries((data ?? []) as unknown as BudgetEntry[]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (viewMode === "year") loadYearEntries(); }, [viewMode, loadYearEntries]);

  const handleAdd = async () => {
    if (!addAmount || isNaN(Number(addAmount)) || Number(addAmount) <= 0) return;

    // Transfer: money moved between accounts - stored with is_transfer=true and
    // excluded from income/expense everywhere. From → To kept in the description.
    if (addType === "transfer") {
      if (!addFrom.trim() || !addTo.trim()) return;
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setSaving(false); return; }
      const note = addDesc.trim();
      const desc = `${addFrom.trim()} → ${addTo.trim()}${note ? ` · ${note}` : ""}`;
      await supabase.from("budget_entries").insert({
        user_id: user.id, type: "expense", category: "transfer",
        amount: Number(addAmount), description: desc, entry_date: addDate, is_transfer: true,
      });
      setSaving(false); setShowAdd(false);
      setAddAmount(""); setAddDesc(""); setAddFrom(""); setAddTo(""); setAddDate(sastToday());
      loadEntries();
      return;
    }

    if (!addCategory) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    const { error: insertError } = await supabase.from("budget_entries").insert({
      user_id: user.id, type: addType, category: addCategory,
      amount: Number(addAmount), description: addDesc.trim() || null, entry_date: addDate,
      account_id: addAccountId || null, entry_method: "manual",
    });

    if (insertError) {
      // Fallback if new schema isn't deployed
      await supabase.from("budget_entries").insert({
        user_id: user.id, type: addType, category: addCategory,
        amount: Number(addAmount), description: addDesc.trim() || null, entry_date: addDate,
      });
    }

    if (addType === "expense" && budgetTargets[addCategory]) {
      const catSpent = entries.filter(e => e.type === "expense" && e.category === addCategory).reduce((s, e) => s + e.amount, 0) + Number(addAmount);
      const limit = budgetTargets[addCategory];
      const pct = (catSpent / limit) * 100;
      if (pct >= 80) {
        const catLabel = BUDGET_EXPENSE_CATS.find(c => c.id === addCategory)?.label ?? addCategory;
        supabase.auth.getSession().then(({ data: { session } }) => {
          const token = session?.access_token;
          if (!token) return;
          fetch(`${window.location.origin}/api/budget-alert`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ user_id: user.id, category: catLabel, pct }),
          }).catch(() => {});
        });
      }
    }
    analytics.budgetEntryAdded(addCategory, addType);
    // Behavioral outcome: track expense logged
    if (addType === "expense") {
      analytics.expenseLogged(addCategory, Number(addAmount));
      void trackBehaviorEvent("expense_logged");
    }
    if (addType === "expense" && typeof window !== "undefined") {
      const isoDay = sastToday();
      const expKey = `notho-expense-today-${isoDay}`;
      const newExpenseCount = (parseInt(localStorage.getItem(expKey) ?? "0", 10)) + 1;
      localStorage.setItem(expKey, String(newExpenseCount));
      // Also sync to Supabase for cross-device daily challenge tracking
      supabase.auth.getUser().then(async ({ data: { user } }) => {
        if (!user) return;
        await supabase.from("user_progress").upsert(
          { user_id: user.id, expense_today: newExpenseCount, expense_today_date: isoDay } as any,
          { onConflict: "user_id" }
        );
      }).catch(() => {});
    }
    setSaving(false); setShowAdd(false); setAddCategory(""); setAddAmount(""); setAddDesc("");
    setAddDate(sastToday());
    loadEntries();
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    await supabase.from("budget_entries").delete().eq("id", id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setDeleting(null);
  };

  // Swipe-to-delete a single row.
  const swipeDelete = async (id: string) => {
    if (!window.confirm("Delete this transaction?")) return;
    await supabase.from("budget_entries").delete().eq("id", id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const exitSelectMode = () => { setSelectMode(false); setSelectedIds(new Set()); };

  const bulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedIds.size} transaction${selectedIds.size > 1 ? "s" : ""}?`)) return;
    const ids = [...selectedIds];
    await supabase.from("budget_entries").delete().in("id", ids);
    setEntries((prev) => prev.filter((e) => !selectedIds.has(e.id)));
    exitSelectMode();
  };

  const openEdit = (e: BudgetEntry) => {
    setEditEntry(e); setEditType(e.type); setEditCategory(e.category);
    setEditAmount(String(e.amount)); setEditDesc(e.description ?? ""); setEditDate(e.entry_date);
    setEditIsTransfer(!!e.is_transfer);
    setEditAccountId(e.account_id ?? null);
  };

  const handleEditSave = async () => {
    if (!editEntry || !editCategory || !editAmount || Number(editAmount) <= 0) return;
    setEditSaving(true);

    const payloadWithSchema = {
      type: editType, category: editCategory, amount: Number(editAmount),
      description: editDesc.trim() || null, entry_date: editDate, is_transfer: editIsTransfer,
      account_id: editAccountId || null, entry_method: "manual" as const
    };

    const { error: updateError } = await supabase.from("budget_entries")
      .update(payloadWithSchema)
      .eq("id", editEntry.id);

    if (updateError) {
      await supabase.from("budget_entries").update({
        type: editType, category: editCategory, amount: Number(editAmount),
        description: editDesc.trim() || null, entry_date: editDate, is_transfer: editIsTransfer,
      }).eq("id", editEntry.id);
    }

    setEntries((prev) => prev.map((e) => e.id === editEntry.id
      ? { ...e, ...payloadWithSchema }
      : e));

    const categoryChanged = editEntry.category !== editCategory && !editIsTransfer;
    const descForMatch = editDesc.trim() || editEntry.description || "";
    setEditSaving(false); setEditEntry(null);

    if (categoryChanged && descForMatch) {
      void promptApplyToSimilar(
        { id: editEntry.id, description: descForMatch, type: editType },
        editCategory
      );
    }
  };

  /**
   * After a category change, look across ALL of the user's transactions for
   * others from the same merchant and offer to move them too - with a review
   * step (select all or just some) and an opt-in rule for future imports.
   */
  const promptApplyToSimilar = async (
    edited: { id: string; description: string; type: "income" | "expense" },
    newCategory: string
  ) => {
    const pattern = merchantPatternFor(edited.description);
    if (!pattern) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("budget_entries")
      .select("id, type, category, amount, description, entry_date, is_transfer")
      .eq("user_id", user.id)
      .eq("type", edited.type)
      .not("description", "is", null);
    if (error) return; // best-effort: the single edit already saved
    const candidates = findSimilarEntries((data ?? []) as BudgetEntry[], edited, newCategory)
      .sort((a, b) => b.entry_date.localeCompare(a.entry_date));
    // Even with no similar transactions we still show the prompt: the user
    // must get the chance to save a rule so FUTURE imports auto-categorise.
    setSimilarPrompt({
      candidates,
      newCategory,
      type: edited.type,
      merchantLabel: merchantLabelFor(edited.description),
      pattern,
    });
    setSimilarSelected(new Set(candidates.map((c) => c.id)));
    setSimilarRemember(true);
  };

  const toggleSimilarSelected = (id: string) => {
    setSimilarSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const applySimilar = async () => {
    if (!similarPrompt) return;
    setSimilarSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSimilarSaving(false); return; }
    const ids = similarPrompt.candidates.filter((c) => similarSelected.has(c.id)).map((c) => c.id);
    if (ids.length > 0) {
      const { error } = await supabase
        .from("budget_entries")
        .update({ category: similarPrompt.newCategory })
        .in("id", ids)
        .eq("user_id", user.id);
      if (!error) {
        const idSet = new Set(ids);
        const recat = (e: BudgetEntry) => (idSet.has(e.id) ? { ...e, category: similarPrompt.newCategory } : e);
        setEntries((prev) => prev.map(recat));
        setYearEntries((prev) => prev.map(recat));
      }
    }
    if (similarRemember) {
      // Future imports auto-categorise this merchant (import pipeline reads
      // user_merchant_rules; pattern format matches the commit route's).
      await supabase.from("user_merchant_rules").upsert(
        {
          user_id: user.id,
          merchant_pattern: similarPrompt.pattern,
          category: similarPrompt.newCategory,
          type: similarPrompt.type,
        },
        { onConflict: "user_id,merchant_pattern" }
      );
    }
    setSimilarSaving(false);
    setSimilarPrompt(null);
  };

  const handleEditDelete = async () => {
    if (!editEntry) return;
    setEditSaving(true);
    await supabase.from("budget_entries").delete().eq("id", editEntry.id);
    setEntries((prev) => prev.filter((e) => e.id !== editEntry.id));
    setEditSaving(false); setEditEntry(null);
  };

  const openExportModal = () => {
    const defaults = monthAlignedDefaults();
    setExportPreset("this_month");
    setExportCustomStart(defaults.periodStart);
    setExportCustomEnd(defaults.periodEnd);
    setExportError(null);
    setShowExportModal(true);
  };

  const handleExportReport = async () => {
    setExportLoading(true);
    setExportError(null);
    try {
      const { periodStart, periodEnd } =
        exportPreset === "custom"
          ? resolvePeriod("custom", {
              periodStart: exportCustomStart,
              periodEnd: exportCustomEnd,
            })
          : resolvePeriod(exportPreset);

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setExportError("Please sign in to export a report.");
        return;
      }

      const res = await fetch(`${window.location.origin}/api/budget/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ periodStart, periodEnd }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = (err as { error?: string }).error ?? "Failed to generate report.";
        setExportError(msg);
        void reportClientError("report-download", new Error(`Report export failed (${res.status}): ${msg}`));
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `notho-budget-report-${periodStart}_${periodEnd}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setShowExportModal(false);
    } catch {
      setExportError("Failed to generate report. Please try again.");
    } finally {
      setExportLoading(false);
    }
  };

  // Download the PDF for a specific period (used by the interactive report).
  const downloadReportPdf = async (periodStart: string, periodEnd: string, redactNames = true) => {
    setExportLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;
      const res = await fetch(`${window.location.origin}/api/budget/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ periodStart, periodEnd, redactNames }),
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `notho-budget-report-${periodStart}_${periodEnd}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      /* non-fatal: the interactive view is still open */
    } finally {
      setExportLoading(false);
    }
  };

  // Share the PDF for a specific period. Native: hands the file straight to
  // the OS share sheet (@capacitor/share) - see nativeShare.ts. Web: falls
  // back to the Web Share API where a browser can share files, and to the
  // same download-link behaviour as downloadReportPdf everywhere else.
  const shareReportPdf = async (periodStart: string, periodEnd: string, redactNames = true) => {
    setExportLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;
      const res = await fetch(`${window.location.origin}/api/budget/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ periodStart, periodEnd, redactNames }),
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const fileName = `notho-budget-report-${periodStart}_${periodEnd}.pdf`;

      if (await isNativePlatform()) {
        const shared = await shareFileBlob({
          blob,
          fileName,
          title: "Notho budget report",
          dialogTitle: "Share your budget report",
        });
        if (shared) return;
        // Native share failed for some reason (e.g. cancelled) - fall through
        // to the same web-style download rather than leaving the user stuck.
      }

      const file = new File([blob], fileName, { type: "application/pdf" });
      const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
      if (typeof navigator.share === "function" && typeof nav.canShare === "function" && nav.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "Notho budget report" });
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      /* non-fatal: the interactive view is still open */
    } finally {
      setExportLoading(false);
    }
  };

  // Transfers (money moved between your own accounts, or imported transfer pairs)
  // are excluded from income/expense/savings maths everywhere.
  const realEntries = entries.filter((e) => !e.is_transfer);
  const income = realEntries.filter((e) => e.type === "income").reduce((s, e) => s + e.amount, 0);
  const expenses = realEntries.filter((e) => e.type === "expense").reduce((s, e) => s + e.amount, 0);
  const surplus = income - expenses;

  const catTotals = allExpCats.map((c) => ({
    ...c,
    total: realEntries.filter((e) => e.type === "expense" && e.category === c.id).reduce((s, e) => s + e.amount, 0),
  })).filter((c) => c.total > 0).sort((a, b) => b.total - a.total);

  const needsTotal = realEntries.filter((e) => e.type === "expense" && ["food","transport","housing","airtime","healthcare","education"].includes(e.category)).reduce((s, e) => s + e.amount, 0);
  const wantsTotal = realEntries.filter((e) => e.type === "expense" && e.category === "entertainment").reduce((s, e) => s + e.amount, 0);
  const debtTotal = realEntries.filter((e) => e.type === "expense" && e.category === "debt").reduce((s, e) => s + e.amount, 0);
  const explicitSavingsTotal = realEntries.filter((e) => e.type === "expense" && e.category === "savings").reduce((s, e) => s + e.amount, 0);
  const mathSavingsRate = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0;
  const debtRate = income > 0 ? Math.round((debtTotal / income) * 100) : 0;

  const getCatLabel = (type: string, cat: string) => {
    if (type === "income") return allIncCats.find((c) => c.id === cat)?.label ?? cat;
    return allExpCats.find((c) => c.id === cat)?.label ?? cat;
  };
  const getCatColor = (cat: string) => allExpCats.find((c) => c.id === cat)?.color ?? "#9E9E9E";
  const formatEntry = (date: string) => {
    const d = new Date(date + "T00:00:00");
    return d.toLocaleDateString("en-ZA", { day: "numeric", month: "short" });
  };

  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const yearMonthData = monthNames.map((name, mi) => {
    const monthEntries = yearEntries.filter((e) => {
      const d = new Date(e.entry_date + "T00:00:00");
      return d.getMonth() === mi;
    });
    const inc = monthEntries.filter(e => e.type === "income" && !e.is_transfer).reduce((s, e) => s + e.amount, 0);
    const exp = monthEntries.filter(e => e.type === "expense" && !e.is_transfer).reduce((s, e) => s + e.amount, 0);
    return { name, income: inc, expenses: exp, surplus: inc - exp };
  });

  return (
    <main className="budget-page">
      <div style={{ maxWidth: 760, margin: "0 auto", width: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: userGoalLabel ? 8 : 16 }}>
        <h2 style={{ fontSize: 28, fontWeight: 900 }}>Budget</h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <BudgetImportPanel onImported={loadEntries} />
          <button
            type="button"
            onClick={() => {
              const d = resolvePeriod(viewMode === "year" ? "year" : "this_month");
              setReportPeriod({ start: d.periodStart, end: d.periodEnd });
              setShowInteractiveReport(true);
            }}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "var(--color-primary)", color: "white", border: "none",
              borderRadius: 10, padding: "8px 12px", fontWeight: 700, fontSize: 13, cursor: "pointer",
            }}
          >
            <BarChart2 size={15} aria-hidden /> View report
          </button>
          <button
            type="button"
            onClick={openExportModal}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "var(--color-surface)",
              color: "var(--color-primary)",
              border: "1px solid var(--color-border)",
              borderRadius: 10,
              padding: "8px 12px",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            <FileText size={15} aria-hidden /> Export PDF
          </button>
          <div style={{ display: "flex", borderRadius: 10, border: "1px solid var(--color-border)", overflow: "hidden" }}>
            {(["month", "year"] as const).map((v) => (
              <button key={v} type="button" onClick={() => setViewMode(v)}
                style={{ padding: "7px 14px", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer", background: viewMode === v ? "var(--color-primary)" : "var(--color-surface)", color: viewMode === v ? "white" : "var(--color-text-secondary)" }}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <button type="button"
            onClick={() => { setAddType("expense"); setAddCategory(""); setAddAmount(""); setAddDesc(""); setAddDate(now.toISOString().slice(0, 10)); setShowAdd(true); }}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--color-primary)", color: "white", border: "none", borderRadius: 10, padding: "8px 14px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
            <Plus size={16} aria-hidden /> Add
          </button>
        </div>
      </div>

      {/* Goal context banner */}
      {userGoalLabel && (
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          marginBottom: 16, padding: "6px 12px",
          background: "rgba(0,122,133,0.07)",
          borderRadius: 8, border: "none",
        }}>
          <Target size={13} style={{ color: "var(--color-primary)", flexShrink: 0 }} aria-hidden />
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-primary)" }}>
            Your budget plan, {userGoalLabel}
          </span>
        </div>
      )}

      {/* Cosmo: deterministic nudges from the user's own numbers */}
      {viewMode === "month" && <CosmoCoachCard monthYear={monthYear} />}

      {/* Interactive in-app report (manages its own period selector) */}
      <InteractiveReportModal
        open={showInteractiveReport}
        onClose={() => setShowInteractiveReport(false)}
        initialStart={reportPeriod.start}
        initialEnd={reportPeriod.end}
        onDownloadPdf={(s, e, redact) => downloadReportPdf(s, e, redact)}
        onSharePdf={(s, e, redact) => shareReportPdf(s, e, redact)}
        downloadingPdf={exportLoading}
      />

      {/* Floating AI chat, always available on the budget page */}
      <CosmoCoachChat />

      {/* YEAR VIEW */}
      {viewMode === "year" && (
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 14 }}>{now.getFullYear()} Overview</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10, marginBottom: 24 }}>
            {yearMonthData.map((m) => (
              <div key={m.name} style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 12, padding: 14 }}>
                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10, color: "var(--color-text-primary)" }}>{m.name}</div>
                {m.income === 0 && m.expenses === 0 ? (
                  <div style={{ fontSize: 11, color: "var(--color-text-secondary)", fontStyle: "italic" }}>No entries</div>
                ) : (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: "var(--color-text-secondary)" }}>Income</span>
                      <span style={{ fontWeight: 700, color: "#007A85" }}>{formatRand(m.income)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                      <span style={{ color: "var(--color-text-secondary)" }}>Expenses</span>
                      <span style={{ fontWeight: 700, color: "#E03C31" }}>{formatRand(m.expenses)}</span>
                    </div>
                    <div style={{ height: 3, borderRadius: 2, background: "var(--color-border)", overflow: "hidden", marginBottom: 4 }}>
                      <div style={{ height: "100%", background: m.surplus >= 0 ? "#007A85" : "#E03C31", width: `${m.income > 0 ? Math.min(100, (m.expenses / m.income) * 100) : 100}%` }} />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: m.surplus >= 0 ? "#007A85" : "#E03C31", textAlign: "right" }}>
                      {m.surplus >= 0 ? "+" : ""}{formatRand(m.surplus)}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          {(() => {
            const totInc = yearMonthData.reduce((s, m) => s + m.income, 0);
            const totExp = yearMonthData.reduce((s, m) => s + m.expenses, 0);
            const totSur = totInc - totExp;
            return (
              <>
                {yearMonthData.some(m => m.income > 0 || m.expenses > 0) && (
                  <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 14, padding: 16, marginBottom: 16 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 14 }}>Income vs Expenses - {now.getFullYear()}</div>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={yearMonthData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: "var(--color-text-secondary)" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `R${(v/1000).toFixed(0)}k`} />
                        <Tooltip
                          formatter={((value: unknown, name: unknown) => [formatRand(Number(value)), name === "income" ? "Income" : name === "expenses" ? "Expenses" : "Surplus"]) as never}
                          contentStyle={{ borderRadius: 10, fontSize: 12, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-primary)" }}
                        />
                        <Legend iconType="circle" iconSize={8} formatter={(v: string) => v === "income" ? "Income" : v === "expenses" ? "Expenses" : "Surplus"} wrapperStyle={{ fontSize: 12 }} />
                        <Line type="monotone" dataKey="income" stroke="#007A85" strokeWidth={2.5} dot={{ r: 3, fill: "#007A85" }} activeDot={{ r: 5 }} />
                        <Line type="monotone" dataKey="expenses" stroke="#E03C31" strokeWidth={2.5} dot={{ r: 3, fill: "#E03C31" }} activeDot={{ r: 5 }} />
                        <Line type="monotone" dataKey="surplus" stroke="#EFB343" strokeWidth={2} dot={{ r: 2, fill: "#EFB343" }} strokeDasharray="4 3" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 14, padding: 16 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Year Totals</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                    {[
                      { label: "Total Income", value: totInc, color: "#007A85" },
                      { label: "Total Expenses", value: totExp, color: "#E03C31" },
                      { label: totSur >= 0 ? "Net Surplus" : "Net Deficit", value: Math.abs(totSur), color: totSur >= 0 ? "#007A85" : "#E03C31" },
                    ].map((c) => (
                      <div key={c.label} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase", marginBottom: 4 }}>{c.label}</div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: c.color }}>{formatRand(c.value)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* MONTH VIEW */}
      {viewMode === "month" && (<>

      {/* Month selector */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 12, padding: "10px 14px", marginBottom: 20 }}>
        <button type="button" onClick={() => setMonthOffset((o) => o - 1)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)", padding: 4 }} aria-label="Previous month">
          <ChevronLeft size={20} />
        </button>
        <span style={{ fontWeight: 700, fontSize: 15 }}>{monthLabel}</span>
        {/* Allow planning up to 3 months ahead (was capped at the current month) */}
        <button type="button" onClick={() => setMonthOffset((o) => Math.min(o + 1, 3))} disabled={monthOffset >= 3}
          style={{ background: "none", border: "none", cursor: monthOffset >= 3 ? "default" : "pointer", color: monthOffset >= 3 ? "var(--color-border)" : "var(--color-text-secondary)", padding: 4 }} aria-label="Next month">
          <ChevronRight size={20} />
        </button>
      </div>

      {Object.keys(budgetTargets).length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, padding: "9px 12px", borderRadius: 10, border: "1px solid var(--color-border)", background: monthIsCustomised ? "rgba(239,179,67,0.10)" : "var(--color-surface)", fontSize: 12.5 }}>
          {monthIsCustomised ? (
            <>
              <Target size={14} style={{ color: "#B8860B", flexShrink: 0 }} />
              <span style={{ fontWeight: 600, color: "var(--color-text-primary)", flex: 1 }}>Budget targets customised for {monthLabel}</span>
              <button type="button" onClick={resetMonthToDefault}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-primary)", fontWeight: 700, fontSize: 12.5, padding: 0 }}>
                Reset to default
              </button>
            </>
          ) : (
            <>
              <Copy size={14} style={{ color: "var(--color-text-secondary)", flexShrink: 0 }} />
              <span style={{ fontWeight: 600, color: "var(--color-text-secondary)", flex: 1 }}>Following your default budget</span>
              <button type="button" onClick={() => openSetBudget("month")}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-primary)", fontWeight: 700, fontSize: 12.5, padding: 0 }}>
                Customise this month
              </button>
            </>
          )}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "var(--color-text-secondary)" }}>Loading...</div>
      ) : (
        <>
          {/* Summary cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
            {[
              { label: "Income", value: income, color: "#007A85" },
              { label: "Expenses", value: expenses, color: "#E03C31" },
              { label: surplus >= 0 ? "Surplus" : "Deficit", value: Math.abs(surplus), color: surplus >= 0 ? "#007A85" : "#E03C31" },
            ].map((c) => (
              <div key={c.label} style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 12, padding: "12px 10px", textAlign: "center" }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{c.label}</div>
                <div style={{ fontSize: 15, fontWeight: 900, color: c.color, lineHeight: 1.2 }}>{formatRand(c.value)}</div>
              </div>
            ))}
          </div>

          {entries.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--color-text-secondary)" }}>
              <Wallet size={48} strokeWidth={1.2} style={{ color: "var(--color-border)", margin: "0 auto 12px" }} />
              <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: "var(--color-text-primary)" }}>No entries yet</p>
              <p style={{ fontSize: 14, marginBottom: 20 }}>Start by adding your income and expenses for {monthLabel}.</p>
              <button type="button" onClick={() => { setAddType("income"); setShowAdd(true); }} className="btn btn-primary" style={{ padding: "12px 28px" }}>
                Add your first entry
              </button>
            </div>
          ) : (
            <>
              {income > 0 && (
                <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 14, padding: 16, marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 14, marginBottom: 12 }}>
                    <Lightbulb size={16} style={{ color: "var(--color-primary)" }} /> Spending Insights
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}>
                      <span style={{ color: "var(--color-text-secondary)" }}>Savings rate (Net)</span>
                      <span style={{ fontWeight: 700, color: mathSavingsRate >= 10 ? "#007A85" : "#E03C31" }}>
                        {mathSavingsRate}% {mathSavingsRate >= 10 ? "Great job!" : "Aim for 10%+"}
                      </span>
                    </div>

                    {catTotals.length > 0 && (
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-secondary)", marginBottom: 6 }}>Top Expenses</div>
                        {catTotals.slice(0, 3).map((c) => (
                          <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.color }} />
                              {c.label}
                            </span>
                            <span style={{ fontWeight: 600 }}>{formatRand(c.total)} <span style={{ color: "var(--color-text-secondary)", fontSize: 11, fontWeight: 500 }}>({expenses > 0 ? Math.round((c.total / expenses) * 100) : 0}%)</span></span>
                          </div>
                        ))}
                      </div>
                    )}

                    {needsTotal + wantsTotal > 0 && (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}>
                        <span style={{ color: "var(--color-text-secondary)" }}>Needs vs Wants</span>
                        <span style={{ fontWeight: 600 }}>
                          {expenses > 0 ? Math.round((needsTotal / expenses) * 100) : 0}% / {expenses > 0 ? Math.round((wantsTotal / expenses) * 100) : 0}%
                        </span>
                      </div>
                    )}

                    <Link href="/learn?course=saving-investing" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "rgba(0,122,133,0.06)", borderRadius: 10, textDecoration: "none" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "var(--color-primary)" }}>{mathSavingsRate < 10 ? "Boost your savings" : "Grow your wealth"}</div>
                        <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 2 }}>{mathSavingsRate < 10 ? "Learn how to build an emergency fund." : "Level up your investing skills."}</div>
                      </div>
                      <ChevronRight size={16} style={{ color: "var(--color-primary)" }} />
                    </Link>
                  </div>
                </div>
              )}

              {Object.keys(budgetTargets).length > 0 && catTotals.length > 0 && (() => {
                const totalBudget = Object.values(budgetTargets).reduce((s, v) => s + v, 0);
                const totalActual = BUDGET_EXPENSE_CATS.reduce((s, c) => s + (budgetTargets[c.id] ? realEntries.filter(e => e.type === "expense" && e.category === c.id).reduce((a, e) => a + e.amount, 0) : 0), 0);
                const delta = totalBudget - totalActual;
                const isOver = delta < 0;
                return (
                  <div style={{ background: isOver ? "rgba(224,60,49,0.08)" : "rgba(0,122,133,0.08)", border: "none", borderRadius: 14, padding: 16, marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: isOver ? "rgba(224,60,49,0.15)" : "rgba(0,122,133,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Target size={22} style={{ color: isOver ? "#E03C31" : "#007A85" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 15, color: isOver ? "#E03C31" : "#007A85" }}>{isOver ? "Over Budget" : "Under Budget"}</div>
                      <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 2 }}>
                        {isOver ? `${formatRand(Math.abs(delta))} over` : `${formatRand(delta)} remaining`} of {formatRand(totalBudget)} budgeted
                      </div>
                    </div>
                  </div>
                );
              })()}

              {catTotals.length > 0 && (
                <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 14, padding: 16, marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>Expense breakdown</div>
                    <button type="button" onClick={() => openSetBudget()} style={{ background: "rgba(0,122,133,0.1)", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#007A85", display: "flex", alignItems: "center", gap: 4 }}>
                      <Target size={13} /> Set Budget
                    </button>
                  </div>
                  <div style={{ position: "relative", width: "100%", maxWidth: 260, margin: "0 auto 20px" }}>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={catTotals.map((c) => ({ name: c.label, value: c.total, color: c.color }))}
                          cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value" stroke="none">
                          {catTotals.map((c, i) => (<Cell key={`cell-${i}`} fill={c.color} style={{ cursor: "pointer", outline: "none" }} />))}
                        </Pie>
                        <Tooltip
                          formatter={(value: any) => formatRand(Number(value))}
                          contentStyle={{ borderRadius: 10, fontSize: 13, fontWeight: 600, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-primary)" }}
                          itemStyle={{ color: "var(--color-text-primary)" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", pointerEvents: "none" }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 2 }}>Total</div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: "var(--color-text-primary)" }}>{formatRand(expenses)}</div>
                    </div>
                  </div>

                  {catTotals.map((c) => {
                    const pct = expenses > 0 ? (c.total / expenses) * 100 : 0;
                    const limit = budgetTargets[c.id];
                    const usagePct = limit ? (c.total / limit) * 100 : 0;
                    const isAmber = limit && usagePct >= 80 && usagePct < 100;
                    const isOver = limit && usagePct >= 100;
                    return (
                      <div key={c.id} style={{ marginBottom: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 13 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: c.color, flexShrink: 0 }} />
                            <span style={{ fontWeight: 600 }}>{c.label}</span>
                            {isOver && <span style={{ fontSize: 10, fontWeight: 800, background: OVER_RED_SOFT, color: OVER_RED, borderRadius: 4, padding: "1px 5px" }}>OVER</span>}
                            {isAmber && !isOver && <span style={{ fontSize: 10, fontWeight: 800, background: "rgba(245,124,0,0.13)", color: "#F57C00", borderRadius: 4, padding: "1px 5px" }}>80%+</span>}
                          </div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <span style={{ fontSize: 11, fontWeight: 700, background: "var(--color-bg)", borderRadius: 6, padding: "2px 6px", color: "var(--color-text-secondary)" }}>{pct.toFixed(1)}%</span>
                            <span style={{ fontWeight: 800, color: isOver ? OVER_RED : "var(--color-text-primary)" }}>{formatRand(c.total)}</span>
                          </div>
                        </div>
                        {limit ? (
                          <div>
                            {/* Two-tone bar: the category colour fills up to the budget,
                                only the actual overspend shows soft red - far calmer
                                than a wall of solid-red full bars. */}
                            <div style={{ height: 10, borderRadius: 5, background: "var(--color-border)", overflow: "hidden", display: "flex" }}>
                              {isOver ? (
                                <>
                                  <div style={{ height: "100%", background: c.color, width: `${(limit / c.total) * 100}%` }} />
                                  <div style={{ height: "100%", background: OVER_RED, flex: 1 }} />
                                </>
                              ) : (
                                <div style={{ height: "100%", borderRadius: 5, background: isAmber ? "#F57C00" : c.color, width: `${Math.min(100, usagePct)}%`, transition: "width 0.4s ease" }} />
                              )}
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3, fontSize: 11, color: "var(--color-text-secondary)" }}>
                              <span>{formatRand(c.total)} of {formatRand(limit)}</span>
                              <span style={{ color: isOver ? OVER_RED : isAmber ? "#F57C00" : "#007A85", fontWeight: 700 }}>
                                {isOver ? `${formatRand(c.total - limit)} over` : `${formatRand(limit - c.total)} left`}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div style={{ height: 8, borderRadius: 4, background: "var(--color-border)", overflow: "hidden" }}>
                            <div style={{ height: "100%", borderRadius: 4, background: c.color, width: `${Math.min(100, pct)}%`, transition: "width 0.4s ease" }} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {income > 0 && Object.keys(benchmarks).length > 0 && (
                <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 14, padding: 16, marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <BarChart2 size={15} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
                    <div style={{ fontWeight: 800, fontSize: 14 }}>How you compare</div>
                    <span style={{ fontSize: 10, fontWeight: 600, color: "var(--color-text-secondary)", marginLeft: "auto", background: "rgba(0,122,133,0.08)", padding: "2px 8px", borderRadius: 20 }}>Community avg</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {catTotals.filter((c) => benchmarks[c.id] !== undefined).slice(0, 5).map((c) => {
                      const userPct = income > 0 ? Math.round((c.total / income) * 100) : 0;
                      const avgPct = benchmarks[c.id];
                      const diff = userPct - avgPct;
                      const isOver = diff > 2;
                      const isUnder = diff < -2;
                      return (
                        <div key={c.id}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.color, flexShrink: 0 }} />
                              <span style={{ fontSize: 12, fontWeight: 600 }}>{c.label}</span>
                            </div>
                            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                              <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>avg {avgPct}%</span>
                              <span style={{ fontSize: 13, fontWeight: 800, color: isOver ? "#E03C31" : isUnder ? "#007A85" : "var(--color-text-primary)" }}>
                                you {userPct}%{isOver ? " ▲" : isUnder ? " ▼" : ""}
                              </span>
                            </div>
                          </div>
                          <div style={{ height: 6, borderRadius: 3, background: "var(--color-border)", overflow: "visible", position: "relative" }}>
                            <div style={{ position: "absolute", top: -2, left: `${Math.min(avgPct, 95)}%`, width: 2, height: 10, background: "rgba(255,255,255,0.4)", borderRadius: 1, zIndex: 2 }} />
                            <div style={{ height: "100%", borderRadius: 3, background: isOver ? "#E03C31" : isUnder ? "#007A85" : c.color, width: `${Math.min(100, userPct)}%`, transition: "width 0.5s ease" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--color-text-secondary)", marginTop: 12, textAlign: "center" }}>Anonymized community data, updated daily</div>
                </div>
              )}

              <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 14, overflow: "hidden", marginBottom: selectMode ? 80 : 24 }}>
                <div style={{ fontWeight: 800, fontSize: 14, padding: "14px 16px", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>{selectMode ? `${selectedIds.size} selected` : "Transactions"}</span>
                  {selectMode ? (
                    <button type="button" onClick={exitSelectMode} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)", fontWeight: 700, fontSize: 12.5, padding: 0 }}>Cancel</button>
                  ) : (
                    <button type="button" onClick={() => setSelectMode(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-primary)", fontWeight: 700, fontSize: 12.5, padding: 0 }}>Select</button>
                  )}
                </div>
                {(() => {
                  const getAccountName = (e: BudgetEntry) => {
                    // Prefer the linked bank account; fall back to the account_label
                    // string stored at import time; only then "Cash" (manual entries).
                    const ba = e.bank_accounts;
                    if (Array.isArray(ba)) {
                      if (ba.length > 0 && ba[0].institution_name) return ba[0].institution_name;
                    } else if (ba && ba.institution_name) {
                      return ba.institution_name;
                    }
                    if (e.account_label && e.account_label.trim()) return e.account_label.trim();
                    return e.entry_method === "imported" ? "Imported" : "Cash";
                  };
                  const rowInner = (e: BudgetEntry) => (
                    <>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: e.is_transfer ? "rgba(120,130,150,0.15)" : e.type === "income" ? "rgba(0,122,133,0.12)" : `${getCatColor(e.category)}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {e.is_transfer ? <ArrowLeftRight size={15} style={{ color: "var(--color-text-secondary)" }} /> : e.type === "income" ? <TrendingUp size={16} style={{ color: "#007A85" }} /> : <div style={{ width: 8, height: 8, borderRadius: "50%", background: getCatColor(e.category) }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "var(--color-text-primary)" }}>{e.is_transfer ? "Transfer" : getCatLabel(e.type, e.category)}</div>
                        <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {formatEntry(e.entry_date)}{e.description ? ` · ${e.description}` : ""}
                        </div>
                        <div style={{ fontSize: 10, color: "var(--color-text-secondary)", opacity: 0.8, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {getAccountName(e)} • {(e.entry_method === "imported" || e.source === "import") ? "Imported" : "Manual"}
                        </div>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: 14, color: e.is_transfer ? "var(--color-text-secondary)" : e.type === "income" ? "#007A85" : "var(--color-text-primary)", flexShrink: 0 }}>
                        {e.is_transfer ? "⇄ " : e.type === "income" ? "+" : "-"}{formatRand(e.amount)}
                      </div>
                    </>
                  );
                  return entries.map((e) => {
                    if (selectMode) {
                      const sel = selectedIds.has(e.id);
                      return (
                        <div key={e.id} role="button" tabIndex={0} onClick={() => toggleSelect(e.id)}
                          style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid var(--color-border)", gap: 12, width: "100%", background: sel ? "rgba(0,122,133,0.06)" : "var(--color-surface)", cursor: "pointer", textAlign: "left" }}>
                          <div style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, border: `2px solid ${sel ? "var(--color-primary)" : "var(--color-border)"}`, background: sel ? "var(--color-primary)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {sel && <Check size={13} style={{ color: "white" }} />}
                          </div>
                          {rowInner(e)}
                        </div>
                      );
                    }
                    return (
                      <SwipeableRow key={e.id} onOpen={() => openEdit(e)} onDelete={() => swipeDelete(e.id)}>
                        <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", gap: 12, width: "100%" }}>
                          {rowInner(e)}
                          <ChevronRight size={14} style={{ color: "var(--color-text-secondary)", flexShrink: 0 }} />
                        </div>
                      </SwipeableRow>
                    );
                  });
                })()}
              </div>
            </>
          )}
        </>
      )}
      </>)}

      {/* Bulk-select action bar */}
      {selectMode && selectedIds.size > 0 && (
        <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 350, padding: "12px 16px calc(14px + env(safe-area-inset-bottom))", background: "var(--color-surface)", borderTop: "1px solid var(--color-border)", display: "flex", justifyContent: "center", boxShadow: "0 -4px 16px rgba(0,0,0,0.08)" }}>
          <button type="button" onClick={bulkDelete}
            style={{ width: "100%", maxWidth: 420, padding: 14, borderRadius: 12, border: "none", background: "#E03C31", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Trash2 size={17} /> Delete {selectedIds.size} selected
          </button>
        </div>
      )}

      {/* Export Report Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-[400] flex items-end justify-center bg-black/60" role="dialog" aria-modal="true" onClick={() => setShowExportModal(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--color-surface)", borderRadius: "20px 20px 0 0", padding: "24px 20px 36px", width: "100%", maxWidth: 500 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ fontWeight: 900, fontSize: 18 }}>Export Budget Report</h3>
              <button type="button" onClick={() => setShowExportModal(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                <X size={20} style={{ color: "var(--color-text-secondary)" }} />
              </button>
            </div>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 16 }}>
              Download a PDF summary of your budget vs actual spending for a chosen period.
            </p>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 6 }}>Period</div>
              <select
                value={exportPreset}
                onChange={(e) => setExportPreset(e.target.value as PeriodPreset)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1px solid var(--color-border)",
                  fontSize: 14,
                  fontWeight: 600,
                  background: "var(--color-bg)",
                  color: "var(--color-text-primary)",
                }}
              >
                <option value="this_month">This month (to date)</option>
                <option value="last_month">Last month</option>
                <option value="quarter">This quarter (to date)</option>
                <option value="year">This year (to date)</option>
                <option value="custom">Custom range</option>
              </select>
            </div>
            {exportPreset === "custom" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 6 }}>From</div>
                  <input
                    type="date"
                    value={exportCustomStart}
                    onChange={(e) => setExportCustomStart(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--color-border)", fontSize: 14, background: "var(--color-bg)", color: "var(--color-text-primary)", boxSizing: "border-box" as const }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 6 }}>To</div>
                  <input
                    type="date"
                    value={exportCustomEnd}
                    onChange={(e) => setExportCustomEnd(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--color-border)", fontSize: 14, background: "var(--color-bg)", color: "var(--color-text-primary)", boxSizing: "border-box" as const }}
                  />
                </div>
              </div>
            )}
            {exportError && (
              <div style={{ marginBottom: 12, padding: "10px 12px", borderRadius: 10, background: "rgba(224,60,49,0.1)", color: "#E03C31", fontSize: 13, fontWeight: 600 }}>
                {exportError}
              </div>
            )}
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: "100%", padding: 14, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              disabled={exportLoading}
              onClick={handleExportReport}
            >
              <FileText size={16} aria-hidden />
              {exportLoading ? "Generating PDF…" : "Download PDF"}
            </button>
          </div>
        </div>
      )}

      {/* Set Budget Targets Modal */}
      {showSetBudget && (
        <div className="fixed inset-0 z-[400] flex items-end justify-center bg-black/60" role="dialog" aria-modal="true"
          onClick={() => setShowSetBudget(false)}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ background: "var(--color-surface)", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 500, maxHeight: "92vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Sticky header - X always reachable on mobile */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px 12px", borderBottom: "1px solid var(--color-border)", flexShrink: 0 }}>
              <h3 style={{ fontWeight: 900, fontSize: 18 }}>{budgetScope === "default" ? "Set Default Budget" : `Budget for ${monthLabel}`}</h3>
              <button type="button" onClick={() => setShowSetBudget(false)} aria-label="Close" style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: 999, cursor: "pointer", padding: 6, display: "flex" }}>
                <X size={18} style={{ color: "var(--color-text-secondary)" }} />
              </button>
            </div>

            {/* Scrollable body */}
            <div style={{ overflowY: "auto", padding: "16px 20px", flex: 1 }}>
              {/* Scope toggle: default (every month) vs just this month */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                {([
                  { key: "default" as const, label: "Every month", sub: "Default" },
                  { key: "month" as const, label: `Only ${monthLabel}`, sub: "Override" },
                ]).map((opt) => {
                  const active = budgetScope === opt.key;
                  return (
                    <button key={opt.key} type="button" onClick={() => {
                      const source = opt.key === "default" ? defaultTargets : budgetTargets;
                      const draft: Record<string, string> = {};
                      allExpCats.forEach((c) => { draft[c.id] = source[c.id] ? String(source[c.id]) : ""; });
                      setBudgetDraft(draft);
                      setBudgetScope(opt.key);
                      if (opt.key === "month") setBudgetApplyAll(false);
                    }}
                      style={{ padding: "9px 10px", borderRadius: 10, cursor: "pointer", border: `2px solid ${active ? "var(--color-primary)" : "var(--color-border)"}`, background: active ? "rgba(0,122,133,0.08)" : "var(--color-bg)", textAlign: "center" }}>
                      <div style={{ fontWeight: 800, fontSize: 13.5, color: "var(--color-text-primary)" }}>{opt.label}</div>
                      <div style={{ fontSize: 10.5, color: "var(--color-text-secondary)", marginTop: 1 }}>{opt.sub}</div>
                    </button>
                  );
                })}
              </div>

              {/* Default timing: from this month onward vs all months */}
              {budgetScope === "default" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                  {([
                    { all: false, label: `From ${monthLabel} on`, sub: "Keep history" },
                    { all: true, label: "All months", sub: "Past too" },
                  ]).map((opt) => {
                    const active = budgetApplyAll === opt.all;
                    return (
                      <button key={String(opt.all)} type="button" onClick={() => setBudgetApplyAll(opt.all)}
                        style={{ padding: "8px 10px", borderRadius: 10, cursor: "pointer", border: `1.5px solid ${active ? "var(--color-primary)" : "var(--color-border)"}`, background: active ? "rgba(0,122,133,0.06)" : "var(--color-bg)", textAlign: "center" }}>
                        <div style={{ fontWeight: 700, fontSize: 12.5, color: "var(--color-text-primary)" }}>{opt.label}</div>
                        <div style={{ fontSize: 10, color: "var(--color-text-secondary)", marginTop: 1 }}>{opt.sub}</div>
                      </button>
                    );
                  })}
                </div>
              )}

              <p style={{ fontSize: 12.5, color: "var(--color-text-secondary)", marginBottom: 16 }}>
                {budgetScope !== "default"
                  ? `Set limits for ${monthLabel} only. These override your default budget for this month. Leave blank to follow the default.`
                  : budgetApplyAll
                    ? "Applies to every month - past and future - and replaces any month-specific budgets you've set. Use this to reset your whole budget."
                    : `Your default budget from ${monthLabel} onward. Earlier months keep the budget they already had, so this won't rewrite your history. You can still override individual months. Leave blank for no limit.`}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {/* "Other" is the uncategorised bucket, not a spending envelope -
                    budgeting it produces meaningless "over budget" alerts. */}
                {allExpCats.filter((c) => c.id !== "other").map((c) => (
                  <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: c.color, flexShrink: 0 }} />
                    <span style={{ fontWeight: 600, fontSize: 13, flex: 1, minWidth: 0 }}>{c.label}</span>
                    <div style={{ position: "relative", width: 120 }}>
                      <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 13, fontWeight: 700, color: "var(--color-text-secondary)" }}>R</span>
                      <input type="number" inputMode="decimal"
                        placeholder={budgetScope === "month" && defaultTargets[c.id] ? String(defaultTargets[c.id]) : "0"}
                        value={budgetDraft[c.id] ?? ""}
                        onChange={(e) => setBudgetDraft((prev) => ({ ...prev, [c.id]: e.target.value }))}
                        style={{ width: "100%", padding: "10px 10px 10px 26px", borderRadius: 10, border: "1px solid var(--color-border)", background: "var(--color-bg)", fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)" }} />
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => { resetCustomCatForm(); setNewCatType("expense"); setShowAddCustomCat(true); }}
                  style={{ marginTop: 2, padding: "11px 12px", borderRadius: 10, cursor: "pointer", border: "2px dashed var(--color-border)", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontWeight: 700, fontSize: 13, color: "var(--color-text-secondary)" }}>
                  <Plus size={15} aria-hidden /> Add a category
                </button>
              </div>
            </div>

            {/* Sticky footer */}
            <div style={{ padding: "12px 20px calc(16px + env(safe-area-inset-bottom))", borderTop: "1px solid var(--color-border)", flexShrink: 0, background: "var(--color-surface)" }}>
              <button type="button" className="btn btn-primary" style={{ width: "100%", padding: 14, fontSize: 15 }} disabled={budgetSaving}
                onClick={() => {
                  if (budgetScope === "default" && budgetApplyAll &&
                    !window.confirm("Apply this budget to every month (past and future) and replace any month-specific budgets?")) return;
                  handleSaveBudgetTargets();
                }}>
                {budgetSaving ? "Saving..." : budgetScope !== "default" ? `Save budget for ${monthLabel}` : budgetApplyAll ? "Apply to all months" : "Save default budget"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Entry Modal */}
      {editEntry && (
        <div className="fixed inset-0 z-[400] flex items-end justify-center bg-black/60" role="dialog" aria-modal="true" onClick={() => setEditEntry(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--color-surface)", borderRadius: "20px 20px 0 0", padding: "24px 20px 36px", width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, position: "sticky", top: -24, background: "var(--color-surface)", paddingTop: 8, marginTop: -8, zIndex: 2 }}>
              <h3 style={{ fontWeight: 900, fontSize: 18 }}>Edit Entry</h3>
              <button type="button" onClick={() => setEditEntry(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)" }}><X size={20} /></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
              {(["expense", "income"] as const).map((t) => (
                <button key={t} type="button" onClick={() => { setEditType(t); setEditCategory(""); }}
                  style={{ padding: "10px", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", border: `2px solid ${editType === t ? "var(--color-primary)" : "var(--color-border)"}`, background: editType === t ? "rgba(0,122,133,0.1)" : "var(--color-bg)", color: "var(--color-text-primary)", textTransform: "capitalize" }}>
                  {t === "income" ? "Income +" : "Expense -"}
                </button>
              ))}
            </div>
            {/* Mark as transfer - excludes this entry from income/expense totals */}
            <button type="button" onClick={() => setEditIsTransfer((v) => !v)}
              style={{ width: "100%", marginBottom: 16, padding: "11px 14px", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, border: `2px solid ${editIsTransfer ? "var(--color-primary)" : "var(--color-border)"}`, background: editIsTransfer ? "rgba(0,122,133,0.08)" : "var(--color-bg)", color: "var(--color-text-primary)", textAlign: "left" }}>
              <div style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, border: `2px solid ${editIsTransfer ? "var(--color-primary)" : "var(--color-border)"}`, background: editIsTransfer ? "var(--color-primary)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {editIsTransfer && <Check size={12} style={{ color: "white" }} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>This is a transfer</div>
                <div style={{ fontSize: 11.5, color: "var(--color-text-secondary)" }}>Money moved between accounts - kept out of income &amp; expenses</div>
              </div>
            </button>
            {/* Funding Source Selector */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 8 }}>Funding Source</div>
              <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
                <button type="button" onClick={() => setEditAccountId(null)}
                  style={{ padding: "8px 14px", borderRadius: 20, whiteSpace: "nowrap", cursor: "pointer", border: `2px solid ${editAccountId === null ? "var(--color-primary)" : "var(--color-border)"}`, background: editAccountId === null ? "rgba(0,122,133,0.08)" : "var(--color-bg)", fontWeight: 600, fontSize: 13, color: "var(--color-text-primary)" }}>
                  Cash
                </button>
                {bankAccounts.map((b) => (
                  <button key={b.id} type="button" onClick={() => setEditAccountId(b.id)}
                    style={{ padding: "8px 14px", borderRadius: 20, whiteSpace: "nowrap", cursor: "pointer", border: `2px solid ${editAccountId === b.id ? "var(--color-primary)" : "var(--color-border)"}`, background: editAccountId === b.id ? "rgba(0,122,133,0.08)" : "var(--color-bg)", fontWeight: 600, fontSize: 13, color: "var(--color-text-primary)" }}>
                    {b.institution_name}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 8 }}>Category</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {(editType === "expense" ? allExpCats : allIncCats).map((c) => (
                  <button key={c.id} type="button" onClick={() => setEditCategory(c.id)}
                    style={{ padding: "10px 12px", borderRadius: 10, cursor: "pointer", border: `2px solid ${editCategory === c.id ? "var(--color-primary)" : "var(--color-border)"}`, background: editCategory === c.id ? "rgba(0,122,133,0.08)" : "var(--color-bg)", display: "flex", alignItems: "center", gap: 8, fontWeight: 600, fontSize: 13, color: "var(--color-text-primary)", textAlign: "left" }}>
                    <c.Icon size={14} style={{ color: "var(--color-primary)", flexShrink: 0 }} aria-hidden />
                    <span>{c.label}</span>
                  </button>
                ))}
                <button type="button" onClick={() => { resetCustomCatForm(); setNewCatType(editType === "income" ? "income" : "expense"); setShowAddCustomCat(true); }}
                  style={{ marginTop: 2, padding: "11px 12px", borderRadius: 10, cursor: "pointer", border: "2px dashed var(--color-border)", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontWeight: 700, fontSize: 13, color: "var(--color-text-secondary)" }}>
                  <Plus size={15} aria-hidden /> Add a category
                </button>
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 6 }}>Amount (R)</div>
              <input type="number" inputMode="decimal" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} min="0.01" step="0.01"
                style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid var(--color-border)", fontSize: 16, fontWeight: 700, background: "var(--color-bg)", color: "var(--color-text-primary)", boxSizing: "border-box" as const }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 6 }}>Description</div>
              <input type="text" value={editDesc} onChange={(e) => setEditDesc(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--color-border)", fontSize: 14, background: "var(--color-bg)", color: "var(--color-text-primary)", boxSizing: "border-box" as const }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 6 }}>Date</div>
              <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--color-border)", fontSize: 14, background: "var(--color-bg)", color: "var(--color-text-primary)", boxSizing: "border-box" as const }} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" onClick={handleEditDelete} disabled={editSaving}
                style={{ padding: "13px 16px", borderRadius: 12, border: "1.5px solid #E03C31", background: "transparent", color: "#E03C31", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <Trash2 size={15} /> Delete
              </button>
              <button type="button" className="btn btn-primary" style={{ flex: 1, padding: 14, fontSize: 15 }} disabled={editSaving || !editCategory || !editAmount || Number(editAmount) <= 0} onClick={handleEditSave}>
                {editSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply-to-similar Modal: shown after a category edit when other
          transactions from the same merchant exist. */}
      {similarPrompt && (() => {
        const catList = similarPrompt.type === "expense" ? allExpCats : allIncCats;
        const catLabel = catList.find((c) => c.id === similarPrompt.newCategory)?.label ?? similarPrompt.newCategory;
        const oldCatLabel = (id: string) => catList.find((c) => c.id === id)?.label ?? id;
        const n = similarSelected.size;
        const none = similarPrompt.candidates.length === 0;
        return (
          <div className="fixed inset-0 z-[410] flex items-end justify-center bg-black/60" role="dialog" aria-modal="true" onClick={() => setSimilarPrompt(null)}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--color-surface)", borderRadius: "20px 20px 0 0", padding: "24px 20px 0", width: "100%", maxWidth: 500, maxHeight: "85vh", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <h3 style={{ fontWeight: 900, fontSize: 17 }}>
                  {none
                    ? "Remember this merchant?"
                    : `Found ${similarPrompt.candidates.length} similar transaction${similarPrompt.candidates.length === 1 ? "" : "s"}`}
                </h3>
                <button type="button" onClick={() => setSimilarPrompt(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)" }} aria-label="Close"><X size={20} /></button>
              </div>
              <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 12 }}>
                {none ? (
                  <>
                    No other <strong style={{ color: "var(--color-text-primary)" }}>{similarPrompt.merchantLabel}</strong> transactions found right now - but Notho can remember this, so every future import from them lands in{" "}
                    <strong style={{ color: "var(--color-primary)" }}>{catLabel}</strong> automatically.
                  </>
                ) : (
                  <>
                    Other transactions from <strong style={{ color: "var(--color-text-primary)" }}>{similarPrompt.merchantLabel}</strong> can also move to{" "}
                    <strong style={{ color: "var(--color-primary)" }}>{catLabel}</strong>. Untick any that should stay as they are.
                  </>
                )}
              </p>
              {!none && (
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <button type="button" onClick={() => setSimilarSelected(new Set(similarPrompt.candidates.map((c) => c.id)))}
                  style={{ padding: "6px 12px", borderRadius: 16, border: "1.5px solid var(--color-border)", background: "var(--color-bg)", fontSize: 12, fontWeight: 700, cursor: "pointer", color: "var(--color-text-primary)" }}>
                  Select all
                </button>
                <button type="button" onClick={() => setSimilarSelected(new Set())}
                  style={{ padding: "6px 12px", borderRadius: 16, border: "1.5px solid var(--color-border)", background: "var(--color-bg)", fontSize: 12, fontWeight: 700, cursor: "pointer", color: "var(--color-text-primary)" }}>
                  Select none
                </button>
              </div>
              )}
              <div style={{ overflowY: "auto", flex: 1, minHeight: 0, border: none ? "none" : "1px solid var(--color-border)", borderRadius: 12 }}>
                {similarPrompt.candidates.map((c, idx) => {
                  const checked = similarSelected.has(c.id);
                  return (
                    <button key={c.id} type="button" onClick={() => toggleSimilarSelected(c.id)}
                      style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", cursor: "pointer", textAlign: "left", background: "transparent", border: "none", borderTop: idx === 0 ? "none" : "1px solid var(--color-border)", color: "var(--color-text-primary)" }}>
                      <div style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, border: `2px solid ${checked ? "var(--color-primary)" : "var(--color-border)"}`, background: checked ? "var(--color-primary)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {checked && <Check size={12} style={{ color: "white" }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.description}</div>
                        <div style={{ fontSize: 11.5, color: "var(--color-text-secondary)" }}>{c.entry_date} · currently {oldCatLabel(c.category)}</div>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: 13, flexShrink: 0, color: c.type === "income" ? "var(--color-primary)" : "var(--color-text-primary)" }}>
                        {c.type === "income" ? "+" : "-"}{formatRand(c.amount)}
                      </div>
                    </button>
                  );
                })}
              </div>
              <button type="button" onClick={() => setSimilarRemember((v) => !v)}
                style={{ width: "100%", margin: "12px 0 0", padding: "11px 14px", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, border: `2px solid ${similarRemember ? "var(--color-primary)" : "var(--color-border)"}`, background: similarRemember ? "rgba(0,122,133,0.08)" : "var(--color-bg)", color: "var(--color-text-primary)", textAlign: "left" }}>
                <div style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, border: `2px solid ${similarRemember ? "var(--color-primary)" : "var(--color-border)"}`, background: similarRemember ? "var(--color-primary)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {similarRemember && <Check size={12} style={{ color: "white" }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>Remember for future imports</div>
                  <div style={{ fontSize: 11.5, color: "var(--color-text-secondary)" }}>New {similarPrompt.merchantLabel} transactions will land in {catLabel} automatically</div>
                </div>
              </button>
              <div style={{ display: "flex", gap: 10, padding: "12px 0 calc(16px + env(safe-area-inset-bottom))" }}>
                <button type="button" onClick={() => setSimilarPrompt(null)} disabled={similarSaving}
                  style={{ padding: "13px 16px", borderRadius: 12, border: "1.5px solid var(--color-border)", background: "transparent", color: "var(--color-text-secondary)", fontWeight: 700, cursor: "pointer" }}>
                  Skip
                </button>
                <button type="button" className="btn btn-primary" style={{ flex: 1, padding: 14, fontSize: 15 }} disabled={similarSaving || (n === 0 && !similarRemember)} onClick={applySimilar}>
                  {similarSaving ? "Applying..." : n > 0 ? `Move ${n} to ${catLabel}` : "Just remember the rule"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Add Entry Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-[400] flex items-end justify-center bg-black/60" role="dialog" aria-modal="true" onClick={() => setShowAdd(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--color-surface)", borderRadius: "20px 20px 0 0", padding: "24px 20px 36px", width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, position: "sticky", top: -24, background: "var(--color-surface)", paddingTop: 8, marginTop: -8, zIndex: 2 }}>
              <h3 style={{ fontWeight: 900, fontSize: 18 }}>Add Entry</h3>
              <button type="button" onClick={() => setShowAdd(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)" }}><X size={20} /></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
              {(["expense", "income", "transfer"] as const).map((t) => (
                <button key={t} type="button" onClick={() => { setAddType(t); setAddCategory(""); }}
                  style={{ padding: "10px 6px", borderRadius: 10, fontWeight: 700, fontSize: 13.5, cursor: "pointer", border: `2px solid ${addType === t ? "var(--color-primary)" : "var(--color-border)"}`, background: addType === t ? "rgba(0,122,133,0.1)" : "var(--color-bg)", color: "var(--color-text-primary)" }}>
                  {t === "income" ? "Income +" : t === "expense" ? "Expense -" : "Transfer ⇄"}
                </button>
              ))}
            </div>
            {addType === "transfer" ? (
              <>
                <p style={{ fontSize: 12.5, color: "var(--color-text-secondary)", marginBottom: 14 }}>
                  Moving money between your own accounts (or to savings). Transfers are kept out of your income and expenses so they don&apos;t distort your budget.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 6 }}>From</div>
                    <input type="text" placeholder="e.g. Cheque" value={addFrom} onChange={(e) => setAddFrom(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--color-border)", fontSize: 14, background: "var(--color-bg)", color: "var(--color-text-primary)", boxSizing: "border-box" as const }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 6 }}>To</div>
                    <input type="text" placeholder="e.g. Savings" value={addTo} onChange={(e) => setAddTo(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--color-border)", fontSize: 14, background: "var(--color-bg)", color: "var(--color-text-primary)", boxSizing: "border-box" as const }} />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Funding Source Selector */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 8 }}>Funding Source</div>
                  <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
                    <button type="button" onClick={() => setAddAccountId(null)}
                      style={{ padding: "8px 14px", borderRadius: 20, whiteSpace: "nowrap", cursor: "pointer", border: `2px solid ${addAccountId === null ? "var(--color-primary)" : "var(--color-border)"}`, background: addAccountId === null ? "rgba(0,122,133,0.08)" : "var(--color-bg)", fontWeight: 600, fontSize: 13, color: "var(--color-text-primary)" }}>
                      Cash
                    </button>
                    {bankAccounts.map((b) => (
                      <button key={b.id} type="button" onClick={() => setAddAccountId(b.id)}
                        style={{ padding: "8px 14px", borderRadius: 20, whiteSpace: "nowrap", cursor: "pointer", border: `2px solid ${addAccountId === b.id ? "var(--color-primary)" : "var(--color-border)"}`, background: addAccountId === b.id ? "rgba(0,122,133,0.08)" : "var(--color-bg)", fontWeight: 600, fontSize: 13, color: "var(--color-text-primary)" }}>
                        {b.institution_name}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 8 }}>Category</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {(addType === "expense" ? allExpCats : allIncCats).map((c) => (
                      <button key={c.id} type="button" onClick={() => setAddCategory(c.id)}
                        style={{ padding: "10px 12px", borderRadius: 10, cursor: "pointer", border: `2px solid ${addCategory === c.id ? "var(--color-primary)" : "var(--color-border)"}`, background: addCategory === c.id ? "rgba(0,122,133,0.08)" : "var(--color-bg)", display: "flex", alignItems: "center", gap: 8, fontWeight: 600, fontSize: 13, color: "var(--color-text-primary)", textAlign: "left" }}>
                        <c.Icon size={14} style={{ color: "var(--color-primary)", flexShrink: 0 }} aria-hidden />
                        <span>{c.label}</span>
                      </button>
                    ))}
                    <button type="button" onClick={() => { resetCustomCatForm(); setNewCatType(addType === "income" ? "income" : "expense"); setShowAddCustomCat(true); }}
                      style={{ padding: "10px 12px", borderRadius: 10, cursor: "pointer", border: "2px dashed var(--color-border)", background: "transparent", display: "flex", alignItems: "center", gap: 8, fontWeight: 600, fontSize: 13, color: "var(--color-text-secondary)", textAlign: "left" }}>
                      <Plus size={14} style={{ flexShrink: 0 }} aria-hidden /> <span>Add category</span>
                    </button>
                  </div>
                </div>
              </>
            )}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 6 }}>Amount (R)</div>
              <input type="number" inputMode="decimal" placeholder="0.00" value={addAmount} onChange={(e) => setAddAmount(e.target.value)} min="0.01" step="0.01"
                style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid var(--color-border)", fontSize: 16, fontWeight: 700, background: "var(--color-bg)", color: "var(--color-text-primary)", boxSizing: "border-box" as const }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 6 }}>Description (optional)</div>
              <input type="text" placeholder="e.g. Woolworths, Uber" value={addDesc} onChange={(e) => setAddDesc(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--color-border)", fontSize: 14, background: "var(--color-bg)", color: "var(--color-text-primary)", boxSizing: "border-box" as const }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 6 }}>Date</div>
              <input type="date" value={addDate} onChange={(e) => setAddDate(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--color-border)", fontSize: 14, background: "var(--color-bg)", color: "var(--color-text-primary)", boxSizing: "border-box" as const }} />
            </div>
            <button type="button" className="btn btn-primary" style={{ width: "100%", padding: 14, fontSize: 16 }}
              disabled={saving || !addAmount || Number(addAmount) <= 0 || (addType === "transfer" ? (!addFrom.trim() || !addTo.trim()) : !addCategory)} onClick={handleAdd}>
              {saving ? "Saving..." : addType === "transfer" ? "Save Transfer" : "Save Entry"}
            </button>
          </div>
        </div>
      )}

      {/* Add Custom Category Modal */}
      {showAddCustomCat && (
        <div className="fixed inset-0 z-[500] flex items-end justify-center bg-black/70" role="dialog" aria-modal="true" onClick={() => { setShowAddCustomCat(false); resetCustomCatForm(); }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--color-surface)", borderRadius: "20px 20px 0 0", padding: "24px 20px 40px", width: "100%", maxWidth: 500, maxHeight: "92vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, position: "sticky", top: -24, background: "var(--color-surface)", paddingTop: 8, marginTop: -8, zIndex: 2 }}>
              <h3 style={{ fontWeight: 900, fontSize: 18 }}>{editingCatId ? "Edit Category" : "New Category"}</h3>
              <button type="button" onClick={() => { setShowAddCustomCat(false); resetCustomCatForm(); }} style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: 999, cursor: "pointer", padding: 6, display: "flex", color: "var(--color-text-secondary)" }}><X size={18} /></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20, opacity: editingCatId ? 0.5 : 1, pointerEvents: editingCatId ? "none" : "auto" }}>
              {(["expense", "income"] as const).map((t) => (
                <button key={t} type="button" onClick={() => setNewCatType(t)}
                  style={{ padding: 10, borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", border: `2px solid ${newCatType === t ? "var(--color-primary)" : "var(--color-border)"}`, background: newCatType === t ? "rgba(0,122,133,0.1)" : "var(--color-bg)", color: "var(--color-text-primary)", textTransform: "capitalize" }}>
                  {t === "income" ? "Income" : "Expense"}
                </button>
              ))}
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 6 }}>Category Name</div>
              <input type="text" placeholder="e.g. Gym, Pets, Clothing" value={newCatName} onChange={(e) => setNewCatName(e.target.value)}
                style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid var(--color-border)", fontSize: 15, fontWeight: 700, background: "var(--color-bg)", color: "var(--color-text-primary)", boxSizing: "border-box" as const }} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 8 }}>Colour</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                {CAT_COLOR_SWATCHES.map((col) => (
                  <button key={col} type="button" onClick={() => setNewCatColor(col)}
                    style={{ width: 30, height: 30, borderRadius: "50%", background: col, border: `3px solid ${newCatColor.toLowerCase() === col.toLowerCase() ? "white" : "transparent"}`, outline: newCatColor.toLowerCase() === col.toLowerCase() ? `2px solid ${col}` : "none", cursor: "pointer", flexShrink: 0 }}
                    aria-label={col} />
                ))}
                {/* Custom colour: native picker, styled as a "＋" swatch. The
                    current custom pick shows a ring when it isn't a preset. */}
                <label
                  title="Pick a custom colour"
                  style={{
                    position: "relative", width: 30, height: 30, borderRadius: "50%", cursor: "pointer", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: CAT_COLOR_SWATCHES.some((s) => s.toLowerCase() === newCatColor.toLowerCase()) ? "var(--color-bg)" : newCatColor,
                    border: `2px dashed ${CAT_COLOR_SWATCHES.some((s) => s.toLowerCase() === newCatColor.toLowerCase()) ? "var(--color-border)" : "white"}`,
                    outline: CAT_COLOR_SWATCHES.some((s) => s.toLowerCase() === newCatColor.toLowerCase()) ? "none" : `2px solid ${newCatColor}`,
                  }}
                >
                  <Plus size={15} style={{ color: CAT_COLOR_SWATCHES.some((s) => s.toLowerCase() === newCatColor.toLowerCase()) ? "var(--color-text-secondary)" : "white" }} />
                  <input
                    type="color"
                    value={/^#[0-9a-fA-F]{6}$/.test(newCatColor) ? newCatColor : "#007A85"}
                    onChange={(e) => setNewCatColor(e.target.value)}
                    style={{ position: "absolute", inset: 0, opacity: 0, width: "100%", height: "100%", cursor: "pointer" }}
                    aria-label="Custom colour"
                  />
                </label>
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 8 }}>Icon</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
                {ICON_PICKER_OPTIONS.map((opt) => (
                  <button key={opt.name} type="button" onClick={() => setNewCatIcon(opt.name)}
                    style={{ padding: 10, borderRadius: 10, cursor: "pointer", border: `2px solid ${newCatIcon === opt.name ? newCatColor : "var(--color-border)"}`, background: newCatIcon === opt.name ? `${newCatColor}18` : "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}
                    aria-label={opt.name}>
                    <opt.Icon size={18} style={{ color: newCatIcon === opt.name ? newCatColor : "var(--color-text-secondary)" }} />
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 20, padding: "12px 14px", borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-bg)", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${newCatColor}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {(() => { const Ic = getIconByName(newCatIcon); return <Ic size={18} style={{ color: newCatColor }} />; })()}
              </div>
              <span style={{ fontWeight: 700, fontSize: 14, color: "var(--color-text-primary)" }}>{newCatName.trim() || "Category name"}</span>
              <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "capitalize" }}>{newCatType}</span>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {editingCatId && (
                <button type="button" onClick={resetCustomCatForm}
                  style={{ padding: "13px 18px", borderRadius: 12, border: "1.5px solid var(--color-border)", background: "transparent", color: "var(--color-text-secondary)", fontWeight: 700, cursor: "pointer" }}>
                  Cancel
                </button>
              )}
              <button type="button" className="btn btn-primary" style={{ flex: 1, padding: 14, fontSize: 15 }} disabled={savingCustomCat || !newCatName.trim()} onClick={handleSaveCustomCat}>
                {savingCustomCat ? "Saving..." : editingCatId ? "Save changes" : "Create Category"}
              </button>
            </div>
            {customCats.filter(c => c.type === newCatType).length > 0 && (
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--color-border)" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 10 }}>Your custom {newCatType} categories · tap to edit</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {customCats.filter(c => c.type === newCatType).map((c) => {
                    const CatIcon = getIconByName(c.icon_name);
                    const active = editingCatId === c.id;
                    return (
                      <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: active ? "rgba(0,122,133,0.06)" : "var(--color-bg)", border: `1px solid ${active ? "var(--color-primary)" : "var(--color-border)"}` }}>
                        <button type="button" onClick={() => startEditCustomCat(c)}
                          style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0, background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}>
                          <CatIcon size={16} style={{ color: c.color, flexShrink: 0 }} />
                          <span style={{ fontWeight: 600, fontSize: 13, flex: 1, color: "var(--color-text-primary)" }}>{c.name}</span>
                          <Pencil size={13} style={{ color: "var(--color-text-secondary)", flexShrink: 0 }} />
                        </button>
                        <button type="button" onClick={() => handleDeleteCustomCat(c.id)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#E03C31", padding: 4, display: "flex", alignItems: "center" }} aria-label="Delete category">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </main>
  );
}

export default BudgetView;
