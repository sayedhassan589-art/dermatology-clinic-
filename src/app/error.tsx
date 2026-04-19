'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl p-8 max-w-md w-full text-center shadow-xl border border-border">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
            <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">حدث خطأ</h2>
        <p className="text-sm text-muted-foreground mb-4">
          {error.message || 'حدث خطأ غير متوقع في تحميل الصفحة'}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
          >
            إعادة المحاولة
          </button>
          <button
            onClick={() => { localStorage.clear(); window.location.reload() }}
            className="px-4 py-2 rounded-lg border border-border hover:bg-muted text-sm font-medium transition-colors"
          >
            مسح البيانات وإعادة التحميل
          </button>
        </div>
      </div>
    </div>
  )
}
