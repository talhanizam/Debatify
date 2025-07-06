"use client"

import { useEffect, useState } from "react"
import { Toaster, toast } from "react-hot-toast"
import { supabase } from "../../../lib/supabaseClient"
import TurnBasedDebate from "./TurnBasedDebate"
import LiveChatDebate from "./LiveChatDebate"
import SavedDebates from "./SavedDebates"
import AuthModal from "./AuthModal"
import { useTheme } from "./ThemeProvider"
import { MessageSquare, Target, LogOut, X, Moon, Sun, ArrowRight } from "lucide-react"

export default function HomeContent() {
  const [mode, setMode] = useState<"chat" | "turn" | null>(null)
  const [user, setUser] = useState<any>(null)
  const [showSaved, setShowSaved] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user || null)
    }

    fetchUser()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error("Logout failed!")
    } else {
      setUser(null)
      setShowSaved(false)
      toast.success("Logged out successfully!")
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 relative overflow-hidden transition-all duration-500">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: theme === "dark" ? "#1f2937" : "#ffffff",
            color: theme === "dark" ? "#f9fafb" : "#1f2937",
            border: "1px solid rgba(139, 92, 246, 0.2)",
            borderRadius: "12px",
          },
        }}
      />

      {/* Navigation Bar */}
      <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
        <div
          className="px-6 py-3 rounded-full shadow-lg transition-all duration-300"
          style={{
            backgroundColor: "var(--nav-bg)",
            color: "var(--nav-text)",
          }}
        >
          <div className="flex items-center justify-between min-w-[600px]">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium">AI Debate</span>
              </div>

              <div className="flex items-center space-x-4">
                <button onClick={() => setMode("chat")} className="text-sm hover:text-purple-300 transition-colors">
                  AI vs AI
                </button>
                <button onClick={() => setMode("turn")} className="text-sm hover:text-purple-300 transition-colors">
                  You vs AI
                </button>
                {user && (
                  <button
                    onClick={() => setShowSaved(true)}
                    className="text-sm hover:text-purple-300 transition-colors"
                  >
                    Saved
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button onClick={toggleTheme} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>

              {user ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-sm hover:text-purple-300 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  Get Started
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Saved Debates Modal */}
      {showSaved && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white dark:bg-gray-800 max-w-5xl w-full max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6 flex items-center justify-between rounded-t-3xl">
              <h2 className="text-2xl font-bold">Saved Debates</h2>
              <button
                onClick={() => setShowSaved(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8">
              <SavedDebates />
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white dark:bg-gray-800 max-w-md w-full p-8 rounded-3xl shadow-2xl">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <AuthModal
              onClose={() => setShowLoginModal(false)}
              onSuccess={() => toast.success("Logged in successfully!")}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {!mode && (
            <>
              {/* Promotional Banner */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center space-x-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">%</span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">Get Pro 15%</span>
                  <span className="text-gray-600 dark:text-gray-400">Join our community and engage in debates</span>
                </div>
              </div>

              {/* Hero Section */}
              <div className="text-center mb-20">
                <h1 className="text-6xl md:text-7xl font-bold text-gray-900 dark:text-gray-100 mb-8 leading-tight max-w-5xl mx-auto">
                  Seamless Debate Discovery with{" "}
                  <span className="text-gray-700 dark:text-gray-300">AI-Powered Intelligence</span>
                </h1>

                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                  Our advanced AI systems contain all the essentials to help you engage in meaningful discourse and
                  sharpen your skills in few sessions
                </p>

                <button className="inline-flex items-center space-x-3 bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white px-8 py-4 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300">
                  <span>Start Debating For Free</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              {/* Floating Phone Mockups */}
              <div className="relative h-96 max-w-6xl mx-auto">
                {/* Left Phone - AI vs AI Chat */}
                <div
                  className="absolute left-0 top-0 phone-mockup p-4 w-80 h-96 float-1 cursor-pointer"
                  onClick={() => setMode("chat")}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium">9:41</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-2 bg-gray-300 rounded-full"></div>
                      <div className="w-6 h-3 bg-gray-300 rounded-sm"></div>
                    </div>
                  </div>

                  <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-3 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">AI vs AI Debate</span>
                      <X className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <div className="bg-blue-500 text-white p-2 rounded-lg text-xs">
                        AI Pro: Climate change requires immediate action...
                      </div>
                      <div className="bg-red-500 text-white p-2 rounded-lg text-xs">
                        AI Con: Economic factors must be considered...
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="inline-flex items-center space-x-2 text-purple-600 dark:text-purple-400 font-medium">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm">Start AI vs AI</span>
                    </div>
                  </div>
                </div>

                {/* Center Phone - General */}
                <div className="absolute left-1/2 top-8 transform -translate-x-1/2 phone-mockup p-4 w-80 h-96 float-2">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium">9:41</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-2 bg-gray-300 rounded-full"></div>
                      <div className="w-6 h-3 bg-gray-300 rounded-sm"></div>
                    </div>
                  </div>

                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="font-semibold mb-2">AI Debate Arena</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Choose your debate format and engage in intelligent discourse
                    </p>
                    <div className="space-y-2">
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2 text-xs">
                        Recent: "Should AI be regulated?"
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2 text-xs">
                        Popular: "Climate change debate"
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Phone - You vs AI */}
                <div
                  className="absolute right-0 top-4 phone-mockup p-4 w-80 h-96 float-3 cursor-pointer"
                  onClick={() => setMode("turn")}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium">9:41</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-2 bg-gray-300 rounded-full"></div>
                      <div className="w-6 h-3 bg-gray-300 rounded-sm"></div>
                    </div>
                  </div>

                  <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-3 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">You vs AI Debate</span>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-green-500 text-white p-2 rounded-lg text-xs ml-8">
                        You: I believe remote work is more productive...
                      </div>
                      <div className="bg-gray-300 dark:bg-gray-600 p-2 rounded-lg text-xs mr-8">
                        AI: While remote work has benefits, studies show...
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="inline-flex items-center space-x-2 text-green-600 dark:text-green-400 font-medium">
                      <Target className="w-4 h-4" />
                      <span className="text-sm">Challenge AI</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Debate Components */}
          {mode === "chat" && (
            <div className="animate-in fade-in slide-in-from-right duration-500">
              <LiveChatDebate onBack={() => setMode(null)} />
            </div>
          )}

          {mode === "turn" && (
            <div className="animate-in fade-in slide-in-from-right duration-500">
              <TurnBasedDebate onBack={() => setMode(null)} />
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
