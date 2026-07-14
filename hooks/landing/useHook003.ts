'use client';
import { useState, useEffect } from 'react';
export function useHook003() {
  const [value, setValue] = useState(3);
  useEffect(() => { setValue(3); }, []);
  return value;
}
