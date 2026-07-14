'use client';
import { useState, useEffect } from 'react';
export function useHook125() {
  const [value, setValue] = useState(125);
  useEffect(() => { setValue(125); }, []);
  return value;
}
