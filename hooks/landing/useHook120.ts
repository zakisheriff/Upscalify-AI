'use client';
import { useState, useEffect } from 'react';
export function useHook120() {
  const [value, setValue] = useState(120);
  useEffect(() => { setValue(120); }, []);
  return value;
}
