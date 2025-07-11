import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

interface Message {
  role: string;
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { messages }: { messages: Message[] } = await request.json();

    // Criar um resumo da conversa para análise
    const conversationText = messages
      .map((msg) => `${msg.role === 'user' ? 'Usuário' : 'IA'}: ${msg.content}`)
      .join('\n\n');

    const analysisPrompt = `
Analise a seguinte conversa e extraia informações estruturadas como um sistema de Visual Guide inteligente.

Conversa:
${conversationText}

Por favor, retorne um JSON com a seguinte estrutura:
{
  "keyPoints": [
    "Ponto principal 1",
    "Ponto principal 2",
    "..."
  ],
  "topics": [
    {
      "name": "Tópico identificado",
      "importance": "high|medium|low",
      "summary": "Breve resumo do tópico"
    }
  ],
  "actionItems": [
    "Item de ação 1",
    "Item de ação 2"
  ],
  "questions": [
    "Pergunta relevante 1",
    "Pergunta relevante 2"
  ],
  "summary": "Resumo geral da conversa em 1-2 frases",
  "nextSteps": "Próximos passos sugeridos"
}

Foque em extrair os pontos mais importantes e relevantes da conversa, similar ao que o Google Docs faz com bullet points automáticos.`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente especializado em análise de conversas e extração de informações estruturadas. Sempre retorne respostas em JSON válido.'
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.3,
    });

    const analysisResult = response.choices[0]?.message?.content;
    
    try {
      const parsedAnalysis = JSON.parse(analysisResult || '{}');
      return NextResponse.json(parsedAnalysis);
    } catch {
      // Se o JSON não for válido, retornar estrutura padrão
      return NextResponse.json({
        keyPoints: ['Conversa em andamento...'],
        topics: [],
        actionItems: [],
        questions: [],
        summary: 'Análise da conversa em progresso',
        nextSteps: 'Continue a conversa para mais insights'
      });
    }

  } catch (error) {
    console.error('Erro na análise da conversa:', error);
    return NextResponse.json(
      { error: 'Erro ao analisar a conversa' },
      { status: 500 }
    );
  }
} 