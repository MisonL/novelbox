<template>
  <!-- AI配置对话框 -->
  <div
    v-if="showAIConfigModal"
    class="modal-overlay"
    @click="closeAIConfigModal"
  />
  <div v-if="showAIConfigModal" class="modal ai-config-modal">
    <div class="modal-header">
      <h2 class="modal-title">AI服务配置</h2>
      <button class="modal-close" @click="closeAIConfigModal">×</button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label for="aiProvider">AI服务商</label>
        <select
          id="aiProvider"
          v-model="aiConfig.provider"
          class="form-select"
          @change="updateModelOptions"
        >
          <option
            v-for="provider in AI_PROVIDERS"
            :key="provider.id"
            :value="provider.id"
          >
            {{ provider.name }}
          </option>
          <option
            v-for="provider in aiConfig.customProviders"
            :key="provider.name"
            :value="provider.name"
          >
            {{ provider.name }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="aiModel">AI模型</label>
        <select id="aiModel" v-model="aiConfig.model" class="form-select">
          <option
            v-for="model in modelOptions"
            :key="model.id"
            :value="model.id"
          >
            {{ model.name }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="apiKey">API密钥</label>
        <input
          id="apiKey"
          v-model="aiConfig.apiKey"
          type="password"
          placeholder="请输入API密钥"
          class="form-input"
        />
      </div>
      <div class="form-group">
        <label for="proxyUrl">网络代理</label>
        <input
          id="proxyUrl"
          v-model="aiConfig.proxyUrl"
          type="text"
          :placeholder="getProxyUrlPlaceholder()"
          class="form-input"
        />
      </div>

      <!-- Ollama和LM Studio的自定义配置 -->
      <div v-if="isLocalProvider" class="local-provider-config">
        <div class="form-group">
          <label for="localBaseUrl">Base URL</label>
          <input
            id="localBaseUrl"
            v-model="localBaseUrl"
            type="text"
            :placeholder="getDefaultBaseUrl()"
            class="form-input"
          />
          <div class="input-description">
            {{ getBaseUrlDescription() }}
          </div>
        </div>
        <div v-if="aiConfig.model === 'custom'" class="form-group">
          <label for="customModel">自定义模型名称</label>
          <input
            id="customModel"
            v-model="customModelName"
            type="text"
            placeholder="请输入模型名称"
            class="form-input"
          />
          <div class="input-description">
            例如：llama2:latest, mistral:latest
          </div>
        </div>
      </div>
      <div class="form-group">
        <button
          class="advanced-settings-btn"
          @click="showAdvancedSettings = !showAdvancedSettings"
        >
          {{ showAdvancedSettings ? "收起更多设置" : "更多设置" }}
          <span class="arrow" :class="{ 'arrow-up': showAdvancedSettings }"
            >▼</span
          >
        </button>
        <div v-if="showAdvancedSettings" class="advanced-settings">
          <div class="form-group">
            <label for="temperature">Temperature</label>
            <div class="slider-container">
              <input
                id="temperature"
                v-model.number="aiConfig.temperature"
                type="range"
                min="0"
                max="2"
                step="0.01"
                class="slider"
              />
              <span class="slider-value">{{
                aiConfig.temperature.toFixed(2)
              }}</span>
            </div>
            <div class="slider-description">严谨与想象，值越大想象力越丰富</div>
          </div>
          <div class="form-group">
            <label for="topP">Top P</label>
            <div class="slider-container">
              <input
                id="topP"
                v-model.number="aiConfig.topP"
                type="range"
                min="0"
                max="1"
                step="0.01"
                class="slider"
              />
              <span class="slider-value">{{ aiConfig.topP.toFixed(2) }}</span>
            </div>
            <div class="slider-description">
              控制输出的多样性，值越小输出越保守
            </div>
          </div>
          <div class="form-group">
            <label for="maxTokens">最大Token数</label>
            <input
              id="maxTokens"
              v-model.number="aiConfig.maxTokens"
              type="number"
              min="1"
              max="4096"
              class="form-input"
            />
            <div class="slider-description">控制生成文本的最大长度</div>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="cancel-btn" @click="closeAIConfigModal">取消</button>
      <button
        class="config-btn mr-2"
        @click="() => (showPromptConfigModal = true)"
      >
        提示词配置
      </button>
      <button
        class="config-btn mr-2"
        @click="() => (showCustomProviderModal = true)"
      >
        自定义服务商
      </button>
      <button
        v-if="isEditingCustomProvider"
        class="delete-btn mr-2"
        @click="deleteCustomProvider"
      >
        删除
      </button>
      <button class="save-btn" @click="saveAIConfig">保存</button>
    </div>
  </div>

  <!-- 自定义服务商配置对话框 -->
  <div
    v-if="showCustomProviderModal"
    class="modal-overlay"
    @click="closeCustomProviderModal"
  />
  <div v-if="showCustomProviderModal" class="modal">
    <div class="modal-header">
      <h2 class="modal-title">自定义服务商配置</h2>
      <button class="modal-close" @click="closeCustomProviderModal">×</button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label for="providerName">名称</label>
        <input
          id="providerName"
          v-model="customProvider.name"
          type="text"
          placeholder="请输入服务商名称"
          class="form-input"
        />
      </div>
      <div class="form-group">
        <label for="apiDomain">API域名</label>
        <input
          id="apiDomain"
          v-model="customProvider.apiDomain"
          type="text"
          placeholder="请输入API域名（例如：api.example.com）"
          class="form-input"
        />
      </div>
      <div class="form-group">
        <label for="apiPath">API路径</label>
        <input
          id="apiPath"
          v-model="customProvider.apiPath"
          type="text"
          placeholder="请输入API路径（例如：/v1/chat/completions）"
          class="form-input"
        />
      </div>
      <div class="form-group">
        <label for="model">模型</label>
        <input
          id="model"
          v-model="customProvider.model"
          type="text"
          placeholder="请输入模型名称"
          class="form-input"
        />
      </div>
    </div>
    <div class="modal-footer">
      <button class="cancel-btn" @click="closeCustomProviderModal">取消</button>
      <button
        v-if="isEditingCustomProvider"
        class="delete-btn mr-2"
        @click="deleteCustomProvider"
      >
        删除
      </button>
      <button class="save-btn" @click="saveCustomProvider">保存</button>
    </div>
  </div>

  <!-- 提示词配置对话框 -->
  <div
    v-if="showPromptConfigModal"
    class="modal-overlay"
    @click="closePromptConfigModal"
  />
  <div v-if="showPromptConfigModal" class="modal prompt-config-modal">
    <div class="modal-header">
      <h2 class="modal-title">提示词配置</h2>
      <button class="modal-close" @click="closePromptConfigModal">×</button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label>生成书名简介提示词</label>
        <div class="prompt-input-group">
          <textarea
            ref="bookNameDescTextarea"
            v-model="tempPromptConfig.bookNameAndDesc"
            class="form-textarea prompt-textarea"
            @focus="(e: FocusEvent) => lastFocusedTextarea = e.target as HTMLTextAreaElement"
          />
        </div>
      </div>
      <div class="form-group">
        <label>生成设定提示词</label>
        <div class="prompt-input-group">
          <textarea
            ref="settingsTextarea"
            v-model="tempPromptConfig.settings"
            class="form-textarea prompt-textarea"
            @focus="(e: FocusEvent) => lastFocusedTextarea = e.target as HTMLTextAreaElement"
          />
        </div>
      </div>
      <div class="form-group">
        <label>生成剧情大纲提示词</label>
        <div class="prompt-input-group">
          <textarea
            ref="outlineTextarea"
            v-model="tempPromptConfig.outline"
            class="form-textarea prompt-textarea"
            @focus="(e: FocusEvent) => lastFocusedTextarea = e.target as HTMLTextAreaElement"
          />
        </div>
      </div>
      <div class="form-group">
        <label>生成章节细纲提示词</label>
        <div class="prompt-input-group">
          <textarea
            ref="chapterOutlineTextarea"
            v-model="tempPromptConfig.chapterOutline"
            class="form-textarea prompt-textarea"
            @focus="(e: FocusEvent) => lastFocusedTextarea = e.target as HTMLTextAreaElement"
          />
        </div>
      </div>
      <div class="form-group">
        <label>生成小说章节提示词</label>
        <div class="prompt-input-group">
          <textarea
            ref="chapterTextarea"
            v-model="tempPromptConfig.chapter"
            class="form-textarea prompt-textarea"
            @focus="(e: FocusEvent) => lastFocusedTextarea = e.target as HTMLTextAreaElement"
          />
        </div>
      </div>
      <div class="form-group">
        <label>生成小说首章提示词</label>
        <div class="prompt-input-group">
          <textarea
            ref="firstChapterTextarea"
            v-model="tempPromptConfig.firstChapter"
            class="form-textarea prompt-textarea"
            @focus="(e: FocusEvent) => lastFocusedTextarea = e.target as HTMLTextAreaElement"
          />
        </div>
      </div>
      <div class="form-group">
        <label>续写提示词</label>
        <div class="prompt-input-group">
          <textarea
            ref="continueTextarea"
            v-model="tempPromptConfig.continue"
            class="form-textarea prompt-textarea"
            @focus="(e: FocusEvent) => lastFocusedTextarea = e.target as HTMLTextAreaElement"
          />
        </div>
      </div>
      <div class="form-group">
        <label>扩写提示词</label>
        <div class="prompt-input-group">
          <textarea
            ref="expandTextarea"
            v-model="tempPromptConfig.expand"
            class="form-textarea prompt-textarea"
            @focus="(e: FocusEvent) => lastFocusedTextarea = e.target as HTMLTextAreaElement"
          />
        </div>
      </div>
      <div class="form-group">
        <label>缩写提示词</label>
        <div class="prompt-input-group">
          <textarea
            ref="abbreviateTextarea"
            v-model="tempPromptConfig.abbreviate"
            class="form-textarea prompt-textarea"
            @focus="(e: FocusEvent) => lastFocusedTextarea = e.target as HTMLTextAreaElement"
          />
        </div>
      </div>
      <div class="form-group">
        <label>改写提示词</label>
        <div class="prompt-input-group">
          <textarea
            ref="rewriteTextarea"
            v-model="tempPromptConfig.rewrite"
            class="form-textarea prompt-textarea"
            @focus="(e: FocusEvent) => lastFocusedTextarea = e.target as HTMLTextAreaElement"
          />
        </div>
      </div>
      <div class="form-group">
        <label>更新设定提示词</label>
        <div class="prompt-input-group">
          <textarea
            ref="updateSettingsTextarea"
            v-model="tempPromptConfig.updateSettings"
            class="form-textarea prompt-textarea"
            @focus="(e: FocusEvent) => lastFocusedTextarea = e.target as HTMLTextAreaElement"
          />
        </div>
      </div>
    </div>
    <div class="variable-toolbar">
      <button @click="insertVariable('title', $event)">书名</button>
      <button @click="insertVariable('desc', $event)">简介</button>
      <button @click="insertVariable('settings', $event)">设定</button>
      <button @click="insertVariable('outline', $event)">大纲</button>
      <button @click="insertVariable('chapterOutline', $event)">
        章节细纲
      </button>
      <button @click="insertVariable('chapter', $event)">章节内容</button>
      <button @click="insertVariable('content', $event)">当前内容</button>
      <button @click="insertVariable('previous', $event)">前文</button>
    </div>
    <div class="modal-footer">
      <button class="cancel-btn" @click="closePromptConfigModal">取消</button>
      <button class="reset-btn" @click="resetToDefault">恢复默认值</button>
      <button class="save-btn" @click="savePromptConfig">保存</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { showSuccess, showError, showWarning } from "@/utils/message";
import { ElMessageBox } from "../utils/message";
import { ref, reactive, onMounted, computed, watch } from "vue";
import {
  defaultBookNameAndDescPrompt,
  defaultSettingsPrompt,
  defaultOutlinePrompt,
  defaultChapterOutlinePrompt,
  defaultChapterPrompt,
  defaultContinuePrompt,
  defaultExpandPrompt,
  defaultAbbreviatePrompt,
  defaultRewriteAbbreviatePrompt,
  defaultUpdateSettingsPrompt,
  defaultFirstChapterPrompt,
  AI_PROVIDERS,
} from "../constants";
import { PromptConfigService } from "../services/promptConfigService";
import { AIConfigService } from "../services/aiConfigService";
import type { CustomProvider } from "../services/aiConfigService";

const props = defineProps<{
  showAIConfigModal: boolean;
}>();

interface AIConfig {
  provider: string;
  model: string;
  apiKey: string;
  proxyUrl: string;
  customProviders?: CustomProvider[];
  temperature: number;
  maxTokens: number;
  topP: number;
}

// 使用any类型避免TypeScript严格模式下的类型冲突

// 使用已导入的CustomProvider类型，不再需要本地定义
interface ModelOption {
  id: string;
  name: string;
}

const emit = defineEmits(["update:showAIConfigModal"]);

const aiConfig = reactive<AIConfig>({
  provider: "openai",
  model: "",
  apiKey: "",
  proxyUrl: "",
  customProviders: [],
  temperature:
    AI_PROVIDERS.find((p) => p.id === "openai")?.defaultTemperature ?? 0.7,
  maxTokens: 2000,
  topP: AI_PROVIDERS.find((p) => p.id === "openai")?.defaultTopP ?? 0.95,
});

interface PromptConfig {
  bookNameAndDesc: string;
  settings: string;
  outline: string;
  chapterOutline: string;
  chapter: string;
  firstChapter: string;
  continue: string;
  expand: string;
  abbreviate: string;
  rewrite: string;
  updateSettings: string;
}

const promptConfig = reactive<PromptConfig>({
  bookNameAndDesc: defaultBookNameAndDescPrompt,
  settings: defaultSettingsPrompt,
  outline: defaultOutlinePrompt,
  chapterOutline: defaultChapterOutlinePrompt,
  chapter: defaultChapterPrompt,
  firstChapter: defaultFirstChapterPrompt,
  continue: defaultContinuePrompt,
  expand: defaultExpandPrompt,
  abbreviate: defaultAbbreviatePrompt,
  rewrite: defaultRewriteAbbreviatePrompt,
  updateSettings: defaultUpdateSettingsPrompt,
});

// 临时存储提示词配置的修改
const tempPromptConfig = reactive<PromptConfig>({
  bookNameAndDesc: promptConfig.bookNameAndDesc,
  settings: promptConfig.settings,
  outline: promptConfig.outline,
  chapterOutline: promptConfig.chapterOutline,
  chapter: promptConfig.chapter,
  firstChapter: promptConfig.firstChapter,
  continue: promptConfig.continue,
  expand: promptConfig.expand,
  abbreviate: promptConfig.abbreviate,
  rewrite: promptConfig.rewrite,
  updateSettings: promptConfig.updateSettings,
});

const modelOptions = ref<ModelOption[]>([]);
const showPromptConfigModal = ref(false);
const showCustomProviderModal = ref(false);
const customProvider = reactive({
  name: "",
  apiDomain: "",
  apiPath: "",
  model: "",
});

// 本地AI服务的自定义配置
const localBaseUrl = ref("");
const customModelName = ref("");

const isEditingCustomProvider = ref(false);
const lastFocusedTextarea = ref<HTMLTextAreaElement>();

const bookNameDescTextarea = ref<HTMLTextAreaElement>();
const settingsTextarea = ref<HTMLTextAreaElement>();
const outlineTextarea = ref<HTMLTextAreaElement>();
const chapterOutlineTextarea = ref<HTMLTextAreaElement>();
const chapterTextarea = ref<HTMLTextAreaElement>();
const continueTextarea = ref<HTMLTextAreaElement>();
const expandTextarea = ref<HTMLTextAreaElement>();
const abbreviateTextarea = ref<HTMLTextAreaElement>();
const updateSettingsTextarea = ref<HTMLTextAreaElement>();
const firstChapterTextarea = ref<HTMLTextAreaElement>();

const showAdvancedSettings = ref(false);

// 计算属性：是否为本地AI提供商
const isLocalProvider = computed(() => {
  return ["ollama", "lmstudio"].includes(aiConfig.provider);
});

// 监听对话框显示状态
watch(
  () => props.showAIConfigModal,
  async (newValue) => {
    if (newValue) {
      // 当对话框显示时，重新加载配置
      await loadAIConfig();
    }
  }
);

onMounted(async () => {
  try {
    await loadAIConfig();
    updateModelOptions();
  } catch (error) {
    console.error("初始化失败:", error);
  }
});

/**
 * 加载AI配置
 * 从配置服务中加载全局配置、自定义服务商列表、当前服务商配置和提示词配置
 * 如果加载失败，使用默认配置并显示错误提示
 */
const loadAIConfig = async () => {
  try {
    // 加载全局配置（包含当前选择的服务商和自定义服务商列表）
    const globalConfig = await AIConfigService.loadProviderConfig("global");

    // 验证全局配置
    if (!globalConfig || typeof globalConfig !== "object") {
      throw new Error("全局配置格式无效");
    }

    // 加载自定义服务商列表
    if (
      globalConfig.customProviders &&
      Array.isArray(globalConfig.customProviders)
    ) {
      aiConfig.customProviders = globalConfig.customProviders;
    }

    // 设置当前选择的服务商
    if (globalConfig.provider && typeof globalConfig.provider === "string") {
      aiConfig.provider = globalConfig.provider;
    }

    // 更新模型选项
    await updateModelOptions();

    // 加载当前服务商的配置
    await loadCurrentProviderConfig();

    // 加载提示词配置
    await loadPromptConfig();
    Object.assign(tempPromptConfig, promptConfig);
  } catch (error) {
    console.error("加载AI配置失败:", error);
    showError(
      `加载AI配置失败: ${error instanceof Error ? error.message : "未知错误"}`
    );

    // 使用默认配置
    aiConfig.provider = "openai";
    aiConfig.customProviders = [];
    await updateModelOptions();
  }
};

/**
 * 加载当前选择的服务商配置
 * 根据当前选择的服务商ID加载对应的配置信息
 * 包括模型、API密钥、代理URL以及模型特定的参数（temperature、maxTokens、topP）
 * 参数优先级：模型特定配置 > 模型默认值 > 全局默认值
 * 如果加载失败，使用默认值并显示错误提示
 */
const loadCurrentProviderConfig = async () => {
  try {
    // 验证当前服务商
    if (!aiConfig.provider || typeof aiConfig.provider !== "string") {
      throw new Error("当前服务商配置无效");
    }

    const providerConfig = await AIConfigService.loadProviderConfig(
      aiConfig.provider
    );

    // 验证配置格式
    if (!providerConfig || typeof providerConfig !== "object") {
      throw new Error("服务商配置格式无效");
    }

    // 设置基本配置
    aiConfig.model = providerConfig.model || "";
    aiConfig.apiKey = providerConfig.apiKey || "";
    aiConfig.proxyUrl = providerConfig.proxyUrl || "";

    // 获取当前服务商的默认配置
    const provider = AI_PROVIDERS.find((p) => p.id === aiConfig.provider);
    if (provider) {
      // 查找当前选中的模型
      const currentModel = provider.models.find((m) => m.id === aiConfig.model);

      // 检查是否有针对当前模型的保存配置
      const modelConfig = providerConfig.modelConfigs?.[aiConfig.model];

      // 设置temperature (优先级: 模型配置 > 默认值)
      aiConfig.temperature =
        modelConfig?.temperature ?? provider.defaultTemperature;

      // 设置maxTokens (优先级: 模型配置 > 模型默认值 > 全局默认值)
      if (modelConfig?.maxTokens) {
        // 1. 使用保存的模型特定配置
        aiConfig.maxTokens = modelConfig.maxTokens;
      } else if (currentModel?.maxTokens) {
        // 2. 使用模型的默认值
        aiConfig.maxTokens = currentModel.maxTokens;
      } else {
        // 3. 使用全局默认值
        aiConfig.maxTokens = 2000;
      }

      // 设置topP (优先级: 模型配置 > 默认值)
      aiConfig.topP = modelConfig?.topP ?? provider.defaultTopP;
    } else {
      // 自定义服务商使用默认值
      aiConfig.temperature = 0.7;
      aiConfig.maxTokens = 2000;
      aiConfig.topP = 0.95;

      // 如果有模型配置，优先使用
      const modelConfig = providerConfig.modelConfigs?.[aiConfig.model];
      if (modelConfig) {
        if (modelConfig.temperature !== undefined)
          aiConfig.temperature = modelConfig.temperature;
        if (modelConfig.maxTokens !== undefined)
          aiConfig.maxTokens = modelConfig.maxTokens;
        if (modelConfig.topP !== undefined) aiConfig.topP = modelConfig.topP;
      }
    }
  } catch (error) {
    console.error("加载服务商配置失败:", error);
    showError(
      `加载服务商配置失败: ${
        error instanceof Error ? error.message : "未知错误"
      }`
    );

    // 使用默认值
    aiConfig.temperature = 0.7;
    aiConfig.maxTokens = 2000;
    aiConfig.topP = 0.95;
  }
};

/**
 * 保存AI配置
 * 验证用户输入的配置参数，包括服务商、模型、API密钥和数值范围
 * 保存当前服务商的配置和全局配置（当前选择的服务商和自定义服务商列表）
 * 如果验证失败或保存出错，显示相应的错误提示
 */
const saveAIConfig = async () => {
  try {
    // 验证输入
    if (!aiConfig.provider || typeof aiConfig.provider !== "string") {
      showError("请选择有效的AI服务商");
      return;
    }

    const isCustomProvider = aiConfig.customProviders?.some(
      (p) => p.name === aiConfig.provider
    );

    if (!isCustomProvider && !aiConfig.apiKey?.trim()) {
      showError("请输入API密钥");
      return;
    }

    if (!aiConfig.model || typeof aiConfig.model !== "string") {
      showError("请选择有效的AI模型");
      return;
    }

    // 验证数值范围
    if (
      typeof aiConfig.temperature !== "number" ||
      aiConfig.temperature < 0 ||
      aiConfig.temperature > 2
    ) {
      showError("Temperature值必须在0-2之间");
      return;
    }

    if (
      typeof aiConfig.maxTokens !== "number" ||
      aiConfig.maxTokens < 1 ||
      aiConfig.maxTokens > 4096
    ) {
      showError("最大Token数必须在1-4096之间");
      return;
    }

    if (
      typeof aiConfig.topP !== "number" ||
      aiConfig.topP < 0 ||
      aiConfig.topP > 1
    ) {
      showError("Top P值必须在0-1之间");
      return;
    }

    // 处理本地AI提供商的特殊配置
    let finalApiKey = aiConfig.apiKey;
    let finalProxyUrl = aiConfig.proxyUrl;

    if (isLocalProvider.value) {
      // 对于本地提供商，使用localBaseUrl作为proxyUrl
      if (localBaseUrl.value.trim()) {
        finalProxyUrl = localBaseUrl.value.trim();
      }

      // 对于自定义模型，使用customModelName作为apiKey
      if (aiConfig.model === "custom" && customModelName.value.trim()) {
        finalApiKey = customModelName.value.trim();
      }
    }

    // 加载当前配置
    const currentConfig = await AIConfigService.loadProviderConfig(
      aiConfig.provider
    );

    // 确保modelConfigs存在
    if (!currentConfig.modelConfigs) {
      currentConfig.modelConfigs = {};
    }

    // 保存当前模型的特定配置
    if (aiConfig.model) {
      currentConfig.modelConfigs[aiConfig.model] = {
        temperature: aiConfig.temperature,
        maxTokens: aiConfig.maxTokens,
        topP: aiConfig.topP,
      };
    }

    // 保存当前服务商的配置
    const providerConfig = {
      ...currentConfig,
      model: aiConfig.model,
      apiKey: finalApiKey,
      proxyUrl: finalProxyUrl,
    };

    // 保存当前服务商的配置，不包含customProviders
    await AIConfigService.saveConfig(aiConfig.provider, providerConfig);

    // 保存全局配置（当前选择的服务商和自定义服务商列表）
    const globalConfig = {
      provider: aiConfig.provider,
      customProviders: aiConfig.customProviders || [],
    };

    // 保存全局配置到特殊的键名
    await AIConfigService.saveGlobalConfig(globalConfig);

    closeAIConfigModal();
    showSuccess("AI配置已保存");
  } catch (error) {
    console.error("保存AI配置失败:", error);
    showError(
      `保存AI配置失败: ${error instanceof Error ? error.message : "未知错误"}`
    );
  }
};

const closeAIConfigModal = () => {
  emit("update:showAIConfigModal", false);
};

// 本地AI服务的辅助方法
const getProxyUrlPlaceholder = () => {
  if (aiConfig.provider === "ollama") {
    return "例如：http://192.168.1.100:11434，留空使用localhost:11434";
  } else if (aiConfig.provider === "lmstudio") {
    return "例如：http://192.168.1.100:1234/v1，留空使用localhost:1234/v1";
  } else {
    return "例如：http://127.0.0.1:7890，留空则不使用代理";
  }
};

const getDefaultBaseUrl = () => {
  if (aiConfig.provider === "ollama") {
    return "http://localhost:11434";
  } else if (aiConfig.provider === "lmstudio") {
    return "http://localhost:1234/v1";
  }
  return "";
};

const getBaseUrlDescription = () => {
  if (aiConfig.provider === "ollama") {
    return "Ollama服务的完整地址，例如：http://localhost:11434";
  } else if (aiConfig.provider === "lmstudio") {
    return "LM Studio服务的完整地址，例如：http://localhost:1234/v1";
  }
  return "";
};

const updateModelOptions = async () => {
  const provider = AI_PROVIDERS.find((p) => p.id === aiConfig.provider);
  if (provider) {
    modelOptions.value = provider.models;
    isEditingCustomProvider.value = false;

    // 如果当前选中的模型不在新的选项列表中，选择第一个模型
    if (!modelOptions.value.find((option) => option.id === aiConfig.model)) {
      aiConfig.model = modelOptions.value[0]?.id || "";
    }

    // 加载当前服务商配置
    try {
      const providerConfig = await AIConfigService.loadProviderConfig(
        aiConfig.provider
      );

      // 更新API密钥
      if (providerConfig.apiKey !== undefined) {
        aiConfig.apiKey = providerConfig.apiKey;
      }

      // 更新代理URL
      if (providerConfig.proxyUrl !== undefined) {
        aiConfig.proxyUrl = providerConfig.proxyUrl;
      }

      // 处理本地AI提供商的特殊配置加载
      if (isLocalProvider.value) {
        // 加载Base URL
        localBaseUrl.value = providerConfig.proxyUrl || "";

        // 加载自定义模型名称
        if (aiConfig.model === "custom" && providerConfig.apiKey) {
          customModelName.value = providerConfig.apiKey;
        }
      }

      // 检查是否有针对当前模型的保存配置
      const modelConfig = providerConfig.modelConfigs?.[aiConfig.model];

      if (modelConfig) {
        // 如果有模型特定配置，优先使用
        if (modelConfig.maxTokens !== undefined) {
          aiConfig.maxTokens = modelConfig.maxTokens;
        }
        if (modelConfig.temperature !== undefined) {
          aiConfig.temperature = modelConfig.temperature;
        }
        if (modelConfig.topP !== undefined) {
          aiConfig.topP = modelConfig.topP;
        }

        // 如果至少有一个配置项，则提前返回
        if (
          modelConfig.maxTokens !== undefined ||
          modelConfig.temperature !== undefined ||
          modelConfig.topP !== undefined
        ) {
          return;
        }
      }
    } catch (error) {
      console.error("加载配置失败:", error);
    }

    // 如果没有保存的配置，使用模型默认值
    const currentModel = provider.models.find((m) => m.id === aiConfig.model);

    // 设置maxTokens
    if (currentModel?.maxTokens) {
      aiConfig.maxTokens = currentModel.maxTokens;
    } else {
      aiConfig.maxTokens = 2000;
    }

    // 设置temperature和topP
    aiConfig.temperature = provider.defaultTemperature;
    aiConfig.topP = provider.defaultTopP;
  } else {
    // 查找自定义服务商
    const foundCustomProvider = aiConfig.customProviders?.find(
      (p) => p.name === aiConfig.provider
    );
    if (foundCustomProvider) {
      isEditingCustomProvider.value = true;
      modelOptions.value = [
        {
          id: foundCustomProvider.modelName,
          name: foundCustomProvider.modelName,
        },
      ];

      // 加载自定义服务商配置
      try {
        const providerConfig = await AIConfigService.loadProviderConfig(
          aiConfig.provider
        );
        if (providerConfig.apiKey !== undefined) {
          aiConfig.apiKey = providerConfig.apiKey;
        }
        if (providerConfig.proxyUrl !== undefined) {
          aiConfig.proxyUrl = providerConfig.proxyUrl;
        }
      } catch (error) {
        console.error("加载自定义服务商配置失败:", error);
      }
    } else {
      modelOptions.value = [];
    }
  }

  // 加载当前服务商的配置
  await loadCurrentProviderConfig();
};

// 修改watch函数，使用新的modelConfigs结构
watch(
  () => aiConfig.model,
  async (newModel) => {
    if (newModel) {
      // 加载当前服务商配置
      try {
        const providerConfig = await AIConfigService.loadProviderConfig(
          aiConfig.provider
        );

        // 更新API密钥
        if (providerConfig.apiKey) {
          aiConfig.apiKey = providerConfig.apiKey;
        }

        // 检查是否有针对当前模型的保存配置
        const modelConfig = providerConfig.modelConfigs?.[newModel];

        if (modelConfig) {
          // 如果有模型特定配置，优先使用
          if (modelConfig.maxTokens !== undefined) {
            aiConfig.maxTokens = modelConfig.maxTokens;
          }
          if (modelConfig.temperature !== undefined) {
            aiConfig.temperature = modelConfig.temperature;
          }
          if (modelConfig.topP !== undefined) {
            aiConfig.topP = modelConfig.topP;
          }

          // 如果至少有一个配置项，则提前返回
          if (
            modelConfig.maxTokens !== undefined ||
            modelConfig.temperature !== undefined ||
            modelConfig.topP !== undefined
          ) {
            return;
          }
        }
      } catch (error) {
        console.error("加载配置失败:", error);
      }

      // 如果没有保存的配置，使用模型默认值
      const provider = AI_PROVIDERS.find((p) => p.id === aiConfig.provider);
      if (provider) {
        const currentModel = provider.models.find((m) => m.id === newModel);

        // 设置maxTokens
        if (currentModel?.maxTokens) {
          aiConfig.maxTokens = currentModel.maxTokens;
        } else {
          aiConfig.maxTokens = 2000;
        }

        // 设置temperature和topP
        aiConfig.temperature = provider.defaultTemperature;
        aiConfig.topP = provider.defaultTopP;
      }
    }
  }
);

// 检查是否有未保存的修改
const hasUnsavedChanges = computed(() => {
  return Object.keys(promptConfig).some((key) => {
    const typedKey = key as keyof PromptConfig;
    return promptConfig[typedKey] !== tempPromptConfig[typedKey];
  });
});

const closeCustomProviderModal = () => {
  showCustomProviderModal.value = false;
  // 重置表单
  customProvider.name = "";
  customProvider.apiDomain = "";
  customProvider.apiPath = "";
  customProvider.model = "";
  isEditingCustomProvider.value = false;
};

/**
 * 删除自定义服务商
 * 从自定义服务商列表中删除当前选中的服务商
 * 删除对应的配置文件
 * 切换到默认服务商（openai）
 * 如果删除失败，显示错误提示
 */
const deleteCustomProvider = async () => {
  try {
    // 验证当前选择的服务商
    if (!aiConfig.provider || typeof aiConfig.provider !== "string") {
      showError("当前选择的服务商无效");
      return;
    }

    // 从自定义服务商列表中删除
    const index = aiConfig.customProviders?.findIndex(
      (p) => p.name === aiConfig.provider
    );
    if (index === undefined || index === -1) {
      showError("未找到要删除的自定义服务商");
      return;
    }

    const providerName = aiConfig.provider;
    aiConfig.customProviders?.splice(index, 1);

    // 删除服务商的配置文件
    await AIConfigService.deleteConfig(providerName);

    // 删除后切换到默认服务商
    aiConfig.provider = "openai";
    await updateModelOptions();

    // 保存全局配置
    const globalConfig = {
      provider: aiConfig.provider,
      customProviders: aiConfig.customProviders || [],
    };
    await AIConfigService.saveGlobalConfig(globalConfig);

    closeCustomProviderModal();
    showSuccess("自定义服务商已删除");
  } catch (error) {
    console.error("删除自定义服务商失败:", error);
    showError(
      `删除自定义服务商失败: ${
        error instanceof Error ? error.message : "未知错误"
      }`
    );
  }
};

/**
 * 保存自定义服务商
 * 验证用户输入的自定义服务商信息，包括名称、API域名、路径和模型
 * 验证API域名格式和API路径格式
 * 检查是否已存在同名服务商
 * 如果验证失败或保存出错，显示相应的错误提示
 */
const saveCustomProvider = async () => {
  try {
    // 验证输入
    if (!customProvider.name?.trim()) {
      showError("请输入服务商名称");
      return;
    }

    if (!customProvider.apiDomain?.trim()) {
      showError("请输入API域名");
      return;
    }

    if (!customProvider.apiPath?.trim()) {
      showError("请输入API路径");
      return;
    }

    if (!customProvider.model?.trim()) {
      showError("请输入模型名称");
      return;
    }

    // 验证API域名格式
    try {
      new URL(`https://${customProvider.apiDomain.trim()}`);
    } catch {
      showError("API域名格式无效");
      return;
    }

    // 验证API路径格式
    if (!customProvider.apiPath.trim().startsWith("/")) {
      showError("API路径必须以/开头");
      return;
    }

    // 创建新的自定义服务商配置
    const newProvider = {
      name: customProvider.name.trim(),
      apiDomain: customProvider.apiDomain.trim(),
      apiPath: customProvider.apiPath.trim(),
      modelName: customProvider.model.trim(),
    };

    // 获取当前的自定义服务商列表
    const customProviders = await AIConfigService.getCustomProviders();

    // 检查是否已存在同名服务商
    if (customProviders.some((p) => p.name === newProvider.name)) {
      showError("已存在同名服务商");
      return;
    }

    // 添加新的自定义服务商
    customProviders.push(newProvider);

    // 更新aiConfig中的列表
    aiConfig.customProviders = customProviders;

    // 保存全局配置
    const globalConfig = {
      provider: aiConfig.provider,
      customProviders,
    };

    // 使用新的saveGlobalConfig方法保存
    await AIConfigService.saveGlobalConfig(globalConfig);

    // 更新服务商选项
    await updateModelOptions();

    // 关闭弹窗
    closeCustomProviderModal();
    showSuccess("自定义服务商添加成功");
  } catch (error) {
    console.error("保存自定义服务商失败:", error);
    showError(
      `保存自定义服务商失败: ${
        error instanceof Error ? error.message : "未知错误"
      }`
    );
  }
};

const closePromptConfigModal = () => {
  if (hasUnsavedChanges.value) {
    ElMessageBox.confirm("有未保存的修改，是否放弃修改？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    })
      .then(() => {
        // 放弃修改，重置临时配置
        Object.keys(promptConfig).forEach((key) => {
          const typedKey = key as keyof PromptConfig;
          tempPromptConfig[typedKey] = promptConfig[typedKey];
        });
        showPromptConfigModal.value = false;
      })
      .catch(() => {
        // 用户点击取消按钮，不做任何操作
      });
  } else {
    showPromptConfigModal.value = false;
  }
};

// 加载提示词配置
const loadPromptConfig = async () => {
  try {
    const config = await PromptConfigService.loadConfig();
    Object.assign(promptConfig, config);
  } catch (error) {
    console.error("加载提示词配置失败:", error);
    showError(error instanceof Error ? error.message : "加载提示词配置失败");
  }
};

const savePromptConfig = async () => {
  try {
    // 将临时配置同步到正式配置
    Object.keys(promptConfig).forEach((key) => {
      const typedKey = key as keyof PromptConfig;
      promptConfig[typedKey] = tempPromptConfig[typedKey];
    });
    // 保存到文件
    await PromptConfigService.saveConfig(promptConfig);
    showPromptConfigModal.value = false;
    showSuccess("提示词配置已保存");
  } catch (error) {
    console.error("保存提示词配置失败:", error);
    showError(error instanceof Error ? error.message : "保存提示词配置失败");
  }
};

const resetToDefault = () => {
  ElMessageBox.confirm("确定要恢复所有提示词为默认值吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      // 重置所有提示词为默认值
      tempPromptConfig.bookNameAndDesc = defaultBookNameAndDescPrompt;
      tempPromptConfig.settings = defaultSettingsPrompt;
      tempPromptConfig.outline = defaultOutlinePrompt;
      tempPromptConfig.chapterOutline = defaultChapterOutlinePrompt;
      tempPromptConfig.chapter = defaultChapterPrompt;
      tempPromptConfig.firstChapter = defaultFirstChapterPrompt;
      tempPromptConfig.continue = defaultContinuePrompt;
      tempPromptConfig.expand = defaultExpandPrompt;
      tempPromptConfig.abbreviate = defaultAbbreviatePrompt;
      tempPromptConfig.rewrite = defaultRewriteAbbreviatePrompt;
      tempPromptConfig.updateSettings = defaultUpdateSettingsPrompt;
    })
    .catch(() => {
      // 用户点击取消按钮，不做任何操作
    });
};

/**
 * 插入变量到提示词中
 * 根据变量类型插入对应的占位符到当前焦点的文本区域
 * 支持的变量：书名、简介、设定、大纲、章节细纲、章节内容、当前内容、前文
 * 如果参数无效或找不到文本区域，显示错误提示
 * @param type - 变量类型
 * @param event - 鼠标事件对象
 */
const insertVariable = (type: string, _event: MouseEvent) => {
  try {
    // 验证参数
    if (!type || typeof type !== "string") {
      console.warn("变量类型无效:", type);
      return;
    }

    const textarea = lastFocusedTextarea.value || getCurrentTextarea();
    if (!textarea) {
      console.warn("未找到可用的文本区域");
      showError("请先点击一个文本区域");
      return;
    }

    const cursorPos = textarea.selectionStart;
    const textBefore = textarea.value.substring(0, cursorPos);
    const textAfter = textarea.value.substring(textarea.selectionEnd);

    // 根据类型确定变量
    let variable = "${content}";
    switch (type) {
      case "title":
        variable = "${title}";
        break;
      case "desc":
        variable = "${description}";
        break;
      case "settings":
        variable = "${settings}";
        break;
      case "outline":
        variable = "${outline}";
        break;
      case "chapterOutline":
        variable = "${chapterOutline}";
        break;
      case "chapter":
        variable = "${chapter}";
        break;
      case "content":
        variable = "${content}";
        break;
      case "previous":
        variable = "${previous}";
        break;
      default:
        console.warn("未知的变量类型:", type);
        showWarning("未知的变量类型");
        return;
    }

    // 根据当前文本区域更新对应的tempPromptConfig属性
    const newValue = textBefore + variable + textAfter;
    if (textarea === bookNameDescTextarea.value) {
      tempPromptConfig.bookNameAndDesc = newValue;
    } else if (textarea === settingsTextarea.value) {
      tempPromptConfig.settings = newValue;
    } else if (textarea === outlineTextarea.value) {
      tempPromptConfig.outline = newValue;
    } else if (textarea === chapterOutlineTextarea.value) {
      tempPromptConfig.chapterOutline = newValue;
    } else if (textarea === chapterTextarea.value) {
      tempPromptConfig.chapter = newValue;
    } else if (textarea === firstChapterTextarea.value) {
      tempPromptConfig.firstChapter = newValue;
    } else if (textarea === continueTextarea.value) {
      tempPromptConfig.continue = newValue;
    } else if (textarea === expandTextarea.value) {
      tempPromptConfig.expand = newValue;
    } else if (textarea === abbreviateTextarea.value) {
      tempPromptConfig.abbreviate = newValue;
    }

    // 更新文本区域的值和光标位置
    textarea.value = newValue;
    textarea.focus();
    textarea.selectionStart = cursorPos + variable.length;
    textarea.selectionEnd = cursorPos + variable.length;
  } catch (error) {
    console.error("插入变量失败:", error);
    showError("插入变量时发生错误");
  }
};

const getCurrentTextarea = (): HTMLTextAreaElement | undefined => {
  // 优先使用最后记录的焦点元素
  if (lastFocusedTextarea.value) {
    return lastFocusedTextarea.value;
  }

  const activeElement = document.activeElement;

  // 优先检查当前焦点元素是否是有效的文本区域
  if (activeElement instanceof HTMLTextAreaElement) {
    return activeElement;
  }
  const textareas = document.getElementsByClassName("prompt-textarea");
  for (let i = 0; i < textareas.length; i++) {
    if (textareas[i] === activeElement) {
      return textareas[i] as HTMLTextAreaElement;
    }
  }

  // 如果都不可用，返回第一个文本区域（如果存在）
  return bookNameDescTextarea.value || undefined;
};
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-40 z-40 backdrop-blur-sm transition-all duration-300;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  z-index: 9999 !important;
  /* 确保在编译后应用中正确显示 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* 添加Webkit前缀以确保在不同浏览器中一致显示 */
  -webkit-backdrop-filter: blur(4px);
  -webkit-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal {
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  background-color: white !important;
  border-radius: 1.5rem !important;
  box-shadow: 0 32px 64px -12px rgba(0, 0, 0, 0.25),
    0 16px 32px -8px rgba(0, 0, 0, 0.15) !important;
  z-index: 10000 !important;
  width: 85% !important;
  max-width: 42rem !important;
  max-height: 80vh !important;
  min-width: 20rem !important;
  overflow: hidden !important;
  display: flex !important;
  flex-direction: column !important;
  margin: 0 !important;
  backdrop-filter: blur(16px);
  animation: modalSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1px solid rgba(0, 0, 0, 0.08);
  /* 添加这些样式确保在编译后应用中正确显示 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  /* 添加Webkit前缀以确保在不同浏览器中一致显示 */
  -webkit-transform: translate(-50%, -50%) !important;
  -webkit-border-radius: 1.5rem !important;
  -webkit-box-shadow: 0 32px 64px -12px rgba(0, 0, 0, 0.25),
    0 16px 32px -8px rgba(0, 0, 0, 0.15) !important;
  -webkit-backdrop-filter: blur(16px);
  -webkit-animation: modalSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.prompt-config-modal {
  @apply w-[800px] max-w-[90vw];
  /* 确保在编译后应用中正确显示 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  /* 添加Webkit前缀以确保在不同浏览器中一致显示 */
  max-width: 90vw;
  width: 800px;
}

.modal-header {
  @apply flex justify-between items-center p-8 border-b border-gray-100/80 bg-gradient-to-r from-gray-50/95 to-gray-100/95;
  backdrop-filter: blur(8px);
  /* 确保在编译后应用中正确显示 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  /* 添加Webkit前缀以确保在不同浏览器中一致显示 */
  -webkit-backdrop-filter: blur(8px);
  -webkit-box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.modal-title {
  @apply text-3xl font-bold text-gray-800;
  letter-spacing: -0.025em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  /* 确保在编译后应用中正确显示 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* 添加Webkit前缀以确保在不同浏览器中一致显示 */
  -webkit-text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  -webkit-letter-spacing: -0.025em;
  font-weight: 700;
}

.modal-body {
  @apply p-8 overflow-y-auto flex-1 overflow-x-hidden;
  background: linear-gradient(
    to bottom,
    rgba(248, 250, 252, 0.5),
    rgba(255, 255, 255, 0.9)
  );
  backdrop-filter: blur(4px);
  /* 确保在编译后应用中正确显示 */
  -webkit-backdrop-filter: blur(4px);
  /* 添加滚动条样式以确保在不同平台上一致显示 */
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) rgba(248, 250, 252, 0.5);
}

.modal-footer {
  @apply flex justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50;
  /* 确保在编译后应用中正确显示 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  /* 添加Webkit前缀以确保在不同浏览器中一致显示 */
  -webkit-box-shadow: 0 -1px 2px rgba(0, 0, 0, 0.02);
  border-top: 1px solid rgba(243, 244, 246, 0.8);
  background: linear-gradient(
    to bottom,
    rgba(249, 250, 251, 0.95),
    rgba(243, 244, 246, 0.95)
  );
}

.modal-close {
  @apply text-2xl text-gray-400 hover:text-gray-600 transition-colors cursor-pointer;
  /* 确保在编译后应用中正确显示 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* 添加Webkit前缀以确保在不同浏览器中一致显示 */
  -webkit-transition: color 0.2s ease;
  cursor: pointer;
  font-size: 1.5rem;
  line-height: 1;
  font-weight: 500;
}

.form-group {
  @apply mb-6;
  position: relative;
}

.form-group label {
  @apply block text-sm font-semibold text-gray-700 mb-3;
  letter-spacing: -0.01em;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.02);
  /* 确保在编译后应用中正确显示 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* 添加Webkit前缀以确保在不同浏览器中一致显示 */
  -webkit-text-shadow: 0 1px 1px rgba(0, 0, 0, 0.02);
  -webkit-letter-spacing: -0.01em;
  font-weight: 600;
}

.form-select {
  @apply w-full px-6 py-4 border border-gray-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent focus:shadow-xl transition-all duration-300 bg-white/95 backdrop-blur-sm;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
  /* 确保在编译后应用中正确显示 */
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  /* 添加Webkit前缀以确保在不同浏览器中一致显示 */
  -webkit-box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05),
    0 1px 3px rgba(0, 0, 0, 0.1);
  -webkit-backdrop-filter: blur(8px);
  -webkit-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  /* 添加额外的优化以确保在不同平台和浏览器中一致显示 */
  -webkit-border-radius: 0.75rem;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  font-family: inherit;
  line-height: 1.5;
}

.form-input,
.form-textarea {
  @apply w-full px-6 py-4 border border-gray-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent focus:shadow-xl transition-all duration-300 bg-white/95 backdrop-blur-sm;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
  /* 确保在编译后应用中正确显示 */
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  /* 添加Webkit前缀以确保在不同浏览器中一致显示 */
  -webkit-box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05),
    0 1px 3px rgba(0, 0, 0, 0.1);
  -webkit-backdrop-filter: blur(8px);
  -webkit-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  /* 添加额外的优化以确保在不同平台和浏览器中一致显示 */
  -webkit-border-radius: 0.75rem;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  font-family: inherit;
  line-height: 1.5;
}

.form-textarea {
  @apply h-32 resize-y;
  /* 确保在编译后应用中正确显示 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  /* 添加Webkit前缀以确保在不同浏览器中一致显示 */
  -webkit-resize: vertical;
  resize: vertical;
  min-height: 8rem;
  max-height: 40rem;
}

.cancel-btn {
  @apply px-6 py-2.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors;
  /* 确保在编译后应用中正确显示 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* 添加Webkit前缀以确保在不同浏览器中一致显示 */
  -webkit-border-radius: 0.5rem;
  -webkit-transition: background-color 0.2s ease;
  font-weight: 500;
  cursor: pointer;
}

.save-btn {
  @apply px-8 py-3 text-sm font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5;
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3),
    0 4px 12px rgba(99, 102, 241, 0.15);
  letter-spacing: -0.01em;
  /* 添加Webkit前缀以确保在不同浏览器中一致显示 */
  -webkit-box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3),
    0 4px 12px rgba(99, 102, 241, 0.15);
  -webkit-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  -webkit-transform: translateY(0);
  -webkit-transform: translate3d(0, 0, 0);
}

.delete-btn {
  @apply px-8 py-3 text-sm font-semibold bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5;
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3),
    0 4px 12px rgba(220, 38, 38, 0.15);
  letter-spacing: -0.01em;
  /* 添加Webkit前缀以确保在不同浏览器中一致显示 */
  -webkit-box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3),
    0 4px 12px rgba(220, 38, 38, 0.15);
  -webkit-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  -webkit-transform: translateY(0);
  -webkit-transform: translate3d(0, 0, 0);
}

.config-btn {
  @apply flex items-center gap-3 px-6 py-3 text-sm font-medium text-gray-700 bg-gray-50/90 border border-gray-200/80 rounded-xl hover:bg-gray-100/90 hover:border-gray-300/80 hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 shadow-md backdrop-blur-sm;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05);
  letter-spacing: -0.01em;
  /* 添加Webkit前缀以确保在不同浏览器中一致显示 */
  -webkit-box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1),
    0 2px 8px rgba(0, 0, 0, 0.05);
  -webkit-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  -webkit-transform: translateY(0);
  -webkit-transform: translate3d(0, 0, 0);
  -webkit-backdrop-filter: blur(8px);
}

.prompt-input-group {
  @apply relative;
}

.variable-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
  padding: 16px;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border: 1px solid rgba(233, 236, 239, 0.8);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05), 0 2px 6px rgba(0, 0, 0, 0.03);
  backdrop-filter: blur(8px);
  /* 添加Webkit前缀以确保在不同浏览器中一致显示 */
  -webkit-backdrop-filter: blur(8px);
  -webkit-box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05),
    0 2px 6px rgba(0, 0, 0, 0.03);
  -webkit-border-radius: 12px;
  /* 确保在编译后应用中正确显示 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.variable-toolbar button {
  padding: 8px 16px;
  border: 1px solid rgba(222, 226, 230, 0.8);
  border-radius: 8px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.95),
    rgba(248, 249, 250, 0.9)
  );
  color: #495057;
  font-size: 0.9em;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(4px);
  /* 添加Webkit前缀以确保在不同浏览器中一致显示 */
  -webkit-backdrop-filter: blur(4px);
  -webkit-box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
  -webkit-border-radius: 8px;
  -webkit-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  /* 确保在编译后应用中正确显示 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  -webkit-appearance: none;
}

.variable-toolbar button:hover {
  background: linear-gradient(
    135deg,
    rgba(233, 236, 239, 0.95),
    rgba(206, 212, 218, 0.9)
  );
  border-color: rgba(173, 181, 189, 0.9);
  color: #212529;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12), 0 3px 10px rgba(0, 0, 0, 0.08);
  /* 添加Webkit前缀以确保在不同浏览器中一致显示 */
  -webkit-box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12),
    0 3px 10px rgba(0, 0, 0, 0.08);
  -webkit-transform: translateY(-2px);
  -webkit-transform: translate3d(0, -2px, 0); /* 触发硬件加速 */
}

.variable-toolbar button:active {
  background: linear-gradient(
    135deg,
    rgba(206, 212, 218, 0.95),
    rgba(173, 181, 189, 0.9)
  );
  border-color: rgba(148, 163, 184, 0.9);
  color: #212529;
  transform: translateY(0px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.06);
  /* 添加Webkit前缀以确保在不同浏览器中一致显示 */
  -webkit-box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15),
    0 1px 3px rgba(0, 0, 0, 0.06);
  -webkit-transform: translateY(0px);
  -webkit-transform: translate3d(0, 0, 0); /* 触发硬件加速 */
}

.advanced-settings-btn {
  @apply w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-gray-50/95 to-gray-100/95 text-gray-700 rounded-xl hover:from-gray-100/95 hover:to-gray-200/95 transition-all duration-300 shadow-md hover:shadow-lg border border-gray-200/80 backdrop-blur-sm;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05), 0 2px 6px rgba(0, 0, 0, 0.03);
  position: relative;
  overflow: hidden;
  /* 添加Webkit前缀以确保在不同浏览器中一致显示 */
  -webkit-box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05),
    0 2px 6px rgba(0, 0, 0, 0.03);
  -webkit-border-radius: 0.75rem;
  -webkit-backdrop-filter: blur(4px);
  -webkit-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  /* 确保在编译后应用中正确显示 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

.advanced-settings-btn:before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.03),
    rgba(147, 197, 253, 0.03)
  );
  opacity: 0;
  transition: opacity 0.2s ease;
  border-radius: inherit;
  /* 添加Webkit前缀以确保在不同浏览器中一致显示 */
  -webkit-border-radius: inherit;
  -webkit-transition: opacity 0.2s ease;
}

.advanced-settings-btn:hover:before {
  opacity: 1;
}

.advanced-settings-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05);
  /* 添加Webkit前缀以确保在不同浏览器中一致显示 */
  -webkit-transform: translateY(-1px);
  -webkit-box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1),
    0 4px 12px rgba(0, 0, 0, 0.05);
  -webkit-transform: translate3d(0, -1px, 0); /* 触发硬件加速 */
}

.arrow {
  @apply transition-transform duration-300 text-lg;
  color: #6b7280;
}

.arrow-up {
  transform: rotate(180deg);
  color: #3b82f6;
}

.advanced-settings {
  @apply mt-6 p-6 bg-gradient-to-br from-gray-50/80 to-gray-100/80 rounded-2xl border border-gray-200/60 backdrop-blur-sm;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.06), 0 4px 12px rgba(0, 0, 0, 0.03);
  animation: slideDown 0.3s ease-out;
  /* 添加Webkit前缀以确保在不同浏览器中一致显示 */
  -webkit-box-shadow: 0 8px 25px rgba(0, 0, 0, 0.06),
    0 4px 12px rgba(0, 0, 0, 0.03);
  -webkit-border-radius: 1rem;
  -webkit-backdrop-filter: blur(4px);
  -webkit-animation: slideDown 0.3s ease-out;
  /* 确保在编译后应用中正确显示 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slider-container {
  @apply flex items-center gap-6;
  margin-bottom: 1.5rem;
}

.slider {
  @apply flex-1 h-2 bg-gray-200 rounded-full outline-none appearance-none;
  background: linear-gradient(to right, #e5e7eb, #d1d5db);
  position: relative;
  /* 确保在编译后应用中正确显示 */
  -webkit-appearance: none;
  -moz-appearance: none;
  /* 添加Webkit前缀以确保在不同浏览器中一致显示 */
  -webkit-background-clip: padding-box;
  -webkit-border-radius: 9999px;
}

.slider::-webkit-slider-thumb {
  appearance: none;
  @apply w-6 h-6 bg-white rounded-full border-2 border-blue-500 cursor-pointer shadow-lg transition-all duration-200;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  /* 确保在编译后应用中正确显示 */
  -webkit-appearance: none;
  /* 添加Webkit前缀以确保在不同浏览器中一致显示 */
  -webkit-box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  -webkit-transition: all 0.2s ease;
  -webkit-transform: translateZ(0); /* 触发硬件加速 */
}

.slider::-webkit-slider-thumb:hover {
  @apply border-blue-600 transform scale-110;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  /* 添加Webkit前缀以确保在不同浏览器中一致显示 */
  -webkit-box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  -webkit-transform: scale(1.1) translateZ(0); /* 触发硬件加速 */
}

.slider::-moz-range-thumb {
  @apply w-6 h-6 bg-white rounded-full border-2 border-blue-500 cursor-pointer shadow-lg;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  /* 确保在编译后应用中正确显示 */
  -webkit-appearance: none;
  -moz-appearance: none;
  /* 添加Webkit前缀以确保在不同浏览器中一致显示 */
  -webkit-box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  -webkit-transition: all 0.2s ease;
}

.slider-value {
  @apply w-16 text-center text-sm font-semibold text-gray-700 bg-white px-3 py-2 rounded-lg border border-gray-200/80 shadow-sm backdrop-blur-sm;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  min-width: 4rem;
  /* 添加Webkit前缀以确保在不同浏览器中一致显示 */
  -webkit-box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  -webkit-backdrop-filter: blur(4px);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.slider-description {
  @apply mt-2 text-sm text-gray-600 px-3 py-1 bg-blue-50/50 rounded-lg border border-blue-100/50;
  color: #374151;
  font-weight: 500;
  /* 添加Webkit前缀以确保在不同浏览器中一致显示 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

/* 高级设置中的特殊样式 */
.advanced-settings .form-input {
  @apply w-full px-4 py-3 border border-gray-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent focus:shadow-lg transition-all duration-300 bg-white/95 backdrop-blur-sm;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.08);
  /* 添加Webkit前缀以确保在不同浏览器中一致显示 */
  -webkit-box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04),
    0 1px 3px rgba(0, 0, 0, 0.08);
  -webkit-border-radius: 0.75rem;
  -webkit-backdrop-filter: blur(4px);
  -webkit-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.advanced-settings .form-group label {
  @apply block text-sm font-semibold text-gray-700 mb-2;
  color: #374151;
  /* 确保在编译后应用中正确显示 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-weight: 600;
}

/* 响应式模态框位置修正 */
@media (max-width: 768px) {
  .modal {
    width: 95% !important;
    max-width: none !important;
    min-width: 18rem !important;
    max-height: 85vh !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    /* 确保在编译后应用中正确显示 */
    -webkit-transform: translate(-50%, -50%) !important;
  }
}

@media (max-width: 640px) {
  .modal {
    width: 98% !important;
    max-width: none !important;
    min-width: 16rem !important;
    max-height: 90vh !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    /* 确保在编译后应用中正确显示 */
    -webkit-transform: translate(-50%, -50%) !important;
  }
}

/* 添加高DPI屏幕支持 */
@media screen and (-webkit-min-device-pixel-ratio: 2),
  screen and (min-resolution: 192dpi) {
  .modal {
    -webkit-font-smoothing: subpixel-antialiased;
    -moz-osx-font-smoothing: auto;
  }

  .form-select,
  .form-input,
  .form-textarea {
    -webkit-font-smoothing: subpixel-antialiased;
    -moz-osx-font-smoothing: auto;
  }

  .modal-title {
    -webkit-font-smoothing: subpixel-antialiased;
    -moz-osx-font-smoothing: auto;
  }

  .form-group label {
    -webkit-font-smoothing: subpixel-antialiased;
    -moz-osx-font-smoothing: auto;
  }
}

/* 添加关键帧动画定义 */
@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translate(-50%, -40%) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

/* 添加Webkit关键帧动画定义以确保在不同浏览器中一致显示 */
@-webkit-keyframes modalSlideIn {
  from {
    opacity: 0;
    -webkit-transform: translate(-50%, -40%) scale(0.95);
  }
  to {
    opacity: 1;
    -webkit-transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 添加Webkit关键帧动画定义以确保在不同浏览器中一致显示 */
@-webkit-keyframes slideDown {
  from {
    opacity: 0;
    -webkit-transform: translateY(-10px);
  }
  to {
    opacity: 1;
    -webkit-transform: translateY(0);
  }
}

/* 全局样式优化 */
* {
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

input,
textarea,
select {
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  user-select: text;
}

/* 确保在Electron应用中正确显示 */
body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

/* 添加硬件加速优化 */
.modal,
.modal-overlay,
.form-select,
.form-input,
.form-textarea,
.slider,
.variable-toolbar button {
  -webkit-transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  -webkit-perspective: 1000;
}
</style>
