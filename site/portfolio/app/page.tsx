import Navigation     from '@/components/Navigation'
import Hero           from '@/components/Hero'
import About          from '@/components/About'
import Timeline       from '@/components/Timeline'
import Skills         from '@/components/Skills'
import Certifications from '@/components/Certifications'
import Portfolio      from '@/components/Portfolio'
import Contact        from '@/components/Contact'

export default function Home() {
  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <About />
        <Timeline />
        <Skills />
        <Certifications />
        <Portfolio />
        <Contact />
      </main>
    </>
  )
}
