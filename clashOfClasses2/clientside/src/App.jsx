import { useEffect, useMemo, useState } from 'react'
import './App.css'

const initialClasses = [
  { id: 'C-101', code: 'CS101', name: 'Programming Fundamentals', department: 'Computer Science', teacher: 'Dr. A. Sharma', room: 'Lab 204', semester: 'Semester 1', credits: 4, status: 'planning', days: ['Mon', 'Wed'], time: '09:00 – 10:00', color: 'violet', students: 58 },
  { id: 'C-102', code: 'CS204', name: 'Data Structures', department: 'Computer Science', teacher: 'Prof. R. Mehta', room: 'Room 302', semester: 'Semester 3', credits: 4, status: 'ready', days: ['Tue', 'Thu'], time: '10:00 – 11:00', color: 'blue', students: 46 },
  { id: 'C-103', code: 'EC201', name: 'Digital Electronics', department: 'Electronics', teacher: 'Dr. N. Verma', room: 'Lab 105', semester: 'Semester 3', credits: 3, status: 'scheduled', days: ['Mon', 'Fri'], time: '11:00 – 12:00', color: 'amber', students: 42 },
  { id: 'C-104', code: 'MA102', name: 'Engineering Mathematics II', department: 'Applied Mathematics', teacher: 'Dr. P. Singh', room: 'Room 201', semester: 'Semester 2', credits: 4, status: 'published', days: ['Wed', 'Fri'], time: '12:00 – 13:00', color: 'green', students: 64 },
  { id: 'C-105', code: 'CS305', name: 'Database Management Systems', department: 'Computer Science', teacher: 'Prof. S. Kapoor', room: 'Lab 202', semester: 'Semester 5', credits: 4, status: 'planning', days: ['Tue', 'Thu'], time: '14:00 – 15:00', color: 'pink', students: 51 },
  { id: 'C-106', code: 'ME202', name: 'Thermodynamics', department: 'Mechanical', teacher: 'Dr. K. Rao', room: 'Room 108', semester: 'Semester 3', credits: 3, status: 'ready', days: ['Mon', 'Thu'], time: '13:00 – 14:00', color: 'cyan', students: 39 },
  { id: 'C-107', code: 'CS401', name: 'Computer Networks', department: 'Computer Science', teacher: 'Prof. R. Mehta', room: 'Room 303', semester: 'Semester 7', credits: 3, status: 'scheduled', days: ['Tue', 'Fri'], time: '15:00 – 16:00', color: 'blue', students: 44 },
]

const columns = [
  { id: 'planning', title: 'Planning', hint: 'Being prepared', tone: 'violet' },
  { id: 'ready', title: 'Ready', hint: 'Details confirmed', tone: 'blue' },
  { id: 'scheduled', title: 'Scheduled', hint: 'Timetable assigned', tone: 'amber' },
  { id: 'published', title: 'Published', hint: 'Visible to students', tone: 'green' },
]

const navItems = [
  { id: 'board', icon: '▦', label: 'Class board' },
  { id: 'timetable', icon: '▤', label: 'Timetable' },
  { id: 'courses', icon: '▣', label: 'Courses' },
  { id: 'teachers', icon: '♙', label: 'Teachers' },
  { id: 'rooms', icon: '⌂', label: 'Rooms' },
  { id: 'departments', icon: '⌘', label: 'Departments' },
]

function Icon({ children, className = '' }) {
  return <span aria-hidden="true" className={`icon ${className}`}>{children}</span>
}

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('coc-theme') || 'dark')
  const [classes, setClasses] = useState(initialClasses)
  const [activeNav, setActiveNav] = useState('board')
  const [query, setQuery] = useState('')
  const [department, setDepartment] = useState('All departments')
  const [semester, setSemester] = useState('All semesters')
  const [selected, setSelected] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [dragged, setDragged] = useState(null)
  const [apiState, setApiState] = useState('checking')
  const [form, setForm] = useState({ code: '', name: '', department: 'Computer Science', teacher: '', semester: 'Semester 1', room: '', days: 'Mon, Wed', time: '09:00 – 10:00' })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('coc-theme', theme)
  }, [theme])

  useEffect(() => {
    const base = import.meta.env.VITE_API_URL || ''
    fetch(`${base}/health`, { signal: AbortSignal.timeout(3500) })
      .then((response) => { if (!response.ok) throw new Error('API unavailable'); setApiState('online') })
      .catch(() => setApiState('offline'))
  }, [])

  const departments = useMemo(() => ['All departments', ...new Set(classes.map((item) => item.department))], [classes])
  const semesters = useMemo(() => ['All semesters', ...new Set(classes.map((item) => item.semester))], [classes])
  const visibleClasses = useMemo(() => classes.filter((item) => {
    const matchesQuery = `${item.code} ${item.name} ${item.teacher} ${item.room}`.toLowerCase().includes(query.toLowerCase())
    return matchesQuery && (department === 'All departments' || item.department === department) && (semester === 'All semesters' || item.semester === semester)
  }), [classes, query, department, semester])
  const stats = useMemo(() => ({ total: classes.length, scheduled: classes.filter((item) => ['scheduled', 'published'].includes(item.status)).length, planning: classes.filter((item) => item.status === 'planning').length, published: classes.filter((item) => item.status === 'published').length }), [classes])

  function moveClass(id, status) {
    setClasses((current) => current.map((item) => item.id === id ? { ...item, status } : item))
    setDragged(null)
  }

  function createClass(event) {
    event.preventDefault()
    const newClass = { ...form, id: `C-${String(Date.now()).slice(-4)}`, credits: 3, students: 0, color: 'violet', status: 'planning', days: form.days.split(',').map((day) => day.trim()).filter(Boolean) }
    setClasses((current) => [newClass, ...current])
    setShowCreate(false)
    setForm({ code: '', name: '', department: 'Computer Science', teacher: '', semester: 'Semester 1', room: '', days: 'Mon, Wed', time: '09:00 – 10:00' })
  }

  const selectedClass = classes.find((item) => item.id === selected)

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><span>c</span><i /></div><div><strong>clash<span>of</span>classes</strong><small>ACADEMIC WORKSPACE</small></div></div>
        <button className="workspace-switch"><span className="workspace-avatar">NU</span><span className="workspace-copy"><b>Northfield University</b><small>Academic workspace</small></span><Icon>⌄</Icon></button>
        <div className="nav-label">WORKSPACE</div>
        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map((item) => <button key={item.id} className={`nav-item ${activeNav === item.id ? 'active' : ''}`} onClick={() => setActiveNav(item.id)}><Icon>{item.icon}</Icon><span>{item.label}</span>{item.id === 'board' && <em>7</em>}</button>)}
        </nav>
        <div className="sidebar-bottom"><div className="nav-label">SYSTEM</div><button className="nav-item"><Icon>⚙</Icon><span>Settings</span></button><div className="help-card"><div className="help-icon">✳</div><b>Need a hand?</b><p>Find your way around the academic workspace.</p><button onClick={() => window.alert('Help documentation will be added in a future release.')}>Open help centre <span>↗</span></button></div><div className="profile"><div className="profile-avatar">DV</div><div className="profile-copy"><b>Workspace Admin</b><small>Administrator</small></div><button className="more-button" aria-label="Profile options">···</button></div></div>
      </aside>

      <main className="main-area">
        <header className="topbar"><div className="breadcrumbs"><span>Workspace</span><b>/</b><strong>{navItems.find((item) => item.id === activeNav)?.label || 'Class board'}</strong></div><div className="top-actions"><div className={`api-indicator ${apiState}`}><i />{apiState === 'online' ? 'API connected' : apiState === 'checking' ? 'Checking API' : 'Demo mode'}</div><button className="icon-button" aria-label="Toggle theme" title="Toggle theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? '☼' : '☾'}</button><button className="icon-button notification" aria-label="Notifications">♧<i /></button><div className="top-avatar">DV</div></div></header>

        <div className="page-content">
          {activeNav === 'board' ? <>
            <section className="page-heading"><div><div className="eyebrow"><span className="eyebrow-dot" /> SEMESTER OVERVIEW <span className="eyebrow-separator">/</span> 2026–27</div><h1>Class board<span className="heading-period">.</span></h1><p className="page-subtitle">Plan, organize and publish your academic classes.</p></div><div className="heading-actions"><button className="button button-secondary" onClick={() => window.alert('Export will be available when class data is connected to the API.')}><Icon>⇩</Icon> Export</button><button className="button button-primary" onClick={() => setShowCreate(true)}><Icon>＋</Icon> New class</button></div></section>

            <section className="stats-grid" aria-label="Class statistics"><div className="stat-card"><div className="stat-top"><span>Total classes</span><span className="stat-icon purple">▦</span></div><strong>{stats.total.toString().padStart(2, '0')}</strong><small><span className="stat-neutral">Across all departments</span></small></div><div className="stat-card"><div className="stat-top"><span>In scheduling</span><span className="stat-icon blue">◷</span></div><strong>{stats.scheduled.toString().padStart(2, '0')}</strong><small><span className="stat-positive">●</span> Scheduled or published</small></div><div className="stat-card"><div className="stat-top"><span>In planning</span><span className="stat-icon amber">✳</span></div><strong>{stats.planning.toString().padStart(2, '0')}</strong><small><span className="stat-neutral">Awaiting preparation</span></small></div><div className="stat-card"><div className="stat-top"><span>Published</span><span className="stat-icon green">✓</span></div><strong>{stats.published.toString().padStart(2, '0')}</strong><small><span className="stat-positive">●</span> Ready for students</small></div></section>

            <section className="board-section"><div className="board-toolbar"><div><h2>Classes <span className="count-pill">{visibleClasses.length}</span></h2><p>Move a class between stages as it progresses.</p></div><div className="filters"><label className="search-box"><Icon>⌕</Icon><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search classes..." aria-label="Search classes"/><kbd>/</kbd></label><select value={department} onChange={(event) => setDepartment(event.target.value)} aria-label="Filter by department">{departments.map((item) => <option key={item}>{item}</option>)}</select><select value={semester} onChange={(event) => setSemester(event.target.value)} aria-label="Filter by semester">{semesters.map((item) => <option key={item}>{item}</option>)}</select></div></div>
              <div className="kanban-board">{columns.map((column) => {
                const items = visibleClasses.filter((item) => item.status === column.id)
                return <section key={column.id} className={`kanban-column column-${column.tone}`} onDragOver={(event) => event.preventDefault()} onDrop={() => dragged && moveClass(dragged, column.id)}><div className="column-heading"><div className="column-title"><span className="column-dot"/><h3>{column.title}</h3><span className="column-count">{items.length}</span></div><button className="more-button" aria-label={`${column.title} options`}>···</button></div><p className="column-hint">{column.hint}</p><div className="card-stack">{items.map((item) => <article key={item.id} className={`class-card accent-${item.color} ${dragged === item.id ? 'is-dragging' : ''}`} draggable onDragStart={() => setDragged(item.id)} onDragEnd={() => setDragged(null)} onClick={() => setSelected(item.id)}><div className="card-topline"><span className="course-code">{item.code}</span><button className="card-menu" onClick={(event) => { event.stopPropagation(); setSelected(item.id) }} aria-label={`Open ${item.code} details`}>···</button></div><h4>{item.name}</h4><div className="card-department"><span className="department-dot"/> {item.department}</div><div className="card-divider"/><div className="card-meta"><span><Icon>♙</Icon>{item.teacher}</span><span><Icon>⌂</Icon>{item.room || 'Room not assigned'}</span></div><div className="card-footer"><span className="semester-tag">{item.semester}</span><span className="student-count">♧ {item.students} students</span></div><div className="card-schedule"><span>◷ {item.time}</span><span>{item.days.join(' · ')}</span></div></article>)}</div><button className="add-card-button" onClick={() => setShowCreate(true)}><span>＋</span> Add a class</button></section>
              })}</div>
              <div className="board-footnote"><span><Icon>✥</Icon> Drag cards between columns to update their workflow stage.</span><span>Changes in this preview are local only.</span></div>
            </section>
          </> : <section className="placeholder-page"><div className="placeholder-icon">{navItems.find((item) => item.id === activeNav)?.icon}</div><div className="eyebrow">WORKSPACE MODULE</div><h1>{navItems.find((item) => item.id === activeNav)?.label}<span className="heading-period">.</span></h1><p>This module is part of the planned workspace. The class board is available now as an interactive frontend prototype.</p><button className="button button-primary" onClick={() => setActiveNav('board')}>Back to class board</button></section>}
        </div>
        <footer className="footer"><span>CLASH OF CLASSES <b>·</b> ACADEMIC WORKSPACE</span><span>Preview build <b>0.2.0</b></span></footer>
      </main>

      {selectedClass && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null) }}><aside className="detail-panel"><div className="panel-top"><span className="eyebrow">CLASS DETAILS</span><button className="icon-button" onClick={() => setSelected(null)} aria-label="Close details">×</button></div><span className="course-code">{selectedClass.code}</span><h2>{selectedClass.name}</h2><p className="panel-description">{selectedClass.department} · {selectedClass.semester}</p><div className="detail-list"><div><span>Instructor</span><b>{selectedClass.teacher}</b></div><div><span>Room</span><b>{selectedClass.room || 'Not assigned'}</b></div><div><span>Schedule</span><b>{selectedClass.days.join(', ')} · {selectedClass.time}</b></div><div><span>Enrolment</span><b>{selectedClass.students} students</b></div><div><span>Credits</span><b>{selectedClass.credits}</b></div><div><span>Workflow</span><b className={`status-text ${selectedClass.status}`}>{columns.find((column) => column.id === selectedClass.status)?.title}</b></div></div><div className="panel-actions"><label htmlFor="move-status">Move to stage</label><select id="move-status" value={selectedClass.status} onChange={(event) => moveClass(selectedClass.id, event.target.value)}>{columns.map((column) => <option key={column.id} value={column.id}>{column.title}</option>)}</select><button className="button button-primary" onClick={() => setSelected(null)}>Done</button></div><p className="panel-note">Preview data only. Workflow changes are not saved to the database yet.</p></aside></div>}

      {showCreate && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowCreate(false) }}><form className="create-modal" onSubmit={createClass}><div className="panel-top"><div><span className="eyebrow">CLASS MANAGEMENT</span><h2>Create a class</h2></div><button type="button" className="icon-button" onClick={() => setShowCreate(false)} aria-label="Close">×</button></div><div className="form-grid"><label>Course code<input required value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} placeholder="e.g. CS301"/></label><label>Class name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Operating Systems"/></label><label>Department<select value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })}><option>Computer Science</option><option>Electronics</option><option>Mechanical</option><option>Applied Mathematics</option></select></label><label>Instructor<input value={form.teacher} onChange={(event) => setForm({ ...form, teacher: event.target.value })} placeholder="Instructor name"/></label><label>Semester<select value={form.semester} onChange={(event) => setForm({ ...form, semester: event.target.value })}>{Array.from({ length: 8 }, (_, index) => <option key={index}>Semester {index + 1}</option>)}</select></label><label>Room<input value={form.room} onChange={(event) => setForm({ ...form, room: event.target.value })} placeholder="e.g. Lab 204"/></label><label>Days<input value={form.days} onChange={(event) => setForm({ ...form, days: event.target.value })} placeholder="Mon, Wed"/></label><label>Time<input value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} placeholder="09:00 – 10:00"/></label></div><div className="modal-actions"><button type="button" className="button button-secondary" onClick={() => setShowCreate(false)}>Cancel</button><button type="submit" className="button button-primary">Create class</button></div><p className="panel-note">This creates a local preview card. Database integration comes next.</p></form></div>}
    </div>
  )
}

export default App
