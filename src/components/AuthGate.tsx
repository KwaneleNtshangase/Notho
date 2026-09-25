"use client";

import React, { useState, useEffect } from "react";
import { Mail, KeyRound, AlertTriangle, ClipboardCopy, CheckCircle, NothoLearn, NothoBudget, NothoCalculate } from "@/components/icons/NothoIcons";
import { supabase } from "@/lib/supabaseClient";
import { isNativePlatform } from "@/lib/capacitorPlatform";
