"use client"

import { useEffect, useState } from "react"
import { Toaster, toast } from "react-hot-toast"
import { supabase } from "../../lib/supabaseClient"
import TurnBasedDebate from "./components/TurnBasedDebate"
import LiveChatDebate from "./components/LiveChatDebate"
import SavedDebates from "./components/SavedDebates"
import AuthModal from "./components/AuthModal"
import { useTheme } from "./components/ThemeProvider"
import axios from "axios"
import { MessageSquare, Target, LogOut, X, Moon, Sun, Sparkles, Users, Brain, Lightbulb, TrendingUp, Github, Linkedin, Instagram, Coffee } from 'lucide-react'

export default function Home() {
const [mode, setMode] = useState<"chat" | "turn" | null>(null)
const [user, setUser] = useState<any>(null)
const [showSaved, setShowSaved] = useState(false)
const [showLoginModal, setShowLoginModal] = useState(false)
const [mounted, setMounted] = useState(false)
const [isScrolled, setIsScrolled] = useState(false)
const [footerMessage, setFooterMessage] = useState('');

const handleSendMessage = async () => {
  if (!footerMessage.trim()) return;

  try {
    const res = await fetch('/api/sendEmail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: footerMessage }),
    });

    const result = await res.json();

    if (result.success) {
      toast.success('Message sent successfully!');
      setFooterMessage('');
    } else {
      toast.error('Failed to send message.');
    }
  } catch (err) {
    toast.error('An error occurred.');
  }
};


  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsScrolled(scrollPosition > 100)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-purple-500 rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background Grid and Abstract Lines */}
      <div className="grid-background"></div>
      <div className="abstract-lines"></div>

      {/* Curved flowing elements */}
      <div className="curved-flow-1"></div>
      <div className="curved-flow-2"></div>
      <div className="curved-flow-3"></div>
      <div className="curved-flow-4"></div>
      <div className="curved-flow-5"></div>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: theme === "dark" ? "rgba(20, 20, 20, 0.9)" : "rgba(255, 255, 255, 0.9)",
            color: theme === "dark" ? "#ffffff" : "#1a1a1a",
            border: "1px solid rgba(139, 92, 246, 0.2)",
            borderRadius: "16px",
            backdropFilter: "blur(20px)",
            fontFamily: "Inter, system-ui, sans-serif",
          },
        }}
      />

      {/* Floating Navigation */}
      <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
<div className={`glass-nav soft-glow rounded-full px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 relative ${isScrolled ? "compact" : ""}`}>
          <div className="flex items-center justify-between transition-all duration-300">
            {/* Logo - Always visible */}
            <div className="flex items-center gap-1 md:gap-4 transition-all duration-300 text-[10px] sm:text-xs md:text-sm">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-white">Debatify</span>
            </div>

            {/* Navigation Links - Hidden when scrolled */}
<div
  className={`flex items-center gap-1 md:gap-4 transition-all duration-300 text-[10px] sm:text-xs md:text-sm ${
    isScrolled ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
  }`}
>
  <button
    onClick={() => setMode("chat")}
    className="text-white/90 hover:text-white transition-colors px-1.5 py-1 md:px-3 md:py-1.5 rounded-full hover:bg-white/10 font-medium whitespace-nowrap"

  >
    AI vs AI
  </button>
  <button
    onClick={() => setMode("turn")}
    className="text-white/90 hover:text-white transition-colors px-1.5 py-1 md:px-3 md:py-1.5 rounded-full hover:bg-white/10 font-medium whitespace-nowrap"
  >
    You vs AI
  </button>
  {user && (
    <button
      onClick={() => setShowSaved(true)}
      className="text-white/90 hover:text-white transition-colors px-1.5 py-1 md:px-3 md:py-1.5 rounded-full hover:bg-white/10 font-medium whitespace-nowrap"
    >
      Saved
    </button>
  )}
</div>


            {/* Right side controls - Always visible */}
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleTheme}
                className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300"
              >
                {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>

              {user ? (
                <button
                  onClick={handleLogout}
                  className={`flex items-center space-x-2 text-sm text-white/90 hover:text-white transition-all duration-300 px-3 py-1.5 rounded-full hover:bg-white/10 font-medium ${
                    isScrolled ? "" : ""
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                  <span className={`transition-all duration-300 ${isScrolled ? "max-md:hidden" : ""}`}>Logout</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="text-white/90 hover:text-white transition-colors px-1.5 py-1 md:px-3 md:py-1.5 rounded-full hover:bg-white/10 font-medium whitespace-nowrap"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Saved Debates Modal */}
      {showSaved && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-3d max-w-5xl w-full max-h-[90vh] overflow-y-auto rounded-3xl">
            <div className="sticky top-0 card-3d border-b border-white/10 px-8 py-6 flex items-center justify-between rounded-t-3xl">
              <h2 className="text-2xl font-bold text-primary">Saved Debates</h2>
              <button
                onClick={() => setShowSaved(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-primary" />
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
          <div className="bg-white dark:bg-zinc-900 text-black dark:text-white shadow-xl border border-zinc-200 dark:border-white/10 max-w-md w-full p-8 rounded-3xl backdrop-blur-md">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-primary" />
            </button>
            <AuthModal onClose={() => setShowLoginModal(false)} onSuccess={() => toast.success("Welcome aboard! 🚀")} />
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <div className="min-h-screen flex items-center justify-center p-4 pt-32 pb-20">
        <div className="main-container w-full">
          {!mode && (
            <>
              {/* Hero Section with Abstract Lines */}
<div className="text-center mb-20 px-4 sm:px-6 animate-fade-in-up hero-abstract-lines relative">
<h1 className="hero-title mb-8 relative z-10">
  Welcome to <span className="text-secondary">Debatify</span>: Your AI-Powered Debate Partner
</h1>

                <p className="hero-subtitle max-w-4xl mx-auto mb-16 animate-fade-in-up animate-delay-100 relative z-10">
                  Our advanced AI systems contain all the essentials to help you engage in meaningful discourse and
                  sharpen your skills in few sessions
                </p>
              </div>

              {/* Simple Debate Mode Cards */}
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-24 animate-fade-in-up animate-delay-200 relative z-10">
                {/* AI vs AI Card */}
                <div
                  className="card-3d rounded-3xl p-8 cursor-pointer group animate-float"
                  onClick={() => setMode("chat")}
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg mx-auto">
                    <MessageSquare className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-center text-primary">AI vs AI Debate</h3>
                </div>

                {/* You vs AI Card */}
                <div
                  className="card-3d rounded-3xl p-8 cursor-pointer group animate-float"
                  onClick={() => setMode("turn")}
                  style={{ animationDelay: "1s" }}
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg mx-auto">
                    <Target className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-center text-primary">You vs AI Debate</h3>
                </div>
              </div>

              {/* Features Section */}
              <div className="animate-fade-in-up animate-delay-300 relative z-10">
                {/* Features Tag */}
                <div className="flex items-center justify-center mb-12">
                  <div className="feature-tag rounded-full px-6 py-3 flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span className="font-semibold text-primary">Features</span>
                  </div>
                </div>

                {/* Main Features Container */}
                <div className="feature-container-3d rounded-[2rem] p-4 sm:p-6 md:p-12 relative overflow-hidden w-full max-w-none">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-40 h-40 bg-pink-500 rounded-full blur-3xl"></div>
                  </div>

                  <div className="relative z-10">
                    <div className="text-center mb-16">
                      <h2 className="text-5xl font-bold mb-6 text-primary">
                        Intelligent Debate Platform with{" "}
                        <span className="text-purple-600 dark:text-purple-400">Advanced AI</span>
                      </h2>
                      <p className="text-xl text-secondary max-w-3xl mx-auto">
                        From real-time AI conversations to personalized debate coaching, experience the future of
                        intellectual discourse with our cutting-edge technology.
                      </p>
                    </div>

                    {/* Feature Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 w-full px-2 sm:px-6 md:px-0">
                      {/* AI vs AI Feature */}
                      <div className="card-3d w-full rounded-2xl p-4 sm:p-6 md:p-8 bg-gradient-to-br from-blue-50/20 to-cyan-50/20 dark:from-blue-900/10 dark:to-cyan-900/10">
                        <div className="flex items-center space-x-4 mb-6">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="text-2xl font-bold text-primary">AI vs AI Debates</h3>
                        </div>
                        <p className="text-secondary text-lg leading-relaxed mb-6">
                          Watch two advanced AI systems engage in sophisticated debates on any topic. Perfect for
                          understanding multiple perspectives and learning advanced argumentation techniques.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span className="feature-tag rounded-full px-3 py-1 text-sm font-medium">
                            Real-time Analysis
                          </span>
                          <span className="feature-tag rounded-full px-3 py-1 text-sm font-medium">
                            Multiple Perspectives
                          </span>
                          <span className="feature-tag rounded-full px-3 py-1 text-sm font-medium">Learning Mode</span>
                        </div>
                      </div>

                      {/* You vs AI Feature */}
                      <div className="card-3d w-full rounded-2xl p-4 sm:p-6 md:p-8 bg-gradient-to-br from-green-50/20 to-emerald-50/20 dark:from-green-900/10 dark:to-emerald-900/10">
                        <div className="flex items-center space-x-4 mb-6">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                            <Brain className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="text-2xl font-bold text-primary">Personal AI Coach</h3>
                        </div>
                        <p className="text-secondary text-lg leading-relaxed mb-6">
                          Challenge yourself in structured debates against our most advanced AI. Receive personalized
                          feedback, improve your argumentation skills, and track your progress over time.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span className="feature-tag rounded-full px-3 py-1 text-sm font-medium">
                            Personal Coaching
                          </span>
                          <span className="feature-tag rounded-full px-3 py-1 text-sm font-medium">Skill Tracking</span>
                          <span className="feature-tag rounded-full px-3 py-1 text-sm font-medium">Custom Topics</span>
                        </div>
                      </div>

                      {/* Additional Features */}
                      <div className="card-3d w-full rounded-2xl p-4 sm:p-6 md:p-8 bg-gradient-to-br from-purple-50/20 to-pink-50/20 dark:from-purple-900/10 dark:to-pink-900/10">
                        <div className="flex items-center space-x-4 mb-6">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                            <Lightbulb className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="text-2xl font-bold text-primary">Smart Insights</h3>
                        </div>
                        <p className="text-secondary text-lg leading-relaxed mb-6">
                          Get intelligent analysis of your debate performance, identify logical fallacies, and receive
                          suggestions for stronger arguments and better rhetorical techniques.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span className="feature-tag rounded-full px-3 py-1 text-sm font-medium">
                            Fallacy Detection
                          </span>
                          <span className="feature-tag rounded-full px-3 py-1 text-sm font-medium">
                            Argument Analysis
                          </span>
                        </div>
                      </div>

                      <div className="card-3d w-full rounded-2xl p-4 sm:p-6 md:p-8 bg-gradient-to-br from-orange-50/20 to-red-50/20 dark:from-orange-900/10 dark:to-red-900/10">
                        <div className="flex items-center space-x-4 mb-6">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="text-2xl font-bold text-primary">Progress Tracking</h3>
                        </div>
                        <p className="text-secondary text-lg leading-relaxed mb-6">
                          Monitor your debate skills improvement over time with detailed analytics, save your best
                          debates, and build a portfolio of your intellectual growth and achievements.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span className="feature-tag rounded-full px-3 py-1 text-sm font-medium">
                            Performance Metrics
                          </span>
                          <span className="feature-tag rounded-full px-3 py-1 text-sm font-medium">Debate History</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Debate Components */}
          {mode === "chat" && (
            <div className="animate-fade-in-up">
              <LiveChatDebate onBack={() => setMode(null)} />
            </div>
          )}

          {mode === "turn" && (
            <div className="animate-fade-in-up">
              <TurnBasedDebate onBack={() => setMode(null)} />
            </div>
          )}
        </div>
      </div>

      {/* Floating Badge */}
<a
  href="https://talhanizam.netlify.app/"
  target="_blank"
  rel="noopener noreferrer"
  className="floating-badge"
>
  Made By Talha
</a>

      {/* Footer */}
<footer className="footer-glassmorphism">
  <div className="footer-content">
    <div className="footer-left-content">
      <div className="planet-icon">
        <div className="planet-core"></div>
      </div>
      <div className="footer-text-content">
        <h3>We’d Love Your Feedback</h3>
        <p>Send suggestions, improvements, or just say hello. Your thoughts help shape Debatify!</p>
      </div>
    </div>

    <div className="footer-input-group">
      <input
        type="text"
        placeholder="Send a message to the creator..."
        className="footer-input"
        value={footerMessage}
        onChange={(e) => setFooterMessage(e.target.value)}
      />
      <button className="footer-send-btn" onClick={handleSendMessage}>
        Send
        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </button>
    </div>

    <div className="footer-right-content">
      <div>
        <h4 className="footer-section-heading">Sections</h4>
        <div className="space-y-1">
          <a href="#features" className="footer-link">Features</a>
          <button onClick={() => setMode("chat")} className="footer-link text-left w-full">AI vs AI Debates</button>
          <button onClick={() => setMode("turn")} className="footer-link text-left w-full">Personal AI Coach</button>
          <a href="#features" className="footer-link">Smart Insights</a>
        </div>
      </div>

<div>
  <h4 className="footer-section-heading">Social</h4>
<div className="space-y-2">
  <a href="https://instagram.com/tlhnizam" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-white">
    <Instagram className="w-5 h-5" />
    <span>Instagram</span>
  </a>
  <a href="https://github.com/talhanizam" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-white">
    <Github className="w-5 h-5" />
    <span>GitHub</span>
  </a>
  <a href="https://www.linkedin.com/in/talha-nizam/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-white">
    <Linkedin className="w-5 h-5" />
    <span>LinkedIn</span>
  </a>
  <a href="https://coff.ee/talhanizam" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-white">
    <Coffee className="w-5 h-5" />
    <span>Buy Me A Coffee</span>
  </a>
</div>

</div>



      <div>
        <h4 className="footer-section-heading">Pages</h4>
        <div className="space-y-1">
          <button onClick={() => setMode("chat")} className="footer-link text-left w-full">AI vs AI</button>
          <button onClick={() => setMode("turn")} className="footer-link text-left w-full">You vs AI</button>
          {user && (
            <button onClick={() => setShowSaved(true)} className="footer-link text-left w-full">Saved Debates</button>
          )}
          <a href="#features" className="footer-link">Features</a>
        </div>
      </div>
    </div>
  </div>
</footer>

    </main>
  )
}
