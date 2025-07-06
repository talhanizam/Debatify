"use client"

import { useState, useEffect } from "react"
import { supabase } from "../../../lib/supabaseClient"
import { ArrowLeft, Play, Save, Sparkles } from "lucide-react"
import { toast } from "react-hot-toast"

export default function LiveChatDebate({ onBack }: { onBack: () => void }) {
  const [topic, setTopic] = useState("")
  const [proChat, setProChat] = useState<string[]>([])
  const [conChat, setConChat] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user || null)
    }
    getSession()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const startDebate = async () => {
    setLoading(true)
    setSaved(false)
    setProChat([])
    setConChat([])

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ topic }),
      })
      const data = await res.json()
      const { pro, con } = data

      if (!pro || !con) {
        toast.error("Failed to generate debate. Please try again.")
        setLoading(false)
        return
      }

      setProChat([pro])
      setConChat([con])
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
    }
    setLoading(false)
  }

  const saveDebate = async () => {
    if (!user) return

    const { error } = await supabase.from("debates").insert({
      user_id: user.id,
      topic,
      mode: "chat",
      pro: proChat[0],
      con: conChat[0],
    })

    if (!error) {
      setSaved(true)
      toast.success("Debate saved successfully! 🎉")
    } else {
      toast.error("Failed to save debate.")
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <button
        onClick={onBack}
        className="inline-flex items-center space-x-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Home</span>
      </button>

      <div className="glass-card rounded-3xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold mb-4">AI vs AI Live Debate</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Watch two AI entities engage in intelligent discourse
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Enter your debate topic..."
              className="w-full px-6 py-4 glass-card rounded-2xl placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg transition-all duration-300"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <Sparkles className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
          </div>
        </div>

        {proChat.length > 0 && conChat.length > 0 && (
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="glass-card rounded-2xl p-6 border-l-4 border-green-500">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">P</span>
                </div>
                <h3 className="text-xl font-bold text-green-600 dark:text-green-400">Pro Position</h3>
              </div>
              <div className="glass-card rounded-xl p-4">
                <p className="leading-relaxed">{proChat[0]}</p>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 border-l-4 border-red-500">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">C</span>
                </div>
                <h3 className="text-xl font-bold text-red-600 dark:text-red-400">Con Position</h3>
              </div>
              <div className="glass-card rounded-xl p-4">
                <p className="leading-relaxed">{conChat[0]}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <button
            onClick={startDebate}
            disabled={loading || !topic.trim()}
            className="btn-primary px-8 py-4 rounded-2xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center space-x-3"
          >
            <Play className="w-5 h-5" />
            <span>{loading ? "AI is thinking..." : "Start Debate"}</span>
          </button>

          {proChat.length > 0 && conChat.length > 0 && !saved && user && (
            <button
              onClick={saveDebate}
              className="btn-secondary px-8 py-4 rounded-2xl font-semibold transition-all duration-300 inline-flex items-center space-x-3"
            >
              <Save className="w-5 h-5" />
              <span>Save Debate</span>
            </button>
          )}

          {proChat.length > 0 && conChat.length > 0 && !saved && !user && (
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Sign in to save your debates</p>
            </div>
          )}
        </div>

        {saved && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center space-x-2 glass-card text-green-600 dark:text-green-400 px-4 py-2 rounded-full">
              <span>✅ Debate saved to your account!</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
