'use client';
import { useState, useEffect } from 'react';
export function useHook123() {
  const [value, setValue] = useState(123);
  useEffect(() => { setValue(123); }, []);
  return value;
}
