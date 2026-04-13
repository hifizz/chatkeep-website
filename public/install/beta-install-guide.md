# ChatKeep Beta 手动安装指南（Chrome）

> 适用人群：测试版本体验用户（Beta）

## 1. 下载安装包

请从官网 Beta 安装页下载最新 ZIP：

- 页面地址：`https://dev.chatkeep.dev/install/beta`
- 按钮名称：`下载 Beta Chrome ZIP`

## 2. 解压 ZIP 文件

将下载好的 ZIP 解压到本地一个固定目录（建议不要后续移动该目录）。

## 3. 打开 Chrome 扩展页面

在浏览器地址栏输入：

```text
chrome://extensions
```

## 4. 启用开发者模式

打开页面右上角 `Developer mode`（开发者模式）。

## 5. 加载已解压扩展

点击 `Load unpacked`（加载已解压的扩展程序），选择第 2 步解压后的目录。

## 6. 验证安装是否成功

- 扩展列表中能看到 `ChatKeep`
- 可将 ChatKeep 固定到工具栏
- 打开支持的平台页面后可正常使用

## 常见问题

### Q1: 更新 Beta 版本要怎么做？

1. 在扩展页面移除旧版本
2. 重新下载最新 ZIP
3. 重新解压并 `Load unpacked`

### Q2: 为什么页面里的下载链接会变化？

下载链接来自自动化发布链路：每次 `develop` 分支发布成功并完成 `notify-server` 后，官网会自动同步到最新 Beta 包。

## 截图占位（后续可替换）

- ![Step 1: 下载页面截图](/install/images/step-1-download.png)
- ![Step 3: chrome extensions 页面](/install/images/step-3-extensions.png)
- ![Step 5: Load unpacked 按钮位置](/install/images/step-5-load-unpacked.png)
