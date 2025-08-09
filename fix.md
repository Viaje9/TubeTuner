好的，我幫你整理一份針對 Safari PWA 輸入框彈出時避免整頁上推 的 Markdown 文件：

# Safari PWA 鍵盤彈出避免整頁上推解法

## 問題說明
在 **iOS Safari**（包含 PWA 與 WKWebView）中，當輸入框獲取焦點時，虛擬鍵盤會彈出，整個頁面會被「推上去」，導致布局錯位或底部元素被遮住。

## 為什麼會發生
1. 虛擬鍵盤佔據螢幕空間 → 視覺視口（Visual Viewport）高度變小。
2. Safari 會自動滾動頁面，確保焦點元素在鍵盤上方顯示。

---

## 解法總覽

| 方法                     | 支援度          | 說明 |
|--------------------------|----------------|------|
| `interactive-widget`     | ❌ Safari 不支援 | 僅 Chrome 108+ 可用 |
| VirtualKeyboard API      | ❌ Safari 不支援 | Chromium 已支援，但 Safari 尚未實作 |
| VisualViewport API       | ✅ Safari 支援  | 目前最穩定的跨平台方法 |
| `env(safe-area-inset-*)` | ⚠️ 有限制       | 在 WKWebView/PWA 可能為 0 或不更新 |

---

## 推薦方案：VisualViewport API

### CSS
```css
:root {
  --vvh: 100dvh; /* 預設為動態視口高度 */
}
html, body {
  height: var(--vvh);
}
.app {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}
.app__content {
  flex: 1;
  overflow: auto;
}
.app__footer {
  position: sticky;
  bottom: 0;
  padding-bottom: env(safe-area-inset-bottom);
}
```

```javascript

(function () {
  const vv = window.visualViewport;
  if (!vv) return;

  const apply = () => {
    document.documentElement.style.setProperty('--vvh', vv.height + 'px');
  };

  ['resize', 'scroll'].forEach(ev => vv.addEventListener(ev, apply));
  apply();

  // 可選：避免鍵盤彈出時的自動滾動跳動
  let lastY = window.scrollY;
  window.addEventListener('scroll', () => { lastY = window.scrollY; }, { passive: true });

  document.addEventListener('focusin', () => {
    setTimeout(() => window.scrollTo({ top: lastY, behavior: 'instant' }), 0);
  });
})();

```

## 相容性注意事項
	•	VisualViewport API：Safari（含 PWA/WKWebView）支援，可用於監測鍵盤彈出導致的高度變化。
	•	interactive-widget：Safari 不支援，僅適用於 Chromium。
	•	VirtualKeyboard API：Safari 尚未支援，請勿依賴。
	•	env(safe-area-inset-*)：在 WKWebView/PWA 有可能不更新或為 0。

## 參考資料
	•	MDN: VisualViewport API
	•	WebKit Bug Tracker: VirtualKeyboard API
	•	Stack Overflow: Mobile keyboard resize handling
