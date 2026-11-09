# Rewind for X 手工安装指南

适用：电脑上的 Google Chrome。无需 Node.js、构建工具或 Chrome 网上应用店账号。

## 安装

1. 从 https://github.com/lisihao/rewind-for-x/releases/latest 的 **Assets** 下载 `rewind-for-x-<版本>.zip`，不要下载 Source code。
2. 将 ZIP 解压到一个长期保留的文件夹。安装后 Chrome 仍会读取这个文件夹，请勿删除或移动。
3. 在 Chrome 地址栏输入 `chrome://extensions`，按回车。
4. 打开右上角「开发者模式」。
5. 点击「加载已解压的扩展程序」，选择包含 `manifest.json` 的解压文件夹。若解压工具额外套了一层文件夹，请进入内层再选择。
6. 确认扩展列表中出现 Rewind for X，且已启用。
7. 打开或刷新 `https://x.com/home`。浏览首页推文后，点击右下角的回看按钮、扩展工具栏图标，或按 `Alt+Shift+R` 打开回看抽屉。

若提示找不到清单文件，请确认选择的是已解压且直接包含 `manifest.json` 的文件夹，而不是 ZIP 文件或它的上级目录。

## 更新

手工安装不会自动更新。下载新版 ZIP，将内容解压到原安装文件夹并替换旧文件，然后在 `chrome://extensions` 点击扩展的重新加载按钮，再刷新 X 页面。请勿先移除扩展，以免丢失本机保存的回看记录。

## 数据与卸载

推文记录保存在本机 `chrome.storage.local`，最多保留 3000 条。抽屉内可清空记录；在 `chrome://extensions` 移除扩展会清除该扩展的本机数据。

非 X 官方产品，与 X Corp. 无关。源代码：https://github.com/lisihao/rewind-for-x 。许可见本目录的 `LICENSE`。
