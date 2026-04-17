// 用户名校验工具函数
// 这个文件被前端（注册页）和后端（注册/登录接口）共同使用
// 统一放在这里，避免前后端规则不一致

// 用户名规则说明：
// - 只允许英文字母（a-z A-Z）和数字（0-9）
// - 长度 4 ~ 16 位
// - 不能是纯数字（至少包含一个字母）
// - 不区分大小写，统一转小写存储

// 正则表达式解读：
// ^ 和 $ 表示从头到尾完整匹配
// (?=.*[a-zA-Z]) 是"前瞻断言"，意思是：字符串里必须至少有一个字母
// [a-zA-Z0-9]{4,16} 表示：只允许字母和数字，长度 4 到 16 位
export const USERNAME_REGEX = /^(?=.*[a-zA-Z])[a-zA-Z0-9]{4,16}$/

// validateUsername：校验用户名是否符合规则
// 参数：用户输入的用户名字符串
// 返回：如果不合法，返回错误提示文字；如果合法，返回 null
// 注意：传入前不需要先 normalize，这里会处理
export function validateUsername(username: string): string | null {
  // 空值检查
  if (!username || !username.trim()) return '用户名不能为空'

  const trimmed = username.trim()

  // 长度检查（先检查长度，给用户更明确的提示）
  if (trimmed.length < 4) return '用户名至少 4 位'
  if (trimmed.length > 16) return '用户名最多 16 位'

  // 字符检查：是否包含非字母非数字的字符（空格、特殊符号、emoji 等）
  if (!/^[a-zA-Z0-9]+$/.test(trimmed)) return '用户名只能包含字母和数字，不能有空格或特殊符号'

  // 纯数字检查：必须至少包含一个字母
  if (/^[0-9]+$/.test(trimmed)) return '用户名不能是纯数字，至少包含一个字母'

  // 全部通过，返回 null 表示合法
  return null
}

// normalizeUsername：标准化用户名
// 去掉首尾空格，并转成全小写
// 注册时存入数据库前调用，登录时查库前调用
// 这样 "ABC123" 和 "abc123" 会被当作同一个账号
export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase()
}
