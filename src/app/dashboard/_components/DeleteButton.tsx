'use client'

import { useState, useTransition } from 'react'
import { deleteBookmark } from '../actions'

export function DeleteButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false)
  const [pending, startTransition] = useTransition()

  if (pending) {
    return <span className="text-xs text-gray-400">삭제 중…</span>
  }

  if (confirming) {
    return (
      <span className="flex items-center gap-2">
        <span className="text-xs text-gray-500">삭제할까요?</span>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs font-medium text-gray-400 hover:text-gray-600 transition"
        >
          취소
        </button>
        <button
          onClick={() => startTransition(() => deleteBookmark(id))}
          className="text-xs font-medium text-red-500 hover:text-red-700 transition"
        >
          확인
        </button>
      </span>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-xs font-medium text-red-500 hover:text-red-700 transition"
    >
      삭제
    </button>
  )
}
