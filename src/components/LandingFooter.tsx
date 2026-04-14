'use client'

export function LandingFooter() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
              魔衣 MagicWear
            </h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              AI驱动的虚拟试衣工具，让购物更有信心。
              上传你的照片和服装图片，即刻预览试穿效果。
            </p>
            <p className="text-gray-500 text-sm">
              © 2025 魔衣 MagicWear. All rights reserved.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">产品</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  功能介绍
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  使用教程
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  更新日志
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">联系我们</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  反馈建议
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  商务合作
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  社交媒体
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
          <p>AI虚拟试衣工具 - 让购物更简单</p>
        </div>
      </div>
    </footer>
  )
}
