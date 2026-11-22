# 硬件屋 ChipLand · 键盘附魔研究所

一个纯静态的单页品牌站，无需安装或构建。

## 预览

直接双击 `index.html` 即可打开。

如果浏览器对本地文件的剪贴板权限有限制，可以在当前目录运行：

```bash
python3 -m http.server 8000
```

然后访问 <http://localhost:8000>。

## 文件结构

```text
.
├── index.html          # 页面内容与文案
├── assets/
│   ├── site.css        # 全部样式与响应式布局
│   ├── site.js         # 导航、滚动动效、预约弹窗、复制地址/预约暗号
│   └── img/            # 18 张作品/空间照片（jpg + webp）+ 店铺地图 + 4 个 logo 文件
├── preview.jpg         # 首屏预览图
├── preview-drops.jpg   # 新作上架区域预览图
├── preview-repair.jpg  # 维修服务区域预览图
├── preview-visit.jpg   # 到店区域预览图
├── preview-booking.jpg # 预约弹窗预览图
├── preview-builds.jpg  # 新增作品区域预览图
└── README.md
```

## 想改哪里

- **文案 / 价格 / 作品名称**：编辑 `index.html`。
- **品牌色 / 字体 / 间距**：编辑 `assets/site.css` 顶部的 `:root` 变量。
- **照片**：替换 `assets/img/` 中的同名文件即可；每个 `<picture>` 同时提供 webp 与 jpg。新增作品可在 `.drops__grid` 里继续复制 `.drop-card`。
- **电话 / 地址 / 预约信息**：在 `index.html` 中搜索 `18810080327` 或 `望京东园`；弹窗文案和到店区域会同步修改。

## 已包含

- 响应式布局：桌面 / 平板 / 手机（含 320px 小屏）
- 本命作品陈列 + 新作上架（移动端可横向滑动）
- 新增 Wooting 60HE V2 石中剑、夜魔 × 明日香作品
- 「预约到店」弹窗：电话、地址、地图、复制地址
- 到店区域直接展示地址/电话，底部保留「复制预约暗号」
- 已移除旧价目表页面
- 品牌信息更新为「硬件屋 ChipLand · 北京」，使用店主提供的正式 logo 套件
- 新增「维修服务」板块，使用维修专用 logo
- 移动端全屏菜单、键盘焦点管理
- 滚动进入动效、图片懒加载、作品卡悬停切换细节图
- 预约弹窗支持一键复制地址；不支持剪贴板时会显示提示
- 对 `prefers-reduced-motion` 的动效降级
