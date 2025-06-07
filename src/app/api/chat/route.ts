import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7,
      stream: false,
    });

    const aiMessage = response.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.';

    return NextResponse.json({ 
      message: aiMessage,
      usage: response.usage
    });

  } catch (error) {
    console.error('Erro na API OpenAI:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 