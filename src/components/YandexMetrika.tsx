import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    ym: (id: number, method: string, ...args: unknown[]) => void;
  }
}

const METRIKA_ID = import.meta.env.VITE_YANDEX_METRIKA_ID;

export const YandexMetrika = () => {
  const location = useLocation();

  useEffect(() => {
    if (!METRIKA_ID || typeof window.ym !== 'function') return;
    
    window.ym(Number(METRIKA_ID), 'hit', location.pathname + location.search);
  }, [location]);

  return null;
};
