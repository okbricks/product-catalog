# 自动保存到GitHub配置指南

## 🚀 方案一：Vercel + GitHub API（推荐）

### 优势
- ✅ 保存产品时自动提交到GitHub，无需手动操作
- ✅ 图片自动上传到GitHub仓库
- ✅ 完全自动化，体验流畅

### 部署步骤

#### 1. 部署到Vercel

1. 访问 [Vercel](https://vercel.com) 并登录（可用GitHub账号）
2. 点击 "New Project"
3. 导入你的GitHub仓库 `okbricks/product-catalog`
4. 点击 "Deploy"

#### 2. 配置环境变量

在Vercel项目设置中添加环境变量：

1. 进入项目 → **Settings** → **Environment Variables**
2. 添加以下变量：

```
GITHUB_OWNER=okbricks
GITHUB_REPO=product-catalog
GITHUB_BRANCH=main
```

#### 3. 创建GitHub Personal Access Token

1. 访问 https://github.com/settings/tokens
2. 点击 **"Generate new token (classic)"**
3. 填写名称，例如：`product-catalog-auto-save`
4. 勾选权限：**`repo`** (完整仓库权限)
5. 点击 **"Generate token"**
6. **复制生成的token**（只显示一次，请保存好）

#### 4. 在后台配置Token

1. 打开你的网站后台：`https://你的域名/admin.html`
2. 点击右上角 **"配置GitHub自动保存"** 按钮
3. 粘贴刚才复制的GitHub token
4. 点击确定

#### 5. 测试

1. 在后台添加或编辑一个产品
2. 点击"保存产品"
3. 应该会看到 "✅ 产品已自动保存到GitHub！" 的提示
4. 等待1-2分钟，GitHub Pages会自动更新

### 工作原理

- 保存产品时，前端调用 `/api/save-products` API
- Vercel Serverless Function 通过GitHub API自动提交到仓库
- GitHub Pages 自动检测到更新并重新部署

---

## 🗄️ 方案二：Supabase（更简单，无需GitHub操作）

如果你想要更简单的方案，可以使用Supabase作为数据库。

### 优势
- ✅ 无需GitHub token
- ✅ 实时保存，无需等待
- ✅ 免费额度充足

### 快速开始

1. 访问 [Supabase](https://supabase.com) 注册账号
2. 创建新项目
3. 在SQL Editor中运行：

```sql
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  set_number TEXT,
  category TEXT NOT NULL,
  tags JSONB,
  image TEXT,
  prices JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

4. 在Settings → API中获取：
   - Project URL
   - anon/public key

5. 修改 `js/admin.js` 使用Supabase客户端

需要我帮你实现Supabase方案吗？

---

## 📝 当前方案说明

目前代码已支持**方案一（Vercel + GitHub API）**：

- ✅ API端点已创建：`api/save-products.js` 和 `api/upload-image.js`
- ✅ 前端自动保存功能已集成
- ✅ GitHub Token配置界面已添加

只需按照上面的步骤部署到Vercel并配置即可使用！
