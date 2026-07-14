'use client';
import { useState, useEffect } from 'react';
export function useHook005() {
  const [value, setValue] = useState(5);
  useEffect(() => { setValue(5); }, []);
  return value;
}
