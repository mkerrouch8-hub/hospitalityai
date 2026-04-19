import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth, useHotel } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { withProtectedPage } from '@/lib/withProtectedPage'

interface Task {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  due_date: string
  assigned_to: string
  created_at: string
}

interface StaffMember {
  id: string
  name: string
  email: string
  role: string
  status: string
}

function DashboardPage() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const hotel = useHotel()

  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'staff'>('overview')
  const [tasks, setTasks] = useState<Task[]>([])
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)

  // Task creation form
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assigned_to: '',
    priority: 'normal',
    due_date: '',
  })

  // Staff invitation form
  const [showStaffForm, setShowStaffForm] = useState(false)
  const [staffForm, setStaffForm] = useState({
    email: '',
    name: '',
    role: 'staff',
    department: '',
  })

  useEffect(() => {
    loadData()
  }, [hotel?.id])

  const loadData = async () => {
    try {
      setLoading(true)

      // Load tasks
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .eq('hotel_id', hotel.id)
        .order('created_at', { ascending: false })

      setTasks(tasksData || [])

      // Load staff
      const { data: staffData } = await supabase
        .from('staff')
        .select('*')
        .eq('hotel_id', hotel.id)
        .order('created_at', { ascending: false })

      setStaff(staffData || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const { data: newTask, error } = await supabase
        .from('tasks')
        .insert([
          {
            hotel_id: hotel.id,
            ...taskForm,
            status: 'pending',
          },
        ])
        .select()
        .single()

      if (error) throw error

      setTasks([newTask, ...tasks])
      setTaskForm({ title: '', description: '', assigned_to: '', priority: 'normal', due_date: '' })
      setShowTaskForm(false)
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  const handleInviteStaff = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const { data: newStaff, error } = await supabase
        .from('staff')
        .insert([
          {
            hotel_id: hotel.id,
            ...staffForm,
            status: 'pending_invite',
          },
        ])
        .select()
        .single()

      if (error) throw error

      setStaff([newStaff, ...staff])
      setStaffForm({ email: '', name: '', role: 'staff', department: '' })
      setShowStaffForm(false)
    } catch (error) {
      console.error('Error inviting staff:', error)
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-900/30 text-green-200'
      case 'in_progress':
        return 'bg-blue-900/30 text-blue-200'
      default:
        return 'bg-yellow-900/30 text-yellow-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-400'
      case 'high':
        return 'text-orange-400'
      case 'normal':
        return 'text-amber-400'
      default:
        return 'text-slate-400'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-amber-400">✦ LUXE OPS</h1>
            <p className="text-sm text-slate-400">{hotel.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold transition"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-slate-700">
          <div className="max-w-7xl mx-auto px-6 flex gap-8">
            {['overview', 'tasks', 'staff'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-3 border-b-2 font-semibold uppercase text-xs tracking-wide transition ${
                  activeTab === tab
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading...</div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-3xl font-bold text-white mb-8">Welcome, {user?.email}!</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                    <p className="text-slate-400 text-sm mb-2">Total Tasks</p>
                    <p className="text-4xl font-bold text-amber-400">{tasks.length}</p>
                  </div>
                  <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                    <p className="text-slate-400 text-sm mb-2">Staff Members</p>
                    <p className="text-4xl font-bold text-amber-400">{staff.length}</p>
                  </div>
                  <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                    <p className="text-slate-400 text-sm mb-2">Pending Tasks</p>
                    <p className="text-4xl font-bold text-amber-400">
                      {tasks.filter((t) => t.status === 'pending').length}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setActiveTab('tasks')}
                    className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg p-6 text-left transition"
                  >
                    <p className="text-2xl mb-2">📋</p>
                    <p className="font-semibold text-white">Manage Tasks</p>
                    <p className="text-sm text-slate-400 mt-1">Create & assign tasks</p>
                  </button>

                  <button
                    onClick={() => setActiveTab('staff')}
                    className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg p-6 text-left transition"
                  >
                    <p className="text-2xl mb-2">👥</p>
                    <p className="font-semibold text-white">Manage Staff</p>
                    <p className="text-sm text-slate-400 mt-1">Invite & manage team</p>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'tasks' && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-white">Tasks</h2>
                  <button
                    onClick={() => setShowTaskForm(!showTaskForm)}
                    className="px-4 py-2 bg-amber-400 text-slate-900 rounded-lg hover:bg-amber-300 font-semibold transition"
                  >
                    + Create Task
                  </button>
                </div>

                {showTaskForm && (
                  <form
                    onSubmit={handleCreateTask}
                    className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-8"
                  >
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Task title"
                        value={taskForm.title}
                        onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                        required
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                      />
                      <textarea
                        placeholder="Description"
                        value={taskForm.description}
                        onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                      />
                      <div className="grid grid-cols-3 gap-4">
                        <select
                          value={taskForm.priority}
                          onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                          className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-400"
                        >
                          <option value="low">Low</option>
                          <option value="normal">Normal</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                        <input
                          type="date"
                          value={taskForm.due_date}
                          onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                          className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-400"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition"
                        >
                          Create
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                <div className="space-y-4">
                  {tasks.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">No tasks yet. Create your first task above.</p>
                  ) : (
                    tasks.map((task) => (
                      <div key={task.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-white">{task.title}</h3>
                            <p className="text-sm text-slate-400 mt-1">{task.description}</p>
                            <div className="flex gap-2 mt-3">
                              <span className={`text-xs px-2 py-1 rounded ${getStatusColor(task.status)}`}>
                                {task.status}
                              </span>
                              <span className={`text-xs px-2 py-1 ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </span>
                            </div>
                          </div>
                          {task.due_date && (
                            <p className="text-sm text-slate-400">
                              {new Date(task.due_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'staff' && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-white">Staff Members</h2>
                  <button
                    onClick={() => setShowStaffForm(!showStaffForm)}
                    className="px-4 py-2 bg-amber-400 text-slate-900 rounded-lg hover:bg-amber-300 font-semibold transition"
                  >
                    + Invite Staff
                  </button>
                </div>

                {showStaffForm && (
                  <form
                    onSubmit={handleInviteStaff}
                    className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-8"
                  >
                    <div className="space-y-4">
                      <input
                        type="email"
                        placeholder="Staff email"
                        value={staffForm.email}
                        onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                        required
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                      />
                      <input
                        type="text"
                        placeholder="Staff name"
                        value={staffForm.name}
                        onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                        required
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <select
                          value={staffForm.role}
                          onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                          className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-400"
                        >
                          <option value="staff">Staff</option>
                          <option value="housekeeper">Housekeeper</option>
                          <option value="maintenance">Maintenance</option>
                          <option value="manager">Manager</option>
                        </select>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition"
                        >
                          Send Invite
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                <div className="space-y-4">
                  {staff.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">No staff members yet. Invite someone above.</p>
                  ) : (
                    staff.map((member) => (
                      <div key={member.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-white">{member.name}</h3>
                            <p className="text-sm text-slate-400">{member.email}</p>
                            <p className="text-xs text-amber-400 mt-1">{member.role}</p>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              member.status === 'active'
                                ? 'bg-green-900/30 text-green-200'
                                : 'bg-yellow-900/30 text-yellow-200'
                            }`}
                          >
                            {member.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default withProtectedPage(DashboardPage)
