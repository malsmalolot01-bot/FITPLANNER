import { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'

declare global {
  interface Window {
    plugins?: {
      pedometer?: {
        isStepCountingAvailable: (success: (available: boolean) => void, error: (err: any) => void) => void
        startPedometerUpdates: (success: (data: { numberOfSteps: number }) => void, error: (err: any) => void) => void
        stopPedometerUpdates: (success?: () => void, error?: (err: any) => void) => void
      }
    }
  }
}

interface StepData {
  steps: number
  isAvailable: boolean
  isTracking: boolean
  error: string | null
}

export function useStepCounter() {
  const [data, setData] = useState<StepData>({
    steps: 0,
    isAvailable: false,
    isTracking: false,
    error: null
  })

  useEffect(() => {
    if (Capacitor.getPlatform() === 'web') {
      setData((prev) => ({ ...prev, isAvailable: false, error: 'Web platform - step counter unavailable' }))
      return
    }

    const pedometer = window.plugins?.pedometer

    if (!pedometer) {
      setData((prev) => ({ ...prev, error: 'Pedometer plugin not found' }))
      return
    }

    pedometer.isStepCountingAvailable(
      (available) => {
        setData((prev) => ({ ...prev, isAvailable: available }))
        if (!available) return

        setData((prev) => ({ ...prev, isTracking: true }))

        pedometer.startPedometerUpdates(
          (result) => {
            setData((prev) => ({ ...prev, steps: result.numberOfSteps ?? 0 }))
          },
          (err) => {
            setData((prev) => ({ ...prev, error: String(err), isTracking: false }))
          }
        )
      },
      (err) => {
        setData((prev) => ({ ...prev, error: String(err) }))
      }
    )

    return () => {
      pedometer.stopPedometerUpdates()
    }
  }, [])

  return data
}