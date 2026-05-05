'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion'

const links = [
  { href: '#about',     label: 'About' },
  { href: '#career',    label: 'Career' },
  { href: '#skills',    label: 'Skills' },
  { href: '#certs',     label: 'Certs' },
  { href: '#portfolio', label: 'Portfolio' },
  { href: '#contact',   label: 'Contact' },
]

export default function Navigation() {
  const [scrolled, setScrolled]     = useState(false)
  const [open, setOpen]             = useState(false)
  const [activeId, setActiveId]     = useState('')

  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const ids = links.map((l) => l.href.slice(1))
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveId(e.target.id)
        })
      },
      { rootMargin: '-30% 0px -65% 0px' }
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <>
      {/* Scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan via-purple to-cyan z-[60] origin-left"
        style={{ scaleX }}
      />

      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'glass py-3 shadow-[0_1px_0_rgba(0,212,255,0.07)]'
            : 'py-5 bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <a
            href="#hero"
            className="flex items-center gap-0.5 font-heading font-bold text-xl tracking-tight select-none"
          >
            <span className="text-grad-cyan">Z</span>
            <span className="text-txt-primary">C</span>
            <span className="text-cyan font-mono text-2xl leading-none ml-0.5">_</span>
          </a>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-7">
            {links.map((l) => {
              const isActive = activeId === l.href.slice(1)
              return (
                <a
                  key={l.href}
                  href={l.href}
                  className={`relative font-mono text-[0.78rem] tracking-wide transition-colors duration-200 group ${
                    isActive ? 'text-cyan' : 'text-txt-secondary hover:text-cyan'
                  }`}
                >
                  {l.label}
                  <span
                    className={`absolute -bottom-0.5 left-0 h-px bg-cyan transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </a>
              )
            })}
            <a href="mailto:zcurry.dev@gmail.com" className="btn-outline text-[0.78rem] py-2 px-4">
              Hire Me
            </a>
          </div>

          {/* Hamburger */}
          <button
            className="md:hidden flex flex-col gap-[5px] p-1 text-txt-secondary hover:text-cyan transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            <span className={`block h-px w-5 bg-current transition-all duration-300 origin-center ${open ? 'rotate-45 translate-y-[7px]' : ''}`} />
            <span className={`block h-px w-5 bg-current transition-all duration-300 ${open ? 'opacity-0 scale-x-0' : ''}`} />
            <span className={`block h-px w-5 bg-current transition-all duration-300 origin-center ${open ? '-rotate-45 -translate-y-[7px]' : ''}`} />
          </button>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {open && (
            <motion.div
              key="mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden glass border-t border-border-dim"
            >
              <div className="px-6 py-5 flex flex-col gap-5">
                {links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    className={`font-mono text-sm transition-colors ${
                      activeId === l.href.slice(1) ? 'text-cyan' : 'text-txt-secondary hover:text-cyan'
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    {l.label}
                  </a>
                ))}
                <a href="mailto:zcurry.dev@gmail.com" className="btn-outline text-sm self-start">
                  Hire Me
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  )
}
