// 这个文件定义了整个项目中使用的 TypeScript 类型（接口）
// TypeScript 的接口就像一个"合同"，规定了数据必须有哪些字段和类型
// 把类型集中放在这里，方便多个文件共用

// TryonRequest：发起试穿请求时需要的数据
export interface TryonRequest {
  personImage: File   // 人物照片文件
  clothesImage: File  // 服装图片文件
}

// TryonResponse：试穿 API 返回的响应数据
export interface TryonResponse {
  success: boolean  // 是否成功
  imageUrl: string  // 试穿结果图片的 URL
  message: string   // 提示信息（成功或失败的描述）
}

// ImageQuality：图片质量检测的结果
export interface ImageQuality {
  score: number        // 质量评分（0-100）
  issues: string[]     // 发现的问题列表（比如"分辨率过低"）
  suggestions: string[] // 优化建议列表（比如"建议使用512x512以上的图片"）
}

// TryonState：首页试穿功能的完整状态
// 这个接口描述了 useState 里存储的所有数据
export interface TryonState {
  personImage: File | null          // 人物照片文件（null 表示还没上传）
  clothesImage: File | null         // 服装图片文件
  personImagePreview: string | null // 人物照片的预览 URL（用于在页面上显示）
  clothesImagePreview: string | null // 服装图片的预览 URL
  resultImage: string | null        // AI 生成的试穿结果图片 URL
  isLoading: boolean                // 是否正在生成中（true 时显示加载动画）
  error: string | null              // 错误信息（null 表示没有错误）
}

// TryonHistoryItem：一条试穿历史记录
// 用于在首页的"历史记录"面板中显示
export interface TryonHistoryItem {
  id: string                  // 唯一标识符（用时间戳生成）
  personImagePreview: string  // 当时使用的人物照片预览
  clothesImagePreview: string // 当时使用的服装图片预览
  resultImage: string         // 当时生成的结果图片 URL
  timestamp: Date             // 试穿时间
}
