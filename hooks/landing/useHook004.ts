'use client';
import { useState, useEffect } from 'react';
export function useHook004() {
  const [value, setValue] = useState(4);
  useEffect(() => { setValue(4); }, []);
  return value;
}
