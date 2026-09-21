import { useState } from 'react'
import { Menu, X, Sparkles, ArrowRight, Code2, Zap, Globe } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', idea: '' })
  const [status, setStatus] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('Sending...')
    try {
      const res = await fetch(`${API}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed')
      setStatus('Thanks! We will contact you soon.')
      setForm({ name: '', email: '', idea: '' })
    } catch {
      setStatus('Something went wrong. Try again.')
    }
  }

  return (
    <div className="min-h-screen bg-[#050510] text-white overflow-x-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/30 rounded-full blur-[120px] animate-blob animation-delay-2000" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-black/30 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Nexifing
          </a>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/70">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#how" className="hover:text-white">How it works</a>
            <a href="#contact" className="hover:text-white">Contact</a>
            <a href="#contact" className="px-5 py-2 rounded-full bg-white text-black font-semibold hover:bg-white/90 transition">
              Get started
            </a>
          </div>
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden px-6 pb-4 flex flex-col gap-4 bg-black/90">
            <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#how" onClick={() => setMenuOpen(false)}>How it works</a>
            <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-24 px-6 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-white/70 mb-8">
          <Sparkles size={16} className="text-purple-400" />
          AI-powered website builder
        </div>
        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
          Build your website <br />
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            with a single prompt.
          </span>
        </h1>
        <p className="text-lg text-white/60 max-w-2xl mx-auto mb-10">
          Tell Nexifing what you need. Our AI generates a modern, responsive website in seconds. No code required.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#contact" className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 font-semibold hover:opacity-90 transition flex items-center justify-center gap-2">
            Start building <ArrowRight size={18} />
          </a>
          <a href="#how" className="px-8 py-4 rounded-full border border-white/20 hover:bg-white/5 transition">
            See how it works
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">Everything you need</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: <Zap className="text-purple-400" />, title: 'Instant generation', desc: 'Describe your idea and get a full website in seconds.' },
            { icon: <Code2 className="text-cyan-400" />, title: 'Clean code', desc: 'Export HTML, CSS, React, and Tailwind code you own.' },
            { icon: <Globe className="text-pink-400" />, title: 'Deploy anywhere', desc: 'Publish to Vercel, Netlify, or GitHub with one click.' },
          ].map((f, i) => (
            <div key={i} className="p-8 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6">{f.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
              <p className="text-white/60">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 px-6 max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-6">Tell us your idea</h2>
        <p className="text-center text-white/60 mb-10">We'll get back to you and start building your website.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="Your name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-6 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-purple-400 outline-none"
          />
          <input
            type="email"
            placeholder="Email address"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-6 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-purple-400 outline-none"
          />
          <textarea
            placeholder="Describe the website you want..."
            rows="5"
            required
            value={form.idea}
            onChange={(e) => setForm({ ...form, idea: e.target.value })}
            className="w-full px-6 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-purple-400 outline-none resize-none"
          />
          <button type="submit" className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 font-semibold hover:opacity-90 transition">
            Send request
          </button>
          {status && <p className="text-center text-white/70">{status}</p>}
        </form>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 text-center text-white/40 text-sm">
        © {new Date().getFullYear()} Nexifing. Built with React, Tailwind, and Node.js.
      </footer>
    </div>
  )
}

export default App