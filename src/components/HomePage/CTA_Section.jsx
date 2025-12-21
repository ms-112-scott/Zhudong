import React from "react";
import { Button } from "../helper/Button";

export function CTA_Section({}) {
  return     (
      <section className="py-24 px-6 text-center bg-linear-to-r from-surface-200 via-surface-100 to-surface">
        <h2 className="text-3xl md:text-5xl font-bold text-fg mb-8">
          加入我們，一起拼湊歷史的拼圖
        </h2>
        <p className="text-xl text-fg/80 mb-10 max-w-2xl mx-auto">
          無論您是在地居民、學校教師，或是對林業文化感興趣的研究者，
          這份知識圖譜都需要您的參與。
        </p>
        <Button className="bg-white text-dark hover:bg-gray-100 hover:text-fg">
          參與工作坊報名
        </Button>
      </section>
  )
}
  