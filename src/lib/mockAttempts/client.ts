"use client";

import { supabase } from "@/lib/supabaseClient";
import { parseLocale } from '@/i18n/locales';
import type { MockAttemptMutation, MockAttemptSnapshot } from "@/lib/mockAttempts/types";

type AttemptResponse = { attempt: MockAttemptSnapshot };
const presentationLocale = () => typeof document === 'undefined' ? 'en' : parseLocale(document.documentElement.lang.split('-')[0]);

export class MockAttemptApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly attempt: MockAttemptSnapshot | null = null
  ) {
    super(message);
  }
}

async function bearerToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new MockAttemptApiError("Sign in to sit a mock exam", 401);
  return token;
}

async function requestAttempt(path: string, init: RequestInit): Promise<MockAttemptSnapshot> {
  const token = await bearerToken();
  const locale = presentationLocale();
  const response = await fetch(path, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Notho-Locale': locale,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => ({}))) as Partial<
    AttemptResponse & { error: string }
  >;
  // A language change must never replay an answer or submission. Re-read the
  // same attempt to refresh presentation after the original mutation finishes.
  const changedLanguage = locale !== presentationLocale();
  const snapshot = changedLanguage && payload.attempt
    ? await getMockAttempt(payload.attempt.id) : payload.attempt;
  if (!response.ok || !payload.attempt) {
    throw new MockAttemptApiError(
      changedLanguage ? "The mock attempt request failed" : payload.error ?? "The mock attempt request failed",
      response.status,
      snapshot ?? null
    );
  }
  return snapshot!;
}

export function startMockAttempt(
  courseId: string,
  lessonId: string,
  newAttempt = false
) {
  return requestAttempt("/api/mock-attempts", {
    method: "POST",
    body: JSON.stringify({ courseId, lessonId, newAttempt }),
  });
}

export function getMockAttempt(attemptId: string) {
  return requestAttempt(`/api/mock-attempts/${attemptId}`, { method: "GET" });
}

export function saveMockAttemptMutation(attemptId: string, mutation: MockAttemptMutation) {
  return requestAttempt(`/api/mock-attempts/${attemptId}`, {
    method: "PATCH",
    body: JSON.stringify(mutation),
  });
}

export function submitMockAttempt(attemptId: string) {
  return requestAttempt(`/api/mock-attempts/${attemptId}/submit`, { method: "POST" });
}

export async function getMockExplanation(attemptId: string, questionId: string): Promise<string> {
  const token = await bearerToken();
  const locale = presentationLocale();
  const response = await fetch(
    `/api/mock-attempts/${attemptId}/explanations/${questionId}`,
    {
      headers: { Authorization: `Bearer ${token}`, 'X-Notho-Locale': locale },
      cache: "no-store",
    }
  );
  const payload = (await response.json().catch(() => ({}))) as {
    explanation?: string;
    error?: string;
  };
  if (!response.ok || !payload.explanation) {
    throw new MockAttemptApiError(payload.error ?? "Explanation unavailable", response.status);
  }
  if (locale !== presentationLocale()) return getMockExplanation(attemptId, questionId);
  return payload.explanation;
}

export function newMutationId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}
