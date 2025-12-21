import { FeatureCard } from '../helper/FeatureCard'

export function Section3() {
  return (
      <section className="py-24 px-6 md:px-12 bg-surface">
        <div className="max-w-7xl mx-auto">
          {/* ... 標題區域不變 ... */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-fg mb-4">計畫核心內容</h2>
            <p className="text-muted max-w-2xl mx-auto">
              透過科技與教育的雙重引擎，達成文化保存與生態保育的雙向永續。
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              to="/KnowledgeGraphPage" 
              title="林業知識圖譜" 
              desc="利用 Graph Database 技術，將林業史料結構化。從「林場」到「製材所」，看見人與土地錯綜複雜的關係網絡。"
              tag="數位保存"
            />

            <FeatureCard 
              to="/education"
              title="沈浸式文化教案" 
              desc="針對中小學設計的 3-5 個主題模組。跳脫枯燥的課本，透過互動教材認識竹東的林業發展史。"
              tag="教育推廣"
            />

            <FeatureCard 
              to="/workshop"
              title="在地共創工作坊" 
              desc="邀請教師、導覽員與在地青年參與。這不僅是學術研究，更是凝聚社區共識的行動。"
              tag="社區參與"
            />
          </div>
        </div>
      </section>
  )
}