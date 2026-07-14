'use client';
import { useState, useEffect } from 'react';
export function useHook002() {
  const [value, setValue] = useState(2);
  useEffect(() => { setValue(2); }, []);
  return value;
}
