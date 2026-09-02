"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { analytics } from "@/lib/analytics";
import { useUserSettings } from "@/hooks/useUserSettings";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  BarChart2,
  CheckCircle2,
  Clock,
  Info,
  Target,
  TrendingUp,
  Wallet,
} from "@/components/icons/NothoIcons";
import { formatWithSpaces, formatRand, formatZAR } from "@/lib/formatters";
import { ShareResultButton } from "@/components/ShareCard";
import {
  type CalcInputs,
  calcGrowth,
  solveForYears,
  solveForMonthly,
  solveForRate,
  solveForInitial,
} from "@/lib/calculators";

export type { CalcInputs };

type SolveMode = "goal" | "time" | "monthly" | "rate" | "initial";
