'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { sb } from '@/lib/supabase-client'

export default function HomePage() {
  const router = useRouter()
  const sp = useSearchParams()
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      const code = sp.get('code') || sp.get('access_token')
      if (!code) return
      setMsg('로그인 처리 중...')

      const supabase = sb()
      // 홈에 ?code=... 로 떨어진 경우에도 세션 교환
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href)
      if (error) {
        setMsg('로그인 오류: ' + error.message)
        return
      }
      // 선택: 프로필 upsert
      fetch('/api/bootstrap', { method: 'POST' }).catch(() => {})
      router.replace('/people')
    }
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-4 text-center py-20">
      <h1 className="text-2xl font-bold">관계OS MVP</h1>
      <p className="text-sm text-gray-600">
        설치/연결 완료! 이제 <code>/people</code>/<code>/interactions</code> 페이지를 붙여가면 됩니다.
      </p>
      <p>
        <a className="underline" href="/people">People 열기</a>
      </p>
      {msg && <p className="text-sm">{msg}</p>}
    </div>
  )
}
