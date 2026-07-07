"use client";

export function useLanguage() {
  return {
    t: (value: string) => value,
    language: "ru",
  };
}
