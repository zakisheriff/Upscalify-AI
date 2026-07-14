'use client';
import { useState, useEffect } from 'react';
export function useHook080() {
  const [value, setValue] = useState(80);
  useEffect(() => { setValue(80); }, []);
  return value;
}
