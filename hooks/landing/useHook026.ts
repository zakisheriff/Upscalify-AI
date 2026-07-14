'use client';
import { useState, useEffect } from 'react';
export function useHook026() {
  const [value, setValue] = useState(26);
  useEffect(() => { setValue(26); }, []);
  return value;
}
