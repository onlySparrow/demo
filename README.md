# 统一待办 · PC 端（@unified-todo/pc）

多业务系统工单的统一入口应用：把各来源系统的待办、待接单、已办、待阅、已阅、由我发起、个人效能等工单聚合到一屏完成流转，无需在多个业务系统间来回切换。

- **技术栈**：React 19 + TypeScript 6 + Vite 8 + antd 6 + SCSS Modules + Zustand + ECharts
- **包管理**：pnpm
- **本地端口**：`3003`（被占用时 Vite 自动顺延到 `3004`）

---

## 1. 环境要求

| 运行环境 | 版本 | 说明 |
| --- | --- | --- |
| **Node.js** | **≥ 22.x**（本仓库开发验证版本：**v22.23.1**） | Vite 8 需要 Node 20.19+ / 22.12+，建议使用 Node 22 LTS |
| **pnpm** | **≥ 12.x**（本仓库开发验证版本：**12.11.2**） | 请勿使用 npm / yarn，避免 `node_modules` 结构不一致 |

查看本机版本：

```bash
node -v   # 期望 v22.x
pnpm -v   # 期望 12.x
```

> 若需要切换 Node 版本，可使用 `nvm` / `fnm`：`nvm use 22`。

安装 pnpm（任选其一）：

```bash
npm install -g pnpm        # npm 全局安装
corepack enable pnpm       # Node 自带 corepack（Node ≥ 22.14 默认含 pnpm 10+）
```

---

## 2. 快速开始

```bash
# 1) 安装依赖
pnpm install

# 2) （可选）准备环境变量
cp .env.example .env

# 3) 启动开发服务器
pnpm dev
```

启动后终端会输出访问地址，默认：

- 本地：`http://localhost:3003/`
- 局域网：`http://<你的内网 IP>:3003/`（`--host 0.0.0.0` 已开启）

> **端口被占用时** Vite 会提示 `Port 3003 is in use, trying another one...` 并自动改用下一个可用端口（如 `3004`），以终端实际输出为准。

### 可用脚本

| 命令 | 作用 |
| --- | --- |
| `pnpm dev` | 启动开发服务器（`vite --host 0.0.0.0 --port 3003`） |
| `pnpm build` | 类型检查 + 生产构建（产物目录 `todoweb/`） |
| `pnpm build:pack` | 构建并打成 `todoweb.zip` / `todoweb.tar.gz` 交付包 |
| `pnpm preview` | 本地预览构建产物 |
| `pnpm typecheck` | 仅运行 `tsc -b` 类型检查 |
| `pnpm lint` | 代码检查（当前等价于 `pnpm typecheck`，即 `tsc -b`） |

---

## 3. 环境变量

复制 `.env.example` 为 `.env` 后按需修改：

```bash
# API Gateway Base URL
VITE_API_BASE_URL=/api

# 百度地图 Web API Key（可选，留空使用内置演示 Key）
VITE_BAIDU_MAP_AK=
```

说明：当前 `src/utils/request.ts` 中 axios 的 `baseURL` 硬编码为 `/platform/api`，开发态由 `vite.config.ts` 的代理转发；如需以环境变量覆盖，需同步调整该处取值。

---

## 4. 数据来源：本地 mock（当前）与真实后端

**当前全部 6 个模块（待办 / 待接单 / 已办 / 待阅·已阅 / 由我发起 / 个人效能）均接入本地 mock 数据源**，无需后端即可完整演示：列表、筛选、分页、批量通过驳回、接单、标记已阅、转派、催办撤回、发起工单、效能统计与导出等全链路可跑。

mock 文件在仓库根目录的 `mockApi/` 下，与模块一一对应：

| 模块 | 接口入口（页面只 import 这里） | mock 实现 |
| --- | --- | --- |
| 待办 | `src/api/todo.ts` | `mockApi/todoMock.ts` |
| 待接单 | `src/api/pendingOrder.ts` | `mockApi/pendingOrderMock.ts` |
| 已办 | `src/api/done.ts` | `mockApi/doneMock.ts` |
| 待阅 / 已阅 | `src/api/notice.ts` | `mockApi/noticeMock.ts` |
| 由我发起 | `src/api/initiated.ts` | `mockApi/initiatedMock.ts` |
| 个人效能 | `src/api/performance.ts` | `mockApi/performanceMock.ts` |

设计要点：**页面与组件一律只 import `src/api/*`，不直接 import `mockApi/`**。`src/api/*` 保留全部类型定义（作为单一类型来源），函数体委托给对应 mock。

> **切回真实接口**：把 `src/api/*` 里各函数的实现换回 axios 调用（`get` / `post`，签名与函数名不变）即可，调用方零改动。真实接口路径仍记录在各文件的注释里。

其他说明：

- `mockApi/` 位于仓库根目录、不在 `tsconfig.app.json` 的 `include`（仅含 `src`）内，但会被 `src/api/*` 传递引用，因此**同样参与类型检查**。
- 待办 mock 的 SLA 字段（`remainingTime` / `remainingHours` / `deadline`）按当前时间实时推算，演示数据不会随日期流逝而失真。
- 侧边栏角标数量在启动时并行调用各列表接口取 `total`（见 `src/store/menuBadgeStore.ts`）；已阅与个人效能无待处理语义，不设角标。

### 4.1 真实后端代理

`vite.config.ts` 配置了开发期代理，统一指向后端网关 `http://123.56.224.156:3001`（切回真实接口后生效）：

| 前端路径 | 转发目标 | 说明 |
| --- | --- | --- |
| `/platform/**` | `http://123.56.224.156:3001/platform/**` | 网关原样路径（`baseURL = /platform/api` 对应的入口） |
| `/api/**` | `http://123.56.224.156:3001/platform/api/**` | 兼容旧 `/api` baseURL |

响应头会附带 `x-real-url`，便于调试确认真实转发地址。

---

## 5. 目录结构

```
demo/
├── index.html
├── vite.config.ts            # base / 产物目录 / 代理 / 别名(@)
├── tsconfig.json             # 工程引用(app + node)
├── tsconfig.app.json         # 应用侧类型检查与路径别名
├── .env.example
├── mockApi/                  # 本地演示数据源（根目录；由 src/api/* 委托调用，参与类型检查）
├── doc/                      # 需求/接口文档、测试用例
└── src/
    ├── main.tsx              # 应用入口
    ├── App.tsx
    ├── router.tsx            # 路由树（菜单走 BasicLayout，404 兜底）
    ├── routes.ts             # 路由地址表（与 menuConfig 单一来源）
    ├── theme.ts              # antd 主题令牌
    ├── assets/               # icons（svg 走 svgr）/ styles（_tokens.scss 设计令牌）
    ├── components/
    │   ├── AppErrorBoundary.tsx
    │   └── BaseList/         # 通用列表壳：标题 / 筛选插槽 / 行勾选 / 底部分页 / 批量条
    ├── layouts/
    │   ├── BasicLayout.tsx   # 主框架（侧栏 + 顶栏 + <Outlet/>）
    │   ├── HeaderSlot.tsx    # 页面向顶栏投放内容的插槽
    │   ├── menuConfig.tsx    # 左侧菜单配置
    │   └── components/       # AppSidebar / AppHeader / HeaderTabs
    ├── pages/                # 页面目录（目录名见下，入口统一为 index.tsx）
    │   ├── todo/             # 待办
    │   ├── pendingAccept/    # 待接单
    │   ├── done/             # 已办
    │   ├── pendingRead/      # 待阅
    │   ├── read/             # 已阅
    │   ├── createdByMe/      # 由我发起
    │   └── performance/      # 个人效能
    ├── api/                  # 各模块接口入口（类型单一来源；实现委托 mockApi/）
    ├── store/                # Zustand（menuBadgeStore 菜单角标）
    └── utils/                # request(axios 封装) / auth(token 与 401 处理)
```

---

## 6. 路由与功能模块

| 路由 | 模块 |
| --- | --- |
| `/todo` | 待办工单（列表模式 + 地图模式，经 `?tab=map` 切换） |
| `/pending-order` | 待接单 |
| `/done` | 已办 |
| `/unread-notice` | 待阅通知 |
| `/read-notice` | 已阅通知 |
| `/initiated` | 由我发起 |
| `/performance` | 个人效能 |

`/` 会重定向到 `/todo`；未匹配路径渲染 404 兜底页。

**列表交互约定**（见 `src/components/BaseList`）：

- 分页只保留底部经典分页器（页码 + 每页条数切换），无上拉加载。
- 标题行仅提供「全选」复选框，作用范围为**当前页**；翻页 / 切换每页条数会清空勾选并重置全选态。
- 有勾选项时从内容区底部弹出通栏批量操作条。

---

## 7. 构建与部署

```bash
pnpm build:pack
```

- 构建产物目录：`todoweb/`（每次构建自动清空，整目录替换服务器内容即可）
- 构建时 `base` 为 `/unifiedTodo/`，对应 nginx 站点子路径 `/unifiedTodo`
- `build:pack` 会额外产出 `todoweb.zip` / `todoweb.tar.gz`

部署后注意 nginx 需同时配置 SPA `try_files` 回退与 `/platform/api`（或 `/api`）接口代理；若接口返回 HTML（`index.html`），`request.ts` 会直接报错而非把脏数据渲染进列表。

---

## 8. 开发规范提示

- 路径别名 `@` → `src`（`vite.config.ts` + `tsconfig.app.json` 同步配置，改一处需两处一起改）。
- 样式统一通过 `@use '../assets/styles/tokens' as *;`（按文件深度调整相对层级）引入设计令牌，色号变更请与 `src/theme.ts` 同步。
- 代码风格检查以 `pnpm lint`（即 `tsc -b`）为准，提交前请先跑通。
