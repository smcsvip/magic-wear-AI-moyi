# 魔衣 MagicWear - AI虚拟试衣工具

一个基于Next.js 16、TypeScript、Tailwind CSS和shadcn/ui构建的AI虚拟试衣工具。

## 功能特性

- ✅ 上传人物照片和服装图片
- ✅ 智能图片质量检测
- ✅ 模拟API试穿（可替换为真实API）
- ✅ 试穿结果展示和下载
- ✅ 会话内复用（人物图上传一次可连续试多件衣服）
- ✅ 响应式设计
- ✅ 错误处理

## 技术栈

- **前端框架**: Next.js 16 (App Router)
- **语言**: TypeScript 5
- **UI库**: React 19
- **样式**: Tailwind CSS 4
- **组件库**: shadcn/ui (Radix UI)
- **图标**: Lucide React
- **包管理器**: pnpm

## 快速开始

### 前置要求

- Node.js 18+ 
- pnpm

### 安装依赖

```bash
cd magic-wear
pnpm install
```

### 运行开发服务器

```bash
pnpm dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

### 构建生产版本

```bash
pnpm build
```

### 运行生产版本

```bash
pnpm start
```

## 项目结构

```
magic-wear/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/tryon/          # 试穿API路由
│   │   │   └── route.ts
│   │   ├── page.tsx             # 主页面
│   │   ├── layout.tsx           # 布局
│   │   └── globals.css          # 全局样式
│   ├── components/              # React组件
│   │   ├── ui/                 # shadcn/ui组件
│   │   ├── ImageUploader.tsx     # 图片上传组件
│   │   └── TryonResult.tsx      # 试穿结果组件
│   ├── lib/                    # 工具函数
│   │   ├── utils.ts             # 通用工具
│   │   ├── imageUtils.ts         # 图片处理工具
│   │   └── mockApi.ts          # 模拟API
│   └── types/                  # TypeScript类型定义
│       └── index.ts
├── public/                     # 静态资源
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 核心功能说明

### 1. 图片上传组件 (ImageUploader)

- 支持上传人物照片和服装图片
- 自动检测图片质量（分辨率、文件大小、比例等）
- 提供优化建议
- 实时预览上传的图片

### 2. 图片质量检测 (imageUtils)

检查以下指标：
- 分辨率（512-4096px）
- 文件大小（5KB-5MB）
- 图片比例（1:2到2:1）
- 给出质量评分和优化建议

### 3. 模拟API (mockApi)

- 模拟2秒延迟
- 返回随机示例图片
- 可替换为真实API（腾讯云/TryItOn）

### 4. 试穿结果组件 (TryonResult)

- 显示加载状态
- 展示试穿结果
- 支持下载结果图片
- 支持重新试穿

## 接入真实API

### 腾讯云混元换装API

修改 `src/app/api/tryon/route.ts`：

```typescript
import { TencentCloudClient } from '@tencentcloud/sdk-nodejs'

const client = new TencentCloudClient({
  credential: {
    secretId: process.env.TENCENT_SECRET_ID,
    secretKey: process.env.TENCENT_SECRET_KEY,
  },
  region: 'ap-guangzhou',
})

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const personImage = formData.get('personImage') as File
  const clothesImage = formData.get('clothesImage') as File

  const result = await client.call('ChangeClothes', {
    ModelUrl: personImageUrl,
    ClothesUrl: clothesImageUrl,
    ClothesType: 'Upper-body',
    RspImgType: 'url'
  })

  return NextResponse.json({
    success: true,
    imageUrl: result.ResultImage,
    message: '试穿成功'
  })
}
```

### TryItOn API

修改 `src/lib/mockApi.ts`：

```typescript
export async function mockTryonApi(personImage: File, clothesImage: File): Promise<TryonResponse> {
  const formData = new FormData()
  formData.append('model_image', await fileToBase64(personImage))
  formData.append('garment_image', await fileToBase64(clothesImage))

  const response = await fetch('https://tryiton.now/api/v1/tryon/clothes', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.TRYITON_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model_image: await fileToBase64(personImage),
      garment_image: await fileToBase64(clothesImage),
      mode: 'balanced'
    })
  })

  const data = await response.json()
  
  return {
    success: true,
    imageUrl: data.output[0],
    message: '试穿成功'
  }
}
```

## 环境变量

创建 `.env.local` 文件：

```env
# 腾讯云API密钥
TENCENT_SECRET_ID=your_secret_id
TENCENT_SECRET_KEY=your_secret_key

# TryItOn API密钥
TRYITON_API_KEY=your_api_key
```

## 开发计划

### V1 MVP（已完成）

- [x] 搭建Next.js项目框架
- [x] 配置TypeScript和Tailwind CSS
- [x] 安装shadcn/ui组件库
- [x] 实现图片上传组件
- [x] 实现图片质量检测
- [x] 实现模拟API
- [x] 实现试穿结果展示
- [x] 实现会话内复用
- [x] 实现结果下载功能
- [x] 基础错误处理
- [x] 响应式设计

### V2版本（后续）

- [ ] 用户注册/登录系统
- [ ] 用户身份区分（商家/消费者）
- [ ] 历史记录和收藏功能
- [ ] 免费增值商业模式
- [ ] 数据统计和分析
- [ ] 接入真实AI服务

### V3版本（后续）

- [ ] 批量生成功能
- [ ] 高级图片编辑
- [ ] 社交分享功能
- [ ] 移动端支持
- [ ] 智能AI路由

## 常见问题

### Q: 如何更换真实API？

A: 修改 `src/app/api/tryon/route.ts` 和 `src/lib/mockApi.ts`，参考上面的接入真实API部分。

### Q: 图片上传失败怎么办？

A: 检查图片格式是否为JPG/PNG，文件大小是否在5KB-5MB之间。

### Q: 试穿结果不理想怎么办？

A: 可以点击"重新试穿"按钮，系统会重新生成结果。

### Q: 如何部署到生产环境？

A: 使用 `pnpm build` 构建后，部署到Vercel、Netlify等平台。

## 许可证

MIT License

## 联系方式

- 项目地址: [GitHub](https://github.com/yourusername/magic-wear)
- 问题反馈: [Issues](https://github.com/yourusername/magic-wear/issues)

---

**魔衣 MagicWear - 让AI试衣变得简单**
