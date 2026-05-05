'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const stats = [
  { value: '8+',  label: 'Years in .NET' },
  { value: '20+', label: 'Technologies' },
  { value: 'BBA', label: 'CIS — JMU 2017' },
  { value: '5',   label: 'Certifications' },
]

type Token = { text: string; cls: string }
type Line  = Token[]

const codeLines: Line[] = [
  [{ text: 'public class ', cls: 'text-purple' }, { text: 'ZacharyCurry', cls: 'text-cyan' }, { text: ' : IDeveloper', cls: 'text-txt-secondary' }],
  [{ text: '{', cls: 'text-txt-secondary' }],
  [{ text: '    public ', cls: 'text-purple' }, { text: 'string', cls: 'text-purple' }, { text: '  Location    => ', cls: 'text-txt-secondary' }, { text: '"Austin, TX"', cls: 'text-amber' }, { text: ';', cls: 'text-txt-secondary' }],
  [{ text: '    public ', cls: 'text-purple' }, { text: 'int', cls: 'text-purple' }, { text: '     YearsExp    => ', cls: 'text-txt-secondary' }, { text: '8', cls: 'text-amber' }, { text: ';', cls: 'text-txt-secondary' }],
  [{ text: '    public ', cls: 'text-purple' }, { text: 'bool', cls: 'text-purple' }, { text: '    IsAvailable => ', cls: 'text-txt-secondary' }, { text: 'true', cls: 'text-cyan' }, { text: ';', cls: 'text-txt-secondary' }],
  [],
  [{ text: '    public ', cls: 'text-purple' }, { text: 'string', cls: 'text-purple' }, { text: '[] Strengths =>', cls: 'text-txt-secondary' }],
  [{ text: '    {', cls: 'text-txt-secondary' }],
  [{ text: '        ', cls: '' }, { text: '"Enterprise .NET Systems"', cls: 'text-amber' }, { text: ',', cls: 'text-txt-secondary' }],
  [{ text: '        ', cls: '' }, { text: '"Data Pipelines & Analytics"', cls: 'text-amber' }, { text: ',', cls: 'text-txt-secondary' }],
  [{ text: '        ', cls: '' }, { text: '"Cloud Architecture (Azure)"', cls: 'text-amber' }, { text: ',', cls: 'text-txt-secondary' }],
  [{ text: '        ', cls: '' }, { text: '"Full-Stack Delivery"', cls: 'text-amber' }, { text: ',', cls: 'text-txt-secondary' }],
  [{ text: '    };', cls: 'text-txt-secondary' }],
  [],
  [{ text: '    public ', cls: 'text-purple' }, { text: 'string', cls: 'text-purple' }, { text: ' Motto =>', cls: 'text-txt-secondary' }],
  [{ text: '        ', cls: '' }, { text: '"Anything is possible with', cls: 'text-amber' }],
  [{ text: '         the right attitude."', cls: 'text-amber' }, { text: ';', cls: 'text-txt-secondary' }],
  [{ text: '}', cls: 'text-txt-secondary' }],
]

export default function About() {
  const ref     = useRef(null)
  const visible = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="about" ref={ref} className="relative py-16 overflow-hidden">
      <div className="section-divider mb-0" />

      <div
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(0,212,255,0.06) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="section-label mb-3">WHO I AM</p>
          <h2 className="section-title">
            About <span className="text-grad-cyan">Me</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Code card */}
          <motion.div
            initial={{ opacity: 0, x: -36 }}
            animate={visible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="glass-card rounded-xl overflow-hidden">
              {/* Window chrome */}
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border-dim bg-bg-card/50">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                <span className="ml-3 font-mono text-[0.68rem] text-txt-muted">profile.cs</span>
              </div>
              {/* Code */}
              <div className="p-6 font-mono text-[0.78rem] leading-relaxed overflow-x-auto">
                {codeLines.map((line, li) => (
                  <div key={li} className="min-h-[1.4em]">
                    {line.length === 0
                      ? <>&nbsp;</>
                      : line.map((tok, ti) => (
                          <span key={ti} className={tok.cls}>{tok.text}</span>
                        ))
                    }
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-40 h-40 rounded-full bg-purple/20 blur-3xl pointer-events-none" />
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 36 }}
            animate={visible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-6"
          >
            <p className="text-txt-secondary text-[1.02rem] leading-relaxed">
              I&apos;m a results-driven .NET Developer with an entrepreneurial spirit and a track record of
              building robust enterprise systems that actually get used. With 8+ years of professional
              experience, I&apos;ve delivered everything from high-performance REST APIs to complex analytics
              dashboards.
            </p>
            <p className="text-txt-secondary text-[1.02rem] leading-relaxed">
              Based in Austin, TX, I currently work at{' '}
              <span className="text-cyan font-medium">Texas Enterprises, Inc.</span>{' '}
              where I lead .NET development across the full SDLC. I bring both the technical depth to
              architect systems and the business sense — from my BBA in Computer Information Systems —
              to deliver real impact.
            </p>
            <p className="text-txt-secondary text-[1.02rem] leading-relaxed">
              I thrive on complexity, believe in clean architecture, and am always learning. Currently
              expanding into AI integration, microservices patterns, and modern cloud-native development.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-2">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={visible ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.45 + i * 0.1 }}
                  className="glass-card rounded-lg p-4"
                >
                  <div className="font-heading text-2xl font-bold text-cyan leading-tight">{s.value}</div>
                  <div className="font-mono text-[0.68rem] text-txt-muted mt-1 tracking-wide">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
