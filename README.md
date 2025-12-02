# 动态博客主页

这是一个使用纯静态资源（HTML/CSS/JS）实现的动态博客主页示例。功能包含：

- 从 `posts.json` 加载文章数据
- 关键字搜索
- 标签过滤
- 分页（每页 5 篇）
- 暗色/浅色主题切换（保存在 `localStorage`）

文件说明：

- `index.html`：主页
- `styles.css`：样式
- `script.js`：前端交互逻辑
- `posts.json`：文章数据示例

如何本地查看：


1.  直接打开 `index.html`（某些浏览器会限制 `fetch` 本地文件，若出现问题请用下面方法）。

2. 使用简单的 HTTP 服务器（推荐）：

```powershell
# 在 e:\Blog 目录执行：
python -m http.server 8000
```

然后在浏览器打开 `http://localhost:8000`。

3. 在 VS Code 中安装并使用 `Live Server` 扩展也非常方便。

部署到 GitHub Pages（用户名仓库名为 `justki/github.io`）：

1. 在本地仓库中初始化或切换到 `main` 分支：

```powershell
cd e:\Blog
git init
git branch -M main
git remote add origin git@github.com:justki/justki.github.io.git
git add .
git commit -m "Initial blog for GitHub Pages"
git push -u origin main
```

2. 在 GitHub 仓库页面中确认仓库名为 `justki.github.io`（这是用户/组织 Page 的要求），GitHub Pages 会自动使用 `main` 分支根目录作为站点源。

3. 若需要自定义域名，请在仓库根目录添加 `CNAME` 文件，内容为你的域名。

4. 本地预览：推送后，等待几分钟访问 `https://justki.github.io` 验证。

注意与后续扩展：
- 如果你想写 Markdown 源文件并在构建时转换为 `posts.json`，可以用简单脚本（Node/Python）生成 `posts.json`。
- 如需 RSS、搜索索引或评论等，可在后续添加。

