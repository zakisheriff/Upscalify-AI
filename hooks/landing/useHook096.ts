'use client';
import { useState, useEffect } from 'react';
export function useHook096() {
  const [value, setValue] = useState(96);
  useEffect(() => { setValue(96); }, []);
  return value;
}
