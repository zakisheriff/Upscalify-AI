'use client';
import { useState, useEffect } from 'react';
export function useHook001() {
  const [value, setValue] = useState(1);
  useEffect(() => { setValue(1); }, []);
  return value;
}
