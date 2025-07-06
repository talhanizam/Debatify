"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../../lib/supabaseClient"
import { Trash2, Calendar, MessageSquare, Target } from "lucide-react"
import { toast } from "react-hot-toast"

export default function SavedDebates() {
  const [savedDebates, setSavedDebates] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [debateToDelete, setDebateToDelete] = useState<string | null>(null)

  useEffect(() => {
    const fetchDebates = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        setUser(null)
        setSavedDebates([])
        setLoading(false)
        return
      }

      setUser(session.user)
      const { data, error } = await supabase
        .from("debates")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })

      if (!error) {
        setSavedDebates(data)
      }
      setLoading(false)
    }

    fetchDebates()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        fetchDebates()
      } else {
        setUser(null)
        setSavedDebates([])
      }
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const confirmDelete = async () => {
    if (!debateToDelete) return

    const { error } = await supabase.from("debates").delete().eq("id", debateToDelete)

    if (!error) {
      setSavedDebates((prev) => prev.filter((debate) => debate.id !== debateToDelete))
      toast.success("Debate deleted successfully")
    } else {
      toast.error("Failed to delete debate")
    }
    setDebateToDelete(null)
  }

  if (!user || loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Loading your saved debates...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Your Saved Debates</h2>
        <p className="text-gray-600 dark:text-gray-400">Review and manage your debate history</p>
      </div>

      {savedDebates.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">No saved debates yet</p>
          <p className="text-gray-500 text-sm">Start a debate and save it to see it here</p>
        </div>
      ) : (
        <div className="space-y-6">
          {savedDebates.map((debate) => (
            <div
              key={debate.id}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                    {debate.mode === "chat" ? (
                      <MessageSquare className="w-5 h-5 text-white" />
                    ) : (
                      <Target className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{debate.topic}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="capitalize">{debate.mode} Mode</span>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(debate.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setDebateToDelete(debate.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center space-x-2">
                    <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      P
                    </span>
                    <span>Pro Position</span>
                  </h4>
                  <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed">{debate.pro}</p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
                  <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2 flex items-center space-x-2">
                    <span className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      C
                    </span>
                    <span>Con Position</span>
                  </h4>
                  <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed">{debate.con}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {debateToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 max-w-md w-full p-6 rounded-2xl shadow-2xl mx-4">
            <h3 className="text-xl font-bold mb-4">Delete Debate</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this debate? This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setDebateToDelete(null)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
