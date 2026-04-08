# Share Dialog Tooltip 挂载与焦点复盘

## 背景

在 Share Dialog 新增免责声明 icon + tooltip 后，出现了两个可重复问题：

1. Dialog 打开瞬间 tooltip 自动展开。  
2. Content Script 场景下 tooltip 背景样式异常（看起来像“没有背景”）。

## Root Cause

### 1) 自动展开

- Dialog 打开时，焦点若默认落在 tooltip trigger（信息 icon）上，会触发 Radix Tooltip 的 focus 打开逻辑。  
- 结果是用户尚未主动交互，tooltip 已经展示。

### 2) 样式异常

- Dialog 在 Content Script 中通常挂载到 Shadow DOM 的专用容器。  
- Tooltip 若仍默认 Portal 到 `document.body`，会脱离 Dialog 所在样式上下文，导致 CSS 变量与层级不一致。  
- 结果可能表现为 tooltip 背景色、文字色或层级异常。

## 规则（必须执行）

1. Dialog 打开时显式处理 `onOpenAutoFocus`，将初始焦点放到非 tooltip trigger（例如关闭按钮）。  
2. TooltipContent 必须支持并使用与 Dialog 相同的 `portalContainer`。  
3. Tooltip 颜色样式应提供 CSS 变量 fallback，避免变量缺失时透明或不可读。  

## 检查清单

1. 打开 Dialog 首帧，tooltip 不可见。  
2. 鼠标 hover/focus 信息 icon 后，tooltip 才显示。  
3. Content Script + Shadow DOM 下，tooltip 背景和文字可读。  
4. tooltip 层级在 Dialog 之上且不跑位。  

## 备注

- 该文档用于跨仓库同步前端实现约束，避免后续在扩展端或网站端重复踩坑。  
