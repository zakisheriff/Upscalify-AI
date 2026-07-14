'use client';
import { useState, useEffect } from 'react';
export function useHook008() {
  const [value, setValue] = useState(8);
  useEffect(() => { setValue(8); }, []);
  return value;
}
