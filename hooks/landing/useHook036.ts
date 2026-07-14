'use client';
import { useState, useEffect } from 'react';
export function useHook036() {
  const [value, setValue] = useState(36);
  useEffect(() => { setValue(36); }, []);
  return value;
}
