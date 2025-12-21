import { Button } from "../helper/Button"
import { Trees, Network, BookOpen } from 'lucide-react'
import { Link } from "react-router-dom"

export function Section1() {
  return (
      <section className="relative flex min-h-[85vh] flex-col justify-center items-center px-6 text-center overflow-hidden">
        
        <div className="absolute inset-0 bg-linear-to-b from-surface/80 via-surface/90 to-surface z-10"></div>
        
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1448375240586-dfd8f3793371?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 blur-[2px] z-0"></div>

        <div className="relative z-20 max-w-4xl mx-auto mt-16 animate-fade-in-up">
          <span className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-main/10 text-main text-sm font-semibold mb-6 tracking-wider border border-main/20">
            <Trees className="w-4 h-4" /> 114年度農業部農村再生計畫
          </span>
          
          <h1 className="text-5xl md:text-7xl font-bold text-fg mb-6 leading-tight tracking-tight">
            重構<span className="text-main">竹東林業</span><br />
            歷史記憶的知識圖譜
          </h1>
          
          <p className="text-lg md:text-xl text-muted mb-10 max-w-2xl mx-auto leading-relaxed">
            從散落的文獻到數位化的連結。我們運用知識圖譜技術，
            串聯人物、地景與技術，為下一代打造永續的林業文化教案。
          </p>
          
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              {/* 連結 1: 知識圖譜 */}
              <Link to="/KnowledgeGraphPage" className="w-full sm:w-auto">
                <Button variant="primary" className="w-full justify-center py-6 text-lg">
                  探索知識圖譜 <Network className="ml-2 w-5 h-5" />
                </Button>
              </Link>

              {/* 連結 2: 教學教案 */}
              <Link to="/education" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full justify-center py-6 text-lg">
                  了解教學教案 <BookOpen className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
        </div>
      </section>

  )
}
