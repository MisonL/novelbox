// 轻量级AI服务 - 使用原生fetch替代重量级SDK
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

type StreamCallback = (text: string, error?: string, complete?: boolean) => void;

export class AIService {
  private config: any;
  private abortController?: AbortController;

  constructor(config: any) {
    this.config = config;
  }

  // 统一的文本生成方法
  async generateText(
    prompt: string,
    stream?: StreamCallback,
    messages?: ChatMessage[]
  ): Promise<string> {
    const provider = this.config.provider;

    try {
      switch (provider) {
        case 'openai':
        case 'deepseek':
        case 'kimi':
        case 'wenxin':
        case 'alibailian':
        case 'siliconflow':
        case 'modelscope':
          return await this.generateWithOpenAICompatible(prompt, stream, messages);

        case 'anthropic':
          return await this.generateWithAnthropic(prompt, stream, messages);

        case 'gemini':
          return await this.generateWithGemini(prompt, stream, messages);

        case 'minimax':
          return await this.generateWithMinimax(prompt, stream, messages);

        default:
          throw new Error(`不支持的AI服务商: ${provider}`);
      }
    } catch (error) {
      console.error('AI生成失败:', error);
      throw error;
    }
  }

  // OpenAI兼容接口实现
  private async generateWithOpenAICompatible(
    prompt: string,
    stream?: StreamCallback,
    messages?: ChatMessage[]
  ): Promise<string> {
    const apiKey = this.config.apiKey;
    const model = this.config.model;
    const baseURL = this.getBaseURL();
    const temperature = this.getModelConfig().temperature;
    const maxTokens = this.getModelConfig().maxTokens;
    const topP = this.getModelConfig().topP;

    const chatMessages = messages || [{ role: 'user', content: prompt }];

    const requestBody = {
      model,
      messages: chatMessages,
      temperature,
      max_tokens: maxTokens,
      top_p: topP,
      stream: !!stream
    };

    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`OpenAI API请求失败: ${response.status} ${response.statusText}`);
    }

    if (stream) {
      return this.handleStreamResponse(response, stream);
    } else {
      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    }
  }

  // Anthropic实现
  private async generateWithAnthropic(
    prompt: string,
    _stream?: StreamCallback,
    messages?: ChatMessage[]
  ): Promise<string> {
    const apiKey = this.config.apiKey;
    const model = this.config.model;
    const temperature = this.getModelConfig().temperature;
    const maxTokens = this.getModelConfig().maxTokens;
    const topP = this.getModelConfig().topP;

    const chatMessages = messages || [{ role: 'user', content: prompt }];

    // 处理系统消息
    const systemMessages = chatMessages.filter(msg => msg.role === 'system');
    const nonSystemMessages = chatMessages.filter(msg => msg.role !== 'system');

    let systemInstruction = '';
    if (systemMessages.length > 0) {
      systemInstruction = systemMessages.map(msg => msg.content).join('\n\n');
    }

    const requestBody: any = {
      model,
      temperature,
      max_tokens: maxTokens,
      top_p: topP,
      messages: nonSystemMessages.filter(msg => msg.role === 'user' || msg.role === 'assistant')
        .map(msg => ({ role: msg.role, content: msg.content }))
    };

    if (systemInstruction) {
      requestBody.system = systemInstruction;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Anthropic API请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.content?.[0]?.text || '';
  }

  // Gemini实现
  private async generateWithGemini(
    prompt: string,
    _stream?: StreamCallback,
    messages?: ChatMessage[]
  ): Promise<string> {
    const apiKey = this.config.apiKey;
    const model = this.config.model;
    const temperature = this.getModelConfig().temperature;
    const maxTokens = this.getModelConfig().maxTokens;

    // Gemini使用不同的API格式
    const chatMessages = messages || [{ role: 'user', content: prompt }];

    // 转换消息格式
    const contents = chatMessages
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

    const requestBody = {
      contents,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens
      }
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Gemini API请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  // Minimax实现
  private async generateWithMinimax(
    prompt: string,
    stream?: StreamCallback,
    messages?: ChatMessage[]
  ): Promise<string> {
    const apiKey = this.config.apiKey;
    const model = this.config.model;
    const chatMessages = messages || [{ role: 'user', content: prompt }];

    const requestBody = {
      model,
      messages: chatMessages,
      stream: !!stream
    };

    const response = await fetch('https://api.minimaxi.com/v1/text/chatcompletion_v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Minimax API请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  // 处理流式响应
  private async handleStreamResponse(response: Response, stream: StreamCallback): Promise<string> {
    const reader = response.body?.getReader();
    if (!reader) throw new Error('无法读取流式响应');

    const decoder = new TextDecoder();
    let fullText = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            if (data === '[DONE]') {
              stream('', undefined, true);
              return fullText;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullText += content;
                stream(content);
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return fullText;
  }

  // 取消生成
  cancel() {
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  // 获取基础URL
  private getBaseURL(): string {
    const provider = this.config.provider;
    const proxyURL = this.config.proxyUrl;

    const urlMap: Record<string, string> = {
      'openai': 'https://api.openai.com/v1',
      'deepseek': 'https://api.deepseek.com',
      'kimi': 'https://api.moonshot.cn/v1',
      'wenxin': 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions',
      'alibailian': 'https://api.tongyi.aliyuns.com/qwen2',
      'siliconflow': 'https://api.siliconflow.cn/v1',
      'modelscope': 'https://dashscope.aliyuncs.com/compatible-mode/v1'
    };

    return proxyURL || urlMap[provider] || 'https://api.openai.com/v1';
  }

  // 获取模型配置
  private getModelConfig() {
    const modelConfig = this.config.modelConfigs?.[this.config.model];
    return {
      temperature: modelConfig?.temperature ?? 0.7,
      maxTokens: modelConfig?.maxTokens ?? 25000,
      topP: modelConfig?.topP ?? 0.95
    };
  }
}

export default AIService;
