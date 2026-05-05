'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
}

const roles = ['.NET Developer', 'Systems Engineer', 'Azure Developer', 'Full-Stack Builder']
const techPill = ['C#', '.NET 8', 'Azure', 'SQL Server', 'Angular', 'Power BI']

function TypewriterRole() {
  const [roleIdx, setRoleIdx]   = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [deleting, setDeleting]   = useState(false)

  useEffect(() => {
    const role = roles[roleIdx]
    let timeout: ReturnType<typeof setTimeout>

    if (!deleting && displayed.length < role.length) {
      timeout = setTimeout(() => setDisplayed(role.slice(0, displayed.length + 1)), 60)
    } else if (!deleting && displayed.length === role.length) {
      timeout = setTimeout(() => setDeleting(true), 2200)
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(role.slice(0, displayed.length - 1)), 35)
    } else if (deleting && displayed.length === 0) {
      setDeleting(false)
      setRoleIdx((i) => (i + 1) % roles.length)
    }

    return () => clearTimeout(timeout)
  }, [displayed, deleting, roleIdx])

  return (
    <span className="text-cyan">
      {displayed}
      <span className="inline-block w-[2px] h-[1em] bg-cyan ml-0.5 align-middle animate-pulse" />
    </span>
  )
}

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden"
    >
      {/* Grid */}
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />

      {/* Ambient blobs */}
      <div
        className="absolute -top-40 -left-40 w-[550px] h-[550px] rounded-full pointer-events-none animate-blob"
        style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.10) 0%, transparent 68%)' }}
      />
      <div
        className="absolute -bottom-40 -right-32 w-[480px] h-[480px] rounded-full pointer-events-none animate-blob"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.13) 0%, transparent 68%)', animationDelay: '3.5s' }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.03) 0%, transparent 62%)' }}
      />


      {/* Content */}
      <motion.div
        className="relative z-10 text-center max-w-4xl mx-auto px-6 pt-[16vh]"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* Status badge */}
        <motion.div variants={fadeUp} className="flex justify-center mb-4">
          <span className="inline-flex items-center gap-2.5 font-mono text-[0.67rem] tracking-[0.18em] uppercase text-cyan border border-cyan/22 rounded-full px-5 py-2.5 bg-cyan/5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
            Austin, TX &nbsp;·&nbsp; Open to Opportunities
          </span>
        </motion.div>

        {/* Name */}
        <motion.h1
          variants={fadeUp}
          className="font-heading font-bold leading-[0.9] tracking-tight mb-2"
          style={{ fontSize: 'clamp(3.2rem, 10vw, 7rem)' }}
        >
          <span className="text-txt-primary">Zachary</span>
          <br />
          <span className="text-grad-cyan">Curry</span>
        </motion.h1>

        {/* Animated role */}
        <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 mb-4 min-h-[2rem]">
          <span className="h-px w-10 bg-cyan/35" />
          <span className="font-mono text-[1rem] text-txt-secondary tracking-[0.15em] uppercase min-w-[220px] text-center">
            <TypewriterRole />
          </span>
          <span className="h-px w-10 bg-cyan/35" />
        </motion.div>

        {/* Tagline */}
        <motion.p
          variants={fadeUp}
          className="text-txt-secondary text-[1.04rem] max-w-[500px] mx-auto leading-relaxed mb-5"
        >
          8+ years engineering enterprise-grade systems with C#, .NET&nbsp;8, and Azure.
          Building software that scales, performs, and lasts.
        </motion.p>

        {/* Tech pills */}
        <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-2 mb-6">
          {techPill.map((t) => (
            <span key={t} className="skill-tag">{t}</span>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-4 mb-8">
          <a href="#career" className="btn-primary">View Career Journey</a>
          <a href="#contact" className="btn-outline">Get In Touch</a>
        </motion.div>

        {/* Social row */}
        <motion.div variants={fadeUp} className="flex items-center justify-center gap-8">
          {[
            { href: 'https://linkedin.com/in/curryzacharya', label: 'LinkedIn' },
            { href: 'https://github.com/txDukeDog',          label: 'GitHub' },
            { href: 'mailto:zcurry.dev@gmail.com',           label: 'Email' },
          ].map(({ href, label }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="font-mono text-[0.72rem] text-txt-muted hover:text-cyan transition-colors duration-200 tracking-wider"
            >
              {label}
            </a>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        className="mt-auto pb-8 flex flex-col items-center gap-2 pointer-events-none"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.6 }}
      >
        <span className="font-mono text-[0.6rem] tracking-[0.28em] text-txt-muted">SCROLL</span>
        <motion.div
          className="w-px h-9 bg-gradient-to-b from-cyan/50 to-transparent"
          animate={{ scaleY: [1, 0.35, 1] }}
          transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  )
}
