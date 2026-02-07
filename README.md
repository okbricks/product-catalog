# 静态产品目录

类似 [Lepin 目录](https://lepin.vercel.app/) 的静态产品展示站，纯前端，可部署到 **GitHub Pages**（免费用量友好）。

## 功能

- 产品网格展示（名称、分类、1 set / 50 set 价格）
- 搜索（支持 ⌘K / Ctrl+K 聚焦）
- 按分类 / 标签筛选
- 网格 / 全幅切换
- **管理后台**：可视化添加/编辑产品、上传图片、导出数据（仿 [exif-photo-blog](https://github.com/sambecker/exif-photo-blog) 后台流程）
- 响应式，移动端可用

## 本地预览

用任意静态服务器打开项目根目录即可，例如：

```bash
# 若已安装 Node
npx serve .

# 或 Python
python -m http.server 8080
```

浏览器访问 `http://localhost:8080`（端口按实际为准）。

## 部署到 GitHub Pages

### 方式一：从仓库根目录发布（推荐）

1. 在 GitHub 新建仓库，把当前项目推上去（包含 `index.html`、`css/`、`data/`、`js/`）。
2. 仓库 → **Settings** → **Pages**。
3. **Source** 选 **Deploy from a branch**。
4. **Branch** 选 `main`（或你的默认分支），**Folder** 选 **/ (root)**。
5. 保存后等一两分钟，访问：`https://<你的用户名>.github.io/<仓库名>/`。

### 方式二：用 `docs` 目录

1. 把 `index.html`、`css/`、`data/`、`js/` 都放进仓库里的 **`docs`** 文件夹。
2. Settings → Pages → Source 选 **Deploy from a branch**，Branch 选 `main`，Folder 选 **/docs**。
3. 访问：`https://<你的用户名>.github.io/<仓库名>/`。

## 管理后台（可视化更新产品）

打开 **`admin.html`**（或访问站点下的 `/admin.html`）即可使用后台，风格参考 [exif-photo-blog](https://github.com/sambecker/exif-photo-blog) 的 `/admin`。

- **登录**：若在 `admin.html` 里设置了 `window.ADMIN_PASSWORD = '你的密码'`，打开后台会先要求输入密码；留空则无需密码。
- **添加/编辑产品**：填写产品名称、型号、1 set 价格、50 set 价格、分类、标签，图片可填外链 URL 或本地上传。
- **产品列表**：表格中可编辑、删除；**导出 products.json** 下载当前数据；**导出图片包 (ZIP)** 会打包本地上传的图片到 `images/`，解压后放进仓库即可。
- **更新到线上**：在后台改好后点击「导出 products.json」，用下载的 `products.json` 覆盖 `data/products.json`；若有本地上传的图，再点击「导出图片包」解压出 `images/` 文件夹，一并提交推送。

### 手动编辑数据文件

单条产品格式：

| 字段 | 必填 | 说明 |
|------|------|------|
| `id` | 是 | 唯一字符串 |
| `title` | 是 | 产品名称 |
| `image` | 是 | 图片 URL 或相对路径 `images/xxx.jpg` |
| `category` | 是 | 分类（用于筛选与展示） |
| `tags` | 否 | 标签数组，如 `["LEPIN", "建筑"]` |
| `setNumber` | 否 | 型号/编号 |
| `price1` | 否 | 1 set 价格（元） |
| `price50` | 否 | 50 set 价格（元） |

示例：

```json
{
  "id": "11",
  "title": "新套装名称",
  "setNumber": "21345",
  "image": "images/11.jpg",
  "category": "星球大战",
  "tags": ["创意", "Ideas"],
  "price1": "128",
  "price50": "98"
}
```

### 本地预览

改完保存后，在项目根目录执行：

```bash
npx serve .
```

浏览器打开提示的地址，刷新即可看到更新。

### 更新到 GitHub Pages

若站点已部署在 GitHub Pages，更新产品只需：

1. 修改并保存 `data/products.json`（若有新图，把图片也放进仓库并提交）。
2. 提交并推送：
   ```bash
   git add data/products.json
   git add images/   # 如有新增或修改的图片
   git commit -m "更新产品列表"
   git push
   ```
3. 等 1～2 分钟，打开你的 `https://<用户名>.github.io/<仓库名>/` 刷新即可。

不需要重新配置 Pages，推送后会自动重新发布。

## 文件说明

| 路径 | 说明 |
|------|------|
| `index.html` | 前台首页 |
| `admin.html` | 管理后台（添加/编辑产品、上传图片、导出） |
| `css/style.css` | 前台样式 |
| `css/admin.css` | 后台样式 |
| `js/app.js` | 前台：加载数据、搜索、分类/标签筛选、渲染 |
| `js/admin.js` | 后台：表单、列表、导出 JSON/ZIP |
| `data/products.json` | 产品列表数据 |
| `.nojekyll` | 让 GitHub Pages 按静态站发布 |

部署后通过 **admin.html** 或直接改 **data/products.json** 更新产品，推送即可生效。
