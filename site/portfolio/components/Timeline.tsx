'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

type Entry = {
  period: string
  title: string
  org: string
  location: string
  description: string
  tags: string[]
  current?: boolean
  type?: 'work' | 'edu'
}

const entries: Entry[] = [
  {
    period: 'Sep 2020 — Present',
    title: '.NET Developer',
    org: 'Texas Enterprises, Inc. · Fueled By Family',
    location: 'Austin, TX',
    description:
      'Driving enterprise software development at a family-owned Texas business. Leading .NET initiatives across the full application lifecycle — from architecture and design through delivery and deployment. Owning complex integrations, data pipelines, and business intelligence solutions.',
    tags: ['C#', '.NET 8', 'SQL Server', 'Azure DevOps', 'Power BI', 'Microsoft Fabric', 'Power Apps'],
    current: true,
    type: 'work',
  },
  {
    period: 'Aug 2017 — Present',
    title: '.NET Developer',
    org: 'Professional Experience',
    location: 'Austin, TX',
    description:
      '8+ years of .NET development across enterprise projects. Built high-performance ASP.NET MVC applications, data-heavy REST APIs, Angular 2+ SPAs, and analytics pipelines using Azure Synapse and Microsoft Fabric. Practiced in Kanban and Scrum methodologies.',
    tags: ['ASP.NET MVC', 'Angular 2+', 'Entity Framework', 'RxJS', 'T-SQL', 'Azure Synapse', 'DAX', 'Dataflows', 'Windows Forms'],
    type: 'work',
  },
  {
    period: 'May 2017',
    title: 'B.B.A. — Computer Information Systems',
    org: 'James Madison University',
    location: 'Harrisonburg, VA',
    description:
      'Bachelor of Business Administration with a concentration in Computer Information Systems. A foundational blend of technical engineering and strategic business thinking that continues to shape how I approach software problems.',
    tags: ['CIS', 'Business Administration', 'Information Systems', 'Software Engineering'],
    type: 'edu',
  },
]

function TimelineCard({ entry, index, visible }: { entry: Entry; index: number; visible: boolean }) {
  const accent = entry.current
    ? 'text-cyan border-cyan/30 bg-cyan/8'
    : entry.type === 'edu'
    ? 'text-amber border-amber/30 bg-amber/8'
    : 'text-txt-muted border-txt-muted/20 bg-txt-muted/5'

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={visible ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.18, ease: [0.22, 1, 0.36, 1] }}
      className="relative pl-10 md:pl-14"
    >
      {/* Node */}
      <div className="absolute left-0 top-6 flex items-center justify-center w-5 h-5">
        <div
          className={`w-3 h-3 rounded-full border-2 bg-bg-primary z-10 relative ${
            entry.current ? 'border-cyan' : entry.type === 'edu' ? 'border-amber' : 'border-txt-muted/50'
          }`}
        >
          {entry.current && (
            <span className="absolute inset-0 rounded-full bg-cyan/40 animate-ping-slow" />
          )}
        </div>
      </div>

      <div className="glass-card rounded-xl p-6 md:p-7">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div>
            <h3 className="font-heading text-lg font-bold text-txt-primary leading-tight">{entry.title}</h3>
            <p className="font-mono text-[0.8rem] text-cyan mt-1">{entry.org}</p>
            <p className="font-mono text-[0.7rem] text-txt-muted">{entry.location}</p>
          </div>
          <span className={`self-start font-mono text-[0.68rem] tracking-wider px-3 py-1.5 rounded-full border shrink-0 ${accent}`}>
            {entry.current ? '● NOW' : entry.period}
          </span>
        </div>

        <p className="text-txt-secondary text-sm leading-relaxed mb-4">{entry.description}</p>

        <div className="flex flex-wrap gap-1.5">
          {entry.tags.map((t) => (
            <span key={t} className={`skill-tag ${entry.type === 'edu' ? 'skill-tag-purple' : ''}`}>{t}</span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default function Timeline() {
  const ref     = useRef(null)
  const visible = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="career" ref={ref} className="relative py-28 overflow-hidden">
      <div className="section-divider" />

      {/* purple blob */}
      <div
        className="absolute right-0 top-1/3 w-80 h-80 rounded-full opacity-30 pointer-events-none animate-blob"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)', animationDelay: '1.5s' }}
      />

      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="section-label mb-3">EXPERIENCE</p>
          <h2 className="section-title">
            Career <span className="text-grad-cyan">Journey</span>
          </h2>
        </motion.div>

        {/* Timeline line + cards */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[9px] top-0 bottom-0 w-px bg-gradient-to-b from-cyan/40 via-purple/20 to-transparent" />

          <div className="space-y-8">
            {entries.map((e, i) => (
              <TimelineCard key={i} entry={e} index={i} visible={visible} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
