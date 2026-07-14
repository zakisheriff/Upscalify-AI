'use client';
import { useState, useEffect } from 'react';
export function useHook025() {
  const [value, setValue] = useState(25);
  useEffect(() => { setValue(25); }, []);
  return value;
}
