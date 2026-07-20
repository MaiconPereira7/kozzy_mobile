import { useCallback, useEffect, useRef, useState } from 'react';
import { getAIServerUrl } from '../services/api';

type Status = 'checking' | 'online' | 'offline';

export const useServerStatus = (intervalMs = 30_000) => {
  const [status, setStatus] = useState<Status>('checking');
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const check = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5_000);
      const res = await fetch(`${getAIServerUrl()}/health`, { signal: controller.signal });
      clearTimeout(timeout);
      setStatus(res.ok ? 'online' : 'offline');
    } catch {
      setStatus('offline');
    }
  }, []);

  useEffect(() => {
    check();
    timer.current = setInterval(check, intervalMs);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [check, intervalMs]);

  return { status, recheck: check };
};
