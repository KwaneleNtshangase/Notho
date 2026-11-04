'use client';
import React, { createElement, type ReactNode } from 'react';
import { useLocale } from './LocaleProvider';
import { localizeString } from './stringZu';

/** Whole sentences with inline emphasis/links. Tags are fixed React elements,
 * never HTML supplied by a translation or by the user. */
export function LocalizedRichText({ source, elements }: { source: string; elements: React.ReactElement[] }) {
  const { locale } = useLocale();
  const translated = localizeString(locale, source);
  const root: ReactNode[] = [];
  const stack: { index: number; children: ReactNode[] }[] = [{ index: -1, children: root }];
  for (const token of translated.split(/(<\/?[a-z]+\d+>)/g)) {
    const open = /^<[a-z]+(\d+)>$/.exec(token);
    const close = /^<\/[a-z]+(\d+)>$/.exec(token);
    if (open) stack.push({ index: Number(open[1]), children: [] });
    else if (close && stack.length > 1) {
      const current = stack.pop()!;
      if (current.index !== Number(close[1]) || !elements[current.index]) return <>{source}</>;
      stack.at(-1)!.children.push(React.cloneElement(elements[current.index], { key: current.index }, current.children));
    } else if (token) stack.at(-1)!.children.push(token);
  }
  return <>{root}</>;
}

/** React owns every node. No DOM replacement or modification of input values. */
export function LocalizedText({ children, source, values = [], preserveValues = [], one, count }: { children?: ReactNode; source?: string; values?: ReactNode[]; preserveValues?: boolean[]; one?: string; count?: number }) {
  const { locale } = useLocale();
  if (source !== undefined) {
    const form = one !== undefined && count !== undefined && new Intl.PluralRules(locale).select(count) === 'one' ? one : source;
    const translated = localizeString(locale, form);
    return <>{translated.split(/(\{value\d+\})/g).map((part, index) => {
      const match = /^\{value(\d+)\}$/.exec(part);
      const slot = match ? Number(match[1]) : -1;
      const value = values[slot];
      return <React.Fragment key={index}>{match ? typeof value === 'string' && !preserveValues[slot] ? localizeString(locale, value) : value : part}</React.Fragment>;
    })}</>;
  }
  return <>{React.Children.map(children, child => typeof child === 'string' ? localizeString(locale, child) : child)}</>;
}

/** Only presentation attributes are localised; form values and identifiers are untouched. */
export function LocalizedElement<T extends keyof React.JSX.IntrinsicElements>({ as, ...props }: { as: T } & React.JSX.IntrinsicElements[T]) {
  const { locale } = useLocale();
  const translated = { ...props } as Record<string, unknown>;
  for (const name of ['title', 'alt', 'placeholder', 'aria-label', 'aria-description', 'aria-valuetext']) {
    if (typeof translated[name] === 'string') translated[name] = localizeString(locale, translated[name] as string);
  }
  if (as === 'option' && typeof translated.children === 'string') {
    if (translated.value === undefined) translated.value = translated.children;
    translated.children = localizeString(locale, translated.children);
  }
  return createElement(as, translated);
}
