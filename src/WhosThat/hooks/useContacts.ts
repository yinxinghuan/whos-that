import { useCallback, useEffect, useState } from 'react';
import { callAigramAPI, isInAigram, telegramId, type AigramResponse } from '@shared/runtime';
import { DEMO_CONTACTS } from '../data';
import type { Contact } from '../types';

interface RawContact { telegram_id?: number | string; user_id?: number | string; name?: string; user_name?: string; head_url?: string; }

function unwrapRows(value: unknown): RawContact[] {
  if (Array.isArray(value)) return value as RawContact[];
  if (value && typeof value === 'object') {
    const envelope = value as Record<string, unknown>;
    for (const key of ['list', 'records', 'items', 'contacts']) {
      if (Array.isArray(envelope[key])) return envelope[key] as RawContact[];
    }
  }
  return [];
}

export function useContacts() {
  const forceDemo = new URLSearchParams(location.search).get('demo') === '1';
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isDemo, setIsDemo] = useState(forceDemo || !isInAigram);
  const [reloadKey, setReloadKey] = useState(0);

  const retry = useCallback(() => setReloadKey((key) => key + 1), []);
  const useDemo = useCallback(() => { setContacts(DEMO_CONTACTS); setIsDemo(true); setError(false); setLoading(false); }, []);

  useEffect(() => {
    if (forceDemo || !isInAigram || !telegramId) { useDemo(); return; }
    let cancelled = false;
    setLoading(true); setError(false);
    callAigramAPI<AigramResponse<unknown>>(`/note/telegram/user/contact/list?telegram_id=${encodeURIComponent(telegramId)}`, 'GET')
      .then((response) => {
        if (cancelled) return;
        const seen = new Set<string>();
        const parsed = unwrapRows(response?.data).flatMap((row): Contact[] => {
          const id = String(row.telegram_id ?? row.user_id ?? '');
          const name = String(row.name ?? row.user_name ?? '').trim();
          const avatarUrl = String(row.head_url ?? '').trim();
          if (!id || id === String(telegramId) || !name || !avatarUrl || seen.has(id)) return [];
          seen.add(id);
          return [{ id, name, avatarUrl }];
        });
        setContacts(parsed); setIsDemo(false);
      })
      .catch(() => { if (!cancelled) { setContacts([]); setError(true); setIsDemo(false); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [forceDemo, reloadKey, useDemo]);

  return { contacts, loading, error, isDemo, retry, useDemo };
}
