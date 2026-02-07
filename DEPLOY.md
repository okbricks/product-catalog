# 🚀 Vercel自动保存部署指南

## 快速开始（5分钟）

### 步骤1：部署到Vercel

1. **访问 [vercel.com](https://vercel.com)** 并登录（使用GitHub账号）
2. 点击 **"Add New..."** → **"Project"**
3. 导入你的仓库：`okbricks/product-catalog`
4. 点击 **"Deploy"**（使用默认设置即可）

部署完成后，你会得到一个类似 `https://your-project.vercel.app` 的域名。

### 步骤2：创建GitHub Personal Access Token

1. 访问：**https://github.com/settings/tokens**
2. 点击 **"Generate new token"** → **"Generate new token (classic)"**
3. 填写信息：
   - **Note**: `product-catalog-auto-save`
   - **Expiration**: 选择合适的时间（建议90天或No expiration）
   - **勾选权限**: ✅ **`repo`** (完整仓库访问权限)
4. 点击 **"Generate token"**
5. **⚠️ 重要：立即复制token**（只显示一次！）
   - 格式类似：`ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 步骤3：在后台配置Token

1. 打开你的Vercel部署地址：`https://your-project.vercel.app/admin.html`
2. 点击右上角 **"配置GitHub自动保存"** 按钮
3. 粘贴刚才复制的GitHub token
4. 点击确定
5. 看到 ✅ 提示表示配置成功

### 步骤4：测试自动保存

1. 在后台添加或编辑一个产品
2. 填写产品信息
3. 点击 **"保存产品"**
4. 应该会看到：**"✅ 产品已自动保存到GitHub！"**
5. 等待1-2分钟，访问你的GitHub Pages查看更新

---

## 🔧 可选：配置环境变量（如果需要自定义）

如果你的仓库名或分支名不同，可以在Vercel中配置：

1. 进入Vercel项目 → **Settings** → **Environment Variables**
2. 添加以下变量（可选）：

```
GITHUB_OWNER=okbricks          # 你的GitHub用户名
GITHUB_REPO=product-catalog    # 仓库名
GITHUB_BRANCH=main              # 分支名
```

默认值已经设置好了，一般不需要修改。

---

## 🐛 故障排除

### 问题1：提示"保存失败"

**可能原因：**
- GitHub token无效或过期
- Token没有 `repo` 权限
- 仓库不存在或无权限

**解决方法：**
1. 重新生成GitHub token，确保勾选了 `repo` 权限
2. 在后台重新配置token

### 问题2：API返回404

**可能原因：**
- Vercel部署未完成
- API路径错误

**解决方法：**
1. 检查Vercel部署状态
2. 确保 `api/` 文件夹在项目根目录
3. 重新部署

### 问题3：保存成功但GitHub Pages未更新

**可能原因：**
- GitHub Pages需要1-2分钟更新
- 缓存问题

**解决方法：**
1. 等待2-3分钟
2. 强制刷新浏览器（Ctrl+F5）
3. 检查GitHub仓库的commits，确认文件已更新

---

## 📝 工作原理

```
用户保存产品
    ↓
前端调用 /api/save-products
    ↓
Vercel Serverless Function
    ↓
GitHub API 提交到仓库
    ↓
GitHub Pages 自动更新（1-2分钟）
```

---

## ✅ 完成！

现在你可以：
- ✅ 在后台直接添加/编辑产品
- ✅ 自动保存到GitHub，无需手动操作
- ✅ 图片自动转换为base64保存
- ✅ GitHub Pages自动更新

享受自动化的便利吧！🎉
