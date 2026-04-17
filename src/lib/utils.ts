// 这个文件提供一个工具函数，用来合并 CSS 类名
// 在 Tailwind CSS 项目里经常需要动态拼接样式类名，这个函数让拼接更安全、更智能

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// cn 函数：合并多个 CSS 类名，自动处理冲突
// 例如：cn('text-red-500', condition && 'text-blue-500')
// 如果 condition 为 true，最终只会保留 text-blue-500（后面的覆盖前面的）
// 这在 shadcn/ui 组件库里被大量使用
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
