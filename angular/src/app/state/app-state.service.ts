import { Injectable, computed, signal } from '@angular/core';
import type { GeminiModel } from '../services/genai.service';
import { getUUID } from '../utils/crypto-random-uuid';

// 最小 Signals/Service 狀態骨架，用於後續遷移 Pinia 狀態
/**
 * AI 設定狀態。
 * - 維護 API 金鑰、模型、溫度、Token 上限與系統提示文。
 */
export interface AiConfigState {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

/**
 * 聊天訊息結構。
 * - `role`: 訊息角色（使用者 / 助手 / 系統）。
 * - `content`: 訊息內容（純文字）。
 * - `createdAt`: 建立時間（時間戳記毫秒）。
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: number;
}

@Injectable({ providedIn: 'root' })
export class AppStateService {
  // LocalStorage keys
  private static readonly KEY_API = 'tubetuner_ai_api_key';
  private static readonly KEY_MODEL = 'tubetuner_ai_model';
  private static readonly KEY_TEMP = 'tubetuner_ai_temperature';
  private static readonly KEY_MAXTOK = 'tubetuner_ai_max_tokens';
  private static readonly KEY_SYS_PROMPT = 'tubetuner_ai_system_prompt';
  private static readonly MODELS_CACHE_KEY = 'tubetuner_models_cache';
  private static readonly MODELS_CACHE_EXPIRY_KEY = 'tubetuner_models_cache_expiry';
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24h

  // AI 設定（含簡易持久化）
  /**
   * 目前的 AI 設定 Signal。
   * - 透過 `aiConfig` 對外暴露唯讀 computed。
   */
  private readonly _aiConfig = signal<AiConfigState>({
    apiKey: '',
    model: 'gemini-2.5-flash',
    temperature: 0.7,
    maxTokens: 65536,
    systemPrompt:
      '你是一個專業的 YouTube 影片助手，可以幫助使用者理解和討論影片內容。請用繁體中文回答。',
  });

  /**
   * 取得目前 AI 設定（唯讀）。
   */
  readonly aiConfig = computed(() => this._aiConfig());
  /**
   * 更新部分 AI 設定（不會立即持久化）。
   * @param partial 要套用的設定片段
   */
  setAiConfig(partial: Partial<AiConfigState>) {
    this._aiConfig.update(current => ({ ...current, ...partial }));
  }

  // 可用模型與載入狀態
  private readonly _availableModels = signal<GeminiModel[]>([]);
  private readonly _isLoadingModels = signal(false);
  private readonly _modelsLoadError = signal('');
  /** 可用模型清單（唯讀）。 */
  readonly availableModels = computed(() => this._availableModels());
  /** 模型載入中狀態（唯讀）。 */
  readonly isLoadingModels = computed(() => this._isLoadingModels());
  /** 模型載入錯誤訊息（唯讀）。 */
  readonly modelsLoadError = computed(() => this._modelsLoadError());

  // 儲存 / 載入設定
  /**
   * 將目前 AI 設定持久化到 LocalStorage。
   */
  saveToStorage() {
    try {
      const s = this._aiConfig();
      localStorage.setItem(AppStateService.KEY_API, s.apiKey);
      localStorage.setItem(AppStateService.KEY_MODEL, s.model);
      localStorage.setItem(AppStateService.KEY_TEMP, String(s.temperature));
      localStorage.setItem(AppStateService.KEY_MAXTOK, String(s.maxTokens));
      localStorage.setItem(AppStateService.KEY_SYS_PROMPT, s.systemPrompt);
    } catch (e) {
      console.warn('儲存設定失敗', e);
    }
  }

  /**
   * 從 LocalStorage 載入 AI 設定與模型快取（若存在）。
   */
  loadFromStorage() {
    try {
      const apiKey = localStorage.getItem(AppStateService.KEY_API) ?? '';
      const model = localStorage.getItem(AppStateService.KEY_MODEL) ?? this._aiConfig().model;
      const tempStr = localStorage.getItem(AppStateService.KEY_TEMP);
      const maxTokStr = localStorage.getItem(AppStateService.KEY_MAXTOK);
      const sysPrompt =
        localStorage.getItem(AppStateService.KEY_SYS_PROMPT) ?? this._aiConfig().systemPrompt;
      this.setAiConfig({
        apiKey,
        model,
        temperature: tempStr != null ? Number(tempStr) : this._aiConfig().temperature,
        maxTokens: maxTokStr != null ? Number(maxTokStr) : this._aiConfig().maxTokens,
        systemPrompt: sysPrompt,
      });
      // 嘗試載入模型快取
      const cached = this.loadModelsFromCache();
      if (cached) this._availableModels.set(cached);
    } catch (e) {
      console.warn('載入設定失敗', e);
    }
  }

  /**
   * 從快取載入模型列表。
   * @returns 模型清單；若無可用或過期則回傳 null
   */
  private loadModelsFromCache(): GeminiModel[] | null {
    try {
      const cached = localStorage.getItem(AppStateService.MODELS_CACHE_KEY);
      const expiry = localStorage.getItem(AppStateService.MODELS_CACHE_EXPIRY_KEY);
      if (cached && expiry && Date.now() < Number(expiry)) {
        return JSON.parse(cached) as GeminiModel[];
      }
    } catch {}
    return null;
  }

  /**
   * 將模型列表寫入快取並設定到期時間。
   * @param models 待快取的模型清單
   */
  private saveModelsToCache(models: GeminiModel[]) {
    try {
      localStorage.setItem(AppStateService.MODELS_CACHE_KEY, JSON.stringify(models));
      localStorage.setItem(
        AppStateService.MODELS_CACHE_EXPIRY_KEY,
        String(Date.now() + AppStateService.CACHE_DURATION),
      );
    } catch {}
  }

  // 提供由外部傳入 fetcher 的載入流程（避免服務相依循環）
  /**
   * 載入可用模型清單。
   * - 若非強制刷新，優先使用本地快取。
   * @param fetcher 提供實際抓取模型清單的非同步函式
   * @param forceRefresh 是否忽略快取強制刷新
   */
  async loadAvailableModels(fetcher: () => Promise<GeminiModel[]>, forceRefresh = false) {
    if (!forceRefresh) {
      const cached = this.loadModelsFromCache();
      if (cached && cached.length > 0) {
        this._availableModels.set(cached);
        // 確保目前選擇存在
        const cur = this._aiConfig().model;
        if (!cached.find(m => m.id === cur)) this.setModel(cached[0].id);
        return;
      }
    }

    this._isLoadingModels.set(true);
    this._modelsLoadError.set('');
    try {
      const models = await fetcher();
      if (models.length > 0) {
        this._availableModels.set(models);
        this.saveModelsToCache(models);
        const cur = this._aiConfig().model;
        if (!models.find(m => m.id === cur)) this.setModel(models[0].id);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      this._modelsLoadError.set(msg || '載入模型失敗');
    } finally {
      this._isLoadingModels.set(false);
    }
  }

  /**
   * 設定目前使用的模型並持久化。
   * @param modelId 模型 ID
   */
  setModel(modelId: string) {
    console.log('設定模型', modelId);

    this.setAiConfig({ model: modelId });
    this.saveToStorage();
  }

  /**
   * 設定溫度參數並持久化（限制於 0–2 之間）。
   * @param t 溫度
   */
  setTemperature(t: number) {
    const v = Math.max(0, Math.min(2, Number(t)));
    this.setAiConfig({ temperature: v });
    this.saveToStorage();
  }

  /**
   * 設定最大 Token 上限並持久化（限制於 1–65536 之間）。
   * @param n Token 上限
   */
  setMaxTokens(n: number) {
    const v = Math.max(1, Math.min(65536, Number(n)));
    this.setAiConfig({ maxTokens: v });
    this.saveToStorage();
  }

  /**
   * 設定系統提示文並持久化。
   * @param s 系統提示內容
   */
  setSystemPrompt(s: string) {
    this.setAiConfig({ systemPrompt: s });
    this.saveToStorage();
  }

  /**
   * 重設所有 AI 設定並清除相關 LocalStorage 快取。
   */
  resetConfig() {
    this._aiConfig.set({
      apiKey: '',
      model: 'gemini-2.5-flash',
      temperature: 0.7,
      maxTokens: 65536,
      systemPrompt:
        '你是一個專業的 YouTube 影片助手，可以幫助使用者理解和討論影片內容。請用繁體中文回答。',
    });
    try {
      localStorage.removeItem(AppStateService.KEY_API);
      localStorage.removeItem(AppStateService.KEY_MODEL);
      localStorage.removeItem(AppStateService.KEY_TEMP);
      localStorage.removeItem(AppStateService.KEY_MAXTOK);
      localStorage.removeItem(AppStateService.KEY_SYS_PROMPT);
      localStorage.removeItem(AppStateService.MODELS_CACHE_KEY);
      localStorage.removeItem(AppStateService.MODELS_CACHE_EXPIRY_KEY);
    } catch {}
  }

  // 簡易聊天訊息狀態
  private readonly _messages = signal<ChatMessage[]>([]);
  /** 聊天訊息串（唯讀）。 */
  readonly messages = computed(() => this._messages());

  /**
   * 新增一則聊天訊息（若未提供 id 會自動產生）。
   * @param msg 訊息內容（不含 id 與 createdAt）
   */
  addMessage(msg: Omit<ChatMessage, 'id' | 'createdAt'> & { id?: string }) {
    const id = msg.id ?? getUUID();
    const createdAt = Date.now();
    this._messages.update(list => [...list, { ...msg, id, createdAt }]);
  }

  /**
   * 清空所有聊天訊息。
   */
  clearMessages() {
    this._messages.set([]);
  }

  // 對話待處理上下文：由其他畫面（例如本機影片）帶入一次性上下文
  private readonly _pendingContext = signal<Pick<ChatMessage, 'role' | 'content'>[] | null>(null);
  /**
   * 設定一次性待注入上下文（通常由其他畫面傳入）。
   * @param messages 將以原樣注入訊息串（常為 system 訊息）
   */
  setPendingContext(messages: Pick<ChatMessage, 'role' | 'content'>[]) {
    this._pendingContext.set(messages);
  }
  /**
   * 取出並清空一次性上下文。
   * @returns 取出的待注入訊息陣列（若無則回傳空陣列）
   */
  consumePendingContext(): Pick<ChatMessage, 'role' | 'content'>[] {
    const v = this._pendingContext();
    this._pendingContext.set(null);
    return v ?? [];
  }

  /**
   * 建構後自動載入本地設定。
   */
  constructor() {
    this.loadFromStorage();
  }
}
