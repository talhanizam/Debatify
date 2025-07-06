"use client"

import { useState } from "react"
import { supabase } from "../../../lib/supabaseClient"
import { toast } from "react-hot-toast"
import { Mail, Lock, Chrome, Sparkles } from "lucide-react"

export default function AuthModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess?: () => void
}) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAuth = async () => {
    setError("")
    setLoading(true)

    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      toast.error(error.message)
    } else {
      onSuccess?.()
      onClose()
    }
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}/` : "",
      },
    })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success("Redirecting to Google...")
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold mb-3">{isSignUp ? "Join the Future" : "Welcome Back"}</h2>
        <p className="text-gray-600 dark:text-gray-400">
          {isSignUp
            ? "Create your account to save debates and track progress"
            : "Sign in to access your saved debates and continue your journey"}
        </p>
      </div>

      <button
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center space-x-3 glass-card hover:bg-white/10 px-6 py-4 rounded-2xl font-medium transition-all duration-300 mb-6"
      >
        <Chrome className="w-5 h-5 text-red-500" />
        <span>Continue with Google</span>
      </button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600 opacity-30" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
            or continue with email
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full pl-12 pr-4 py-4 glass-card rounded-2xl placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="password"
            placeholder="Enter your password"
            className="w-full pl-12 pr-4 py-4 glass-card rounded-2xl placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={handleAuth}
          disabled={loading || !email.trim() || !password.trim()}
          className="w-full btn-primary px-6 py-4 rounded-2xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
        </button>
      </div>

      <div className="text-center mt-6">
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
        >
          {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  )
}
