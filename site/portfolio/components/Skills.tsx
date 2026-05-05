'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

type Category = { label: string; icon: string; color: 'cyan' | 'purple' | 'amber'; skills: string[] }

const categories: Category[] = [
  {
    label: 'Languages & Runtimes',
    icon: '⌨',
    color: 'cyan',
    skills: ['C#', 'JavaScript', 'TypeScript', 'T-SQL', 'SQL', 'DAX', 'CSS', 'HTML'],
  },
  {
    label: 'Frameworks & Libraries',
    icon: '⚡',
    color: 'cyan',
    skills: ['.NET 8', '.NET 5', '.NET Core 3.1', '.NET Framework 4.7', 'ASP.NET MVC', 'Entity Framework', 'Angular 2+', 'RxJS', 'jQuery'],
  },
  {
    label: 'Data & Analytics',
    icon: '📊',
    color: 'purple',
    skills: ['SQL Server', 'SSMS', 'Power BI', 'Microsoft Fabric', 'Azure Synapse', 'Dataflows', 'Power Query', 'DAX'],
  },
  {
    label: 'Cloud & DevOps',
    icon: '☁',
    color: 'purple',
    skills: ['Azure DevOps', 'CI/CD Pipelines', 'REST API', 'Microservices', 'Power Apps'],
  },
  {
    label: 'Tools & Workflow',
    icon: '🛠',
    color: 'amber',
    skills: ['Windows Forms', 'Batch Scripts', 'Kanban', 'Scrum', 'Sprint Planning', 'Git'],
  },
]

export default function Skills() {
  const ref     = useRef(null)
  const visible = useInView(ref, { once: true, margin: '-60px' })

  const borderColor = (c: string) =>
    c === 'cyan' ? 'border-cyan/20' : c === 'purple' ? 'border-purple/20' : 'border-amber/20'
  const labelColor  = (c: string) =>
    c === 'cyan' ? 'text-cyan' : c === 'purple' ? 'text-purple' : 'text-amber'
  const dotColor    = (c: string) =>
    c === 'cyan' ? 'bg-cyan' : c === 'purple' ? 'bg-purple' : 'bg-amber'

  return (
    <section id="skills" ref={ref} className="relative py-28 overflow-hidden">
      <div className="section-divider" />

      {/* grid hint */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,212,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.05) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="section-label mb-3">TECH STACK</p>
          <h2 className="section-title">
            Technical <span className="text-grad-cyan">Arsenal</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.label}
              initial={{ opacity: 0, y: 24 }}
              animate={visible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`glass-card rounded-xl p-6 border ${borderColor(cat.color)}`}
            >
              <div className="flex items-center gap-3 mb-5">
                <span className="text-xl">{cat.icon}</span>
                <div>
                  <div className={`flex items-center gap-1.5 mb-0.5`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${dotColor(cat.color)}`} />
                    <span className={`font-mono text-[0.68rem] tracking-widest uppercase ${labelColor(cat.color)}`}>
                      {cat.label}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {cat.skills.map((s) => (
                  <span
                    key={s}
                    className={`skill-tag ${cat.color === 'purple' ? 'skill-tag-purple' : ''}`}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
