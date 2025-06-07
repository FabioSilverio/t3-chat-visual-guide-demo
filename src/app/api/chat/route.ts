import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface GroqError {
  status?: number;
  message?: string;
  code?: string;
  error?: any;
  name?: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== GROQ API DEBUG ===');
    console.log('API Key present:', !!process.env.GROQ_API_KEY);
    console.log('API Key length:', process.env.GROQ_API_KEY?.length || 0);
    
    const { messages }: { messages: Message[] } = await request.json();
    console.log('Received messages count:', messages.length);

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'No messages provided' },
        { status: 400 }
      );
    }

    console.log('Calling Groq API...');
    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant', // Modelo gratuito e rápido
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7,
    });

    console.log('Groq response received successfully');
    console.log('Response usage:', response.usage);

    const aiMessage = response.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.';

    return NextResponse.json({ 
      message: aiMessage,
      usage: response.usage,
      model: 'llama-3.1-8b-instant',
      debug: 'Success with Groq'
    });

  } catch (error: unknown) {
    console.error('=== DETAILED GROQ ERROR ===');
    console.error('Error type:', typeof error);
    
    const groqError = error as GroqError;
    
    console.error('Error name:', groqError?.name);
    console.error('Error message:', groqError?.message);
    console.error('Error code:', groqError?.code);
    console.error('Error status:', groqError?.status);
    console.error('Full error:', error);
    
    // Verificar tipos específicos de erro Groq
    if (groqError?.status === 429) {
      console.error('Rate limit error details:', groqError?.error);
      return NextResponse.json(
        { 
          error: `Rate limit Groq excedido. Detalhes: ${groqError?.message || 'Limite de requisições atingido'}`,
          debug: 'Groq rate limit error',
          details: groqError?.error
        },
        { status: 429 }
      );
    }
    
    if (groqError?.status === 401) {
      return NextResponse.json(
        { 
          error: 'Groq API key inválida ou não configurada',
          debug: 'Groq auth error'
        },
        { status: 401 }
      );
    }

    if (groqError?.status === 402) {
      return NextResponse.json(
        { 
          error: 'Problema de billing Groq',
          debug: 'Groq payment error'
        },
        { status: 402 }
      );
    }
    
    return NextResponse.json(
      { 
        error: `Erro Groq: ${groqError?.message || 'Erro desconhecido'}`,
        debug: 'General Groq error',
        status: groqError?.status,
        code: groqError?.code
      },
      { status: 500 }
    );
  }
} 