# 力与触觉 VLA 研究地图

一个不依赖构建工具的静态研究导航网站。默认聚焦“末端六维力 + 夹爪”，可切换查看触觉、灵巧手、全身控制及相邻路线。

功能包括分类地图、六维度工作对照、搜索与筛选、最多三项并排比较、benchmark使用关系、逐实验目的与指标、一手来源及原始调研文档下载。

## 数据与本地预览

在本目录执行：

```powershell
python prepare_data.py
node check.mjs
node --check dist/app.js
python -m http.server 8765 --bind 127.0.0.1 --directory dist
```

访问 http://127.0.0.1:8765/ 。也可直接打开 dist/index.html；浏览器剪贴板功能可能需要 HTTP 或 HTTPS。

prepare_data.py 从上级目录的四份 Markdown 调研文档整理笔记，结合结构化字段生成 dist/data.js，并复制文档至 dist/documents/。原文数据快照为2026-10-15，不是实时排名或已完成实验复现声明。

## 文件

- dist/index.html：入口
- dist/styles.css：响应式样式
- dist/app.js：交互和关系视图
- dist/data.js：生成的研究目录
- prepare_data.py：目录与证据维护
- check.mjs：目录、六个字段与方向性引用校验

本站将原论文采用、自建任务、场景衍生、后续重新评测分开。未核验公开情况不等于未公开，任务同名不等于共享benchmark。界面不比较不同任务/硬件的成功率高低。
