# 🚀 Configuração da Groq API (Gratuita e Sem Restrições!)

## ✨ **Por que Groq?**
- ✅ **100% Gratuito**
- ✅ **Super rápido** (inferência em hardware especializado)  
- ✅ **Rate limits generosos** (até 30 req/min gratuitas)
- ✅ **Modelos open source**: Llama 3.1, Mixtral, Gemma
- ✅ **Sem necessidade de cartão de crédito**

## 🔧 **Como Configurar:**

### 1. **Criar Conta Gratuita:**
   - Acesse: https://console.groq.com/
   - Faça login com GitHub/Google (super rápido)
   - **Não precisa de cartão de crédito!**

### 2. **Obter API Key:**
   - Vá em "API Keys" no dashboard
   - Clique em "Create API Key"
   - Copie sua chave (começa com `gsk_...`)

### 3. **Configurar no Projeto:**
   ```bash
   # Edite o arquivo .env.local
   GROQ_API_KEY=gsk_sua_chave_aqui
   ```

### 4. **Reiniciar o Servidor:**
   ```bash
   npm run dev
   ```

## 🎯 **Modelos Disponíveis:**
- **llama-3.1-8b-instant** ⭐ (Recomendado - Rápido)
- **llama-3.1-70b-versatile** (Mais inteligente)
- **mixtral-8x7b-32768** (Contexto grande)
- **gemma-7b-it** (Google)

## 🔥 **Vantagens vs OpenAI:**
| Aspecto | Groq | OpenAI |
|---------|------|--------|
| Preço | **Gratuito** | Pago |
| Rate Limit | **30/min** | 3/min (conta nova) |
| Velocidade | **Ultra rápido** | Normal |
| Setup | **Sem cartão** | Precisa cartão |
| Modelos | Open source | Proprietário |

## 🚀 **Já está configurado!**
O projeto agora usa **Llama 3.1** que é:
- Tão bom quanto GPT-3.5
- Mais rápido que ChatGPT
- Completamente gratuito!

---
**Agora você pode usar o T3 Chat sem limitações! 🎉** 