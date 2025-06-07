import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('API Key present:', !!process.env.OPENAI_API_KEY);
    
    const { messages }: { messages: Message[] } = await request.json();
    console.log('Received messages:', messages.length);

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'No messages provided' },
        { status: 400 }
      );
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7,
      stream: false,
    });

    console.log('OpenAI response received');

    const aiMessage = response.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.';

    return NextResponse.json({ 
      message: aiMessage,
      usage: response.usage
    });

  } catch (error) {
    console.error('Erro detalhado na API OpenAI:', error);
    
    // Tratar diferentes tipos de erro
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Erro de autenticação da API' },
          { status: 401 }
        );
      }
      if (error.message.includes('quota')) {
        return NextResponse.json(
          { error: 'Cota da API excedida' },
          { status: 429 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor. Tente novamente.' },
      { status: 500 }
    );
  }
} 