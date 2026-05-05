'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const placeholders = [
  { label: 'Enterprise .NET App',  stack: ['C#', '.NET 8', 'SQL Server'], status: 'in-dev' },
  { label: 'Azure Data Pipeline',  stack: ['Azure Synapse', 'Power BI', 'DAX'], status: 'in-dev' },
  { label: 'Angular SPA',          stack: ['Angular', 'RxJS', 'REST API'],  status: 'in-dev' },
]

export default function Portfolio() {
  const ref     = useRef(null)
  const visible = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section id="portfolio" ref={ref} className="relative py-28 overflow-hidden">
      <div className="section-divider" />

      {/* ambient */}
      <div
        className="absolute left-0 bottom-0 w-80 h-80 rounded-full opacity-25 pointer-events-none animate-blob"
        style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%)', animationDelay: '0.5s' }}
      />

      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <p className="section-label mb-3">WORK</p>
          <h2 className="section-title">
            Portfolio <span className="text-grad-cyan">Projects</span>
          </h2>
        </motion.div>

        {/* Coming soon banner */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="glass-card rounded-xl p-8 border border-cyan/15 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-amber animate-pulse" />
              <span className="font-mono text-[0.7rem] tracking-widest text-amber uppercase">Under Construction</span>
            </div>
            <h3 className="font-heading text-xl font-bold text-txt-primary mb-2">Projects arriving soon</h3>
            <p className="text-txt-secondary text-sm leading-relaxed max-w-lg">
              A curated portfolio of enterprise .NET systems, data pipelines, and full-stack applications is being
              assembled. In the meantime, browse the GitHub profile below.
            </p>
          </div>
          <a
            href="https://github.com/txDukeDog"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline shrink-0"
          >
            {/* GitHub icon */}
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            View GitHub
          </a>
        </motion.div>

        {/* Placeholder project cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          {placeholders.map((p, i) => (
            <motion.div
              key={p.label}
              initial={{ opacity: 0, y: 20 }}
              animate={visible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.25 + i * 0.1 }}
              className="glass-card rounded-xl p-5 border border-border-dim relative overflow-hidden"
            >
              {/* blur overlay */}
              <div className="absolute inset-0 backdrop-blur-[2px] bg-bg-card/40 flex items-center justify-center z-10">
                <span className="font-mono text-[0.65rem] tracking-widest text-txt-muted border border-txt-muted/20 rounded-full px-3 py-1.5">
                  COMING SOON
                </span>
              </div>
              <div className="font-heading font-semibold text-txt-primary mb-3 opacity-40">{p.label}</div>
              <div className="flex flex-wrap gap-1.5 opacity-40">
                {p.stack.map((s) => <span key={s} className="skill-tag text-[0.65rem]">{s}</span>)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
