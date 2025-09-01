# Xingliu Canvas V2

## 项目简介

`xingliu-canvas-v2` 是在原有无限画布项目的基础上迭代而来的新版本，旨在提供类似
星流 AI 的体验：在画布内集成 AI 生成器、批量候选图及一键采纳图层。项目包含
前后端完整代码，遵循 Airbnb JavaScript 风格指南，并内置 ESLint/Prettier 配置。

主要特点包括：

- **生成器面板**：用户可以在左侧面板选择基础模型、输入提示词、调整尺寸及数量，点击生成后系统异步调用后台生成任务并轮询结果，生成的候选图会出现在下方列表。
- **一键采纳候选图**：生成完成后，候选图将在 “生成结果” 区域列出，点击任意图片即可将其作为新图层添加到画布。
- **素材管理与画布编辑**：保留了素材上传/拖拽到画布的功能，支持图层拖动与保存；生成的新图与素材图层交互保持一致。
- **简易异步队列**：后端用内存模拟任务队列，在真实部署中可替换为 Redis + BullMQ，并通过 ComfyUI 调用实际模型生成。
- **OpenAPI 文档**：所有接口均附有 swagger 注释，启动后访问 `/api-docs` 查看文档。

## 文件结构

```
xingliu-canvas-v2/
├── client/                  # 前端 (React + Vite)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js       # 监听 127.0.0.1:3000，代理 /api 与 /uploads 到 127.0.0.1:4000
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── api.js           # Axios 实例，自动附加 JWT
│       ├── context/
│       │   └── AuthContext.jsx
│       └── components/
│           ├── Login.jsx
│           ├── Register.jsx
│           ├── ProjectList.jsx
│           ├── CanvasEditor.jsx
│           ├── GeneratorPanel.jsx  # 新增：生成器面板
│           └── ResultDock.jsx      # 新增：生成结果列表
├── server/                  # 后端 (Node.js + Express + MongoDB)
│   ├── index.js
│   ├── .env.example         # 环境变量示例（端口、Mongo 连接、JWT 密钥、ComfyUI API）
│   ├── package.json
│   ├── config/db.js
│   ├── controllers/
│   │   ├── aiController.js  # 更新：包含 getModels、generateImage、getJobStatus
│   │   ├── authController.js
│   │   ├── assetsController.js
│   │   └── projectsController.js
│   ├── middleware/auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Asset.js
│   └── routes/
│       ├── ai.js            # 更新：新增 /models、/job/:id 路由
│       ├── auth.js
│       ├── assets.js
│       └── projects.js
└── README.md
```

## 环境准备

1. 安装 Node.js（建议 v18 或以上）和 MongoDB，并确保本地 Mongo 服务正在运行。
2. 进入 `server/` 目录，复制 `.env.example` 为 `.env` 并根据需要修改配置项：
   - `PORT`：后端端口（默认为 4000）
   - `MONGO_URI`：MongoDB 连接字符串
   - `JWT_SECRET`：JWT 签名密钥
   - `COMFYUI_API_URL`：可选，配置 ComfyUI 服务地址；若留空将返回占位图片
3. 安装后端依赖并启动服务器：

   ```bash
   cd server
   npm install
   npm run dev
   ```

4. 进入 `client/` 目录，安装依赖并启动 Vite 开发服务器：

   ```bash
   cd ../client
   npm install
   npm run dev -- --host 127.0.0.1 --port 3000
   ```

5. 浏览器访问 `http://127.0.0.1:3000`，登陆后创建项目即可体验新版画布编辑与 AI 生成。

## 使用说明

1. **登录/注册**：与原版一致，通过 `Register` 页面注册后在 `Login` 页面登录。
2. **创建项目**：进入 `Projects` 页面点击 “New Project” 按钮，输入标题即可创建。
3. **编辑画布**：在项目列表点击项目名称进入编辑页面；左侧包含三部分：
   - **素材库**：上传图片后会显示在列表，点击即可拖入画布。
   - **生成器**：设置模型、提示词、尺寸和批量数量后点击“生成”；系统会异步创建任务并轮询状态，生成的结果会显示在下方。
   - **生成结果**：列出本次生成的所有候选图，点击某个结果便会在画布中新增一个图层。
4. **保存项目**：完成布局后点击画布下方的“保存项目”按钮，服务器会存储当前图层结构以便后续继续编辑。

## 进一步开发方向

此版本主要展示了如何将生成器与画布编辑结合起来，未来可以基于此进一步扩展：

- 使用 Redis + BullMQ 替换内存队列，实现更可靠的任务调度；
- 调用真实的 ComfyUI 工作流，支持模型选择、LoRA 叠加、种子控制、局部修复与全局融合；
- 引入图层面板（隐藏/锁定/排序/分组）、吸附对齐、网格、协作评论等高级功能；
- 推出移动端或小程序适配，让用户在多端创作。

欢迎在此基础上继续迭代完善，打造面向未来的 AI 创意设计平台！