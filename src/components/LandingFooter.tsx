// 这是页脚组件
// 显示在网站最底部，包含：品牌介绍、产品链接、联系方式、版权信息
// 'use client' 表示这是客户端组件

'use client'

export function LandingFooter() {
  return (
    // 深色背景的页脚
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        {/* 四列网格布局：品牌介绍占2列，产品链接1列，联系方式1列 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* 品牌介绍区（占2列） */}
          <div className="md:col-span-2">
            {/* 品牌名：渐变色文字 */}
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
              魔衣 MagicWear
            </h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              AI驱动的虚拟试衣工具，让购物更有信心。
              上传你的照片和服装图片，即刻预览试穿效果。
            </p>
            {/* 版权信息 */}
            <p className="text-gray-500 text-sm">
              © 2025 魔衣 MagicWear. All rights reserved.
            </p>
          </div>

          {/* 产品链接列 */}
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

          {/* 联系方式列 */}
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

        {/* 底部分割线和版权文字 */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
          <p>AI虚拟试衣工具 - 让购物更简单</p>
        </div>
      </div>
    </footer>
  )
}
