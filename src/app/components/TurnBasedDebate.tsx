"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { supabase } from "../../../lib/supabaseClient"
import { ArrowLeft, Send, RotateCcw, Save, Shuffle, Target,Search } from "lucide-react"
import { toast } from "react-hot-toast"

export default function TurnBasedDebate({ onBack }: { onBack: () => void }) {
  const [side, setSide] = useState<"pro" | "con" | null>(null)
  const [messages, setMessages] = useState<string[]>([])
  const [input, setInput] = useState("")
  const [topic, setTopic] = useState("")
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [analysis, setAnalysis] = useState<{
    fallacies?: string[]
    counterpoints?: string
    strength?: number
    improvement?: string
  } | null>(null)
  const [showModal, setShowModal] = useState(false)

  const randomTopics = [
    "Should AI be regulated?",
    "Is social media harmful to mental health?",
    "Should college be free for everyone?",
    "Is remote work better than office work?",
    "Should voting be mandatory?",
    "Should zoos be banned?",
    "Is capitalism the best economic system?",
    "Can money buy happiness?",
    "Should homework be abolished?",
    "Is space exploration worth the cost?",
  ]

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

  const sendTurn = async () => {
    if (!input.trim()) return
    setLoading(true)
    setAnalysis(null)

    const history = messages.map((m) => m.replace(/^🧑 You: |^🤖 AI.*?: /, ""))

    try {
      const res = await fetch("/api/turn", {
        method: "POST",
        body: JSON.stringify({ input, topic, side, history }),
      })
      const data = await res.json()
      const aiSide = side === "pro" ? "Con" : "Pro"

      setMessages((prev) => [...prev, `🧑 You: ${input}`, `🤖 AI (${aiSide}): ${data.reply}`])
      setInput("")
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
    }
    setLoading(false)
  }
  const analyzeLastUserArgument = async () => {
  const lastUserArgument = [...messages].reverse().find((m) => m.startsWith("🧑 You:"));
  if (!lastUserArgument) return;

  const argument = lastUserArgument.replace(/^🧑 You: /, "");
  try {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ argument, topic, side }),
    });
    const data = await res.json();
    setAnalysis(data.analysis);
  } catch (error) {
    toast.error("Error analyzing your argument.");
  }
};


  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !loading && input.trim()) {
      e.preventDefault()
      sendTurn()
    }
  }

  const saveDebate = async () => {
    if (!user) return

    const { error } = await supabase.from("debates").insert({
      user_id: user.id,
      topic,
      mode: "turn",
      pro:
        side === "pro"
          ? messages.filter((m) => m.includes("🧑")).join("\n")
          : messages.filter((m) => m.includes("🤖")).join("\n"),
      con:
        side === "con"
          ? messages.filter((m) => m.includes("🧑")).join("\n")
          : messages.filter((m) => m.includes("🤖")).join("\n"),
    })

    if (!error) {
      setSaved(true)
      toast.success("Debate saved successfully! 🎉")
    } else {
      toast.error("Failed to save debate")
    }
  }

  const restartDebate = () => {
    setSide(null)
    setMessages([])
    setInput("")
    setTopic("")
    setSaved(false)
    setAnalysis(null)
    setShowModal(false)
  }

  const setRandomTopic = () => {
    const random = randomTopics[Math.floor(Math.random() * randomTopics.length)]
    setTopic(random)
  }

  if (!side) {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>

        <div className="glass-card rounded-3xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold mb-4">You vs AI Debate</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Choose your position and engage in structured debate
            </p>
          </div>

          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <input
                type="text"
                placeholder="Enter your debate topic..."
                className="flex-1 px-6 py-4 glass-card rounded-2xl placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg transition-all duration-300"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <button
                onClick={setRandomTopic}
                className="p-4 glass-card hover:bg-white/10 rounded-2xl transition-colors"
                title="Random topic"
              >
                <Shuffle className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button
              onClick={() => setSide("pro")}
              disabled={!topic.trim()}
              className="flex-1 max-w-xs btn-primary px-8 py-6 rounded-2xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-2xl mb-2">🟢</div>
              <div>Argue FOR</div>
              <div className="text-sm opacity-90">Pro Position</div>
            </button>

            <button
              onClick={() => setSide("con")}
              disabled={!topic.trim()}
              className="flex-1 max-w-xs bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-8 py-6 rounded-2xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105"
            >
              <div className="text-2xl mb-2">🔴</div>
              <div>Argue AGAINST</div>
              <div className="text-sm opacity-90">Con Position</div>
            </button>
          </div>
        </div>
      </div>
    )
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Debating as: {side === "pro" ? "🟢 Pro" : "🔴 Con"}</h2>
            <p className="text-gray-600 dark:text-gray-400">Topic: {topic}</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="p-3 bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-800/30 text-red-700 dark:text-red-400 rounded-xl transition-colors"
            title="Restart debate"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        <div className="glass-card rounded-2xl p-6 h-80 overflow-y-auto space-y-4 mb-6">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">
              <p>Start the debate by making your first argument...</p>
            </div>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl ${
                  m.startsWith("🧑 You:")
                    ? "glass-card border-l-4 border-purple-500 ml-8"
                    : "glass-card border-l-4 border-gray-400 mr-8"
                }`}
              >
                <p>{m}</p>
              </div>
            ))
          )}
        </div>

        <div className="space-y-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your argument here... (Press Enter to send, Shift+Enter for new line)"
            className="w-full px-6 py-4 glass-card rounded-2xl placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all duration-300"
            rows={3}
          />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={sendTurn}
                disabled={loading || !input.trim()}
                className="btn-primary px-6 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? "AI is responding..." : "Send Argument"}</span>
              </button>

              {messages.length > 1 && !saved && user && (
                <button
                  onClick={saveDebate}
                  className="btn-secondary px-6 py-3 rounded-xl font-semibold transition-all duration-300 inline-flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Debate</span>
                </button>
              )}
              {messages.some((m) => m.startsWith("🧑 You:")) && (
  <button
    onClick={analyzeLastUserArgument}
    className="btn-secondary px-6 py-3 rounded-xl inline-flex items-center space-x-2"
  >
    <Search className="w-4 h-4" />
    <span>Analyze Argument</span>
  </button>
)}

            </div>
              
  {messages.length > 1 && !saved && !user && (
    <p className="text-gray-600 dark:text-gray-400 text-sm">
      Sign in to save your debate
    </p>
  )}
</div>

{analysis && (
  <div className="glass-card mt-6 p-6 rounded-xl space-y-2 text-sm">
    <div><strong>🧠 Logical Fallacies:</strong> {analysis.fallacies?.join(", ") || "None found."}</div>
    <div><strong>⚖️ Missing Counterpoints:</strong> {analysis.counterpoints}</div>
    <div><strong>📊 Strength Rating:</strong> {analysis.strength}/10</div>
    <div><strong>🔧 Improvements:</strong> {analysis.improvement}</div>
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

      {/* Restart Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card max-w-md w-full p-6 rounded-2xl mx-4">
            <h3 className="text-xl font-bold mb-4">Restart Debate?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to restart this debate? All progress will be lost.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 btn-secondary px-4 py-2 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={restartDebate}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium transition-colors"
              >
                Restart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
