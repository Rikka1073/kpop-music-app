"use client"

import { useState, useEffect } from "react"

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // 初期値を設定するための関数を使用
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue
    }

    try {
      // ローカルストレージから値を取得
      const item = window.localStorage.getItem(key)
      // 値が存在すればパースして返し、なければ初期値を返す
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(error)
      return initialValue
    }
  })

  // 値が変更されたときにローカルストレージを更新
  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    try {
      // ローカルストレージに値を保存
      window.localStorage.setItem(key, JSON.stringify(storedValue))
    } catch (error) {
      console.error(error)
    }
  }, [key, storedValue])

  return [storedValue, setStoredValue]
}
