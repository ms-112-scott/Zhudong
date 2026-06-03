# GitHub Token 設定

工具要一顆 GitHub Token 才能寫回 repo。Token 不放程式碼裡，放 Apps Script 的「指令碼屬性」。

Token 等於帳號鑰匙，外洩就能改你的 repo。別貼到聊天、信件、截圖。貼錯就照「撤銷」段處理。


## 產生 Token

1. GitHub 頭像 → Settings → Developer settings
2. Personal access tokens → Tokens (classic) → Generate new token (classic)
3. 填：
   - Note：`Zhudong images.json sync`
   - Expiration：90 天
   - Scopes：只勾 `repo`
4. Generate token，複製 `ghp_...`（關頁就看不到，先貼記事本）


## 存進 Apps Script

1. 試算表 → 擴充功能 → Apps Script
2. 齒輪「專案設定」→ 指令碼屬性 → 新增
3. 屬性 `GITHUB_TOKEN`，值貼 `ghp_...`
4. 儲存

程式自動讀，不用改碼。


## 更換 Token

到期或外洩時：重產一顆 → 回指令碼屬性改 `GITHUB_TOKEN` 的值 → 儲存 → 撤銷舊的。


## 撤銷舊 Token

GitHub → Settings → Developer settings → Tokens (classic) → 選舊 token → Delete。


## 錯誤排除

| 訊息 | 原因 | 解法 |
|------|------|------|
| 找不到 GITHUB_TOKEN | 沒設或名稱打錯 | 名稱要完全等於 `GITHUB_TOKEN`，區分大小寫 |
| HTTP 401 | token 失效或權限不足 | 重發，確認勾了 `repo` |
| HTTP 404 | repo 名稱/路徑錯或無權限 | 查 REPO_OWNER、REPO_NAME、FILE_PATH，確認帳號有寫入權 |
