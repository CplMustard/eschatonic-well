import { useState, useEffect} from "react";

export const getLocalStorageValue = (key, defaultValue) => {
  // getting stored value
  const saved = localStorage.getItem(key);
  const initial = JSON.parse(saved);
  return initial || defaultValue;
}

export const useLocalStorage = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    return getLocalStorageValue(key, defaultValue);
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};

export const getSessionStorageValue = (key, defaultValue) => {
  // getting stored value
  const saved = sessionStorage.getItem(key);
  const initial = JSON.parse(saved);
  return initial || defaultValue;
}

export const useSessionStorage = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    return getSessionStorageValue(key, defaultValue);
  });

  useEffect(() => {
    sessionStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};