'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const certs = [
  {
    title: 'CI/CD Pipelines using Azure DevOps',
    issuer: 'Udemy',
    icon: '☁',
    accent: 'cyan',
  },
  {
    title: 'Software Architecture: Meta & SOLID Principles in C#',
    issuer: 'Udemy',
    icon: '🏗',
    accent: 'purple',
  },
  {
    title: 'Building Microservices with .NET — The Basics',
    issuer: 'Udemy',
    icon: '⚙',
    accent: 'cyan',
  },
  {
    title: 'The Complete ASP.NET MVC 5 Course',
    issuer: 'Udemy',
    icon: '🌐',
    accent: 'purple',
  },
  {
    title: 'Bootstrap 4 From Scratch With 5 Projects',
    issuer: 'Udemy',
    icon: '🎨',
    accent: 'amber',
  },
]

export default function Certifications() {
  const ref     = useRef(null)
  const visible = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section id="certs" ref={ref} className="relative py-28 overflow-hidden">
      <div className="section-divider" />

      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="section-label mb-3">LEARNING</p>
          <h2 className="section-title">
            Certifications <span className="text-grad-cyan">&amp; Courses</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {certs.map((c, i) => {
            const borderCls =
              c.accent === 'cyan'
                ? 'border-cyan/12 hover:border-cyan/35 hover:shadow-[0_0_24px_rgba(0,212,255,0.08)]'
                : c.accent === 'purple'
                ? 'border-purple/12 hover:border-purple/35 hover:shadow-[0_0_24px_rgba(139,92,246,0.1)]'
                : 'border-amber/12 hover:border-amber/35 hover:shadow-[0_0_24px_rgba(245,158,11,0.08)]'
            const iconBg =
              c.accent === 'cyan'
                ? 'bg-cyan/8 text-cyan'
                : c.accent === 'purple'
                ? 'bg-purple/8 text-purple'
                : 'bg-amber/8 text-amber'
            const badgeColor =
              c.accent === 'cyan'
                ? 'text-cyan/70'
                : c.accent === 'purple'
                ? 'text-purple/70'
                : 'text-amber/70'

            return (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 22 }}
                animate={visible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`glass-card rounded-xl p-6 border transition-all duration-300 cursor-default ${borderCls}`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-5 ${iconBg}`}>
                  {c.icon}
                </div>
                <h3 className="font-heading font-semibold text-txt-primary text-[0.95rem] leading-snug mb-3">
                  {c.title}
                </h3>
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-[0.68rem] tracking-widest uppercase ${badgeColor}`}>
                    {c.issuer}
                  </span>
                  <span className="text-txt-muted text-xs">✓ Completed</span>
                </div>
              </motion.div>
            )
          })}

          {/* "Always learning" card */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={visible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: certs.length * 0.1 }}
            className="glass-card rounded-xl p-6 border border-border-dim flex flex-col items-center justify-center text-center gap-3"
          >
            <div className="w-10 h-10 rounded-full border border-cyan/20 flex items-center justify-center text-cyan text-lg font-bold animate-pulse">
              +
            </div>
            <p className="font-mono text-[0.72rem] text-txt-muted tracking-wide">ALWAYS LEARNING</p>
            <p className="text-txt-secondary text-sm leading-relaxed">
              Continuously expanding skills in AI integration, microservices, and modern cloud-native patterns.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
