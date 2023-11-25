import { useState, useEffect} from "react";

export const getStorageValue = (key, defaultValue, store) => {
  // getting stored value
  const saved = store.getItem(key);
  const initial = JSON.parse(saved);
  return initial || defaultValue;
}

export const useStorage = (key, defaultValue, store) => {
  const [value, setValue] = useState(() => {
    return getStorageValue(key, defaultValue, store);
  });

  useEffect(() => {
    store.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};