import { Suspense } from 'react'
import WaitingRoom from '@/components/WaitingRoom'

export default function WaitingPage() {
  return (
    <Suspense>
      <WaitingRoom />
    </Suspense>
  )
}
