import React from 'react'
import { StatsCard } from '../helper/StatsCard'
import {  Network, BookOpen, Users, Database } from 'lucide-react'

export function Section2() {
  return (
        <section className="bg-main py-24 px-6 md:px-12 bg-surface-50">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-fg">
                喚醒沉睡的山村記憶
              </h2>
              <div className="space-y-6 text-muted text-lg">
                <p>
                  竹東曾是繁華的林業重鎮，但隨著時光流逝，珍貴的資料散落於文獻、展品與耆老的記憶中，
                  缺乏系統化的整理。
                </p>
                <p>
                  我們看見了世代傳承的斷層。年輕一代對山村智慧感到陌生，學校也缺乏結合在地生態與文化的教材。
                  因此，國立陽明交通大學攜手農業部，啟動了這項數位保存計畫。
                </p>
              </div>
            </div>


            
            {/* 數據儀表板 */}
            <div className="grid grid-cols-2 gap-4">
              <StatsCard 
                icon={<Database />} 
                number="30+" 
                label="知識節點建檔" 
                sub="人物、事件、地景" 
              />
              <StatsCard 
                icon={<BookOpen />} 
                number="5" 
                label="主題教案模組" 
                sub="涵蓋環境與文化" 
              />
              <StatsCard 
                icon={<Users />} 
                number="3" 
                label="校園/社區合作" 
                sub="在地深耕推廣" 
              />
              <StatsCard 
                icon={<Network />} 
                number="100%" 
                label="數位化圖譜" 
                sub="視覺化關聯分析" 
              />
            </div>
          </div>
        </section>
  
  )
}
