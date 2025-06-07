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
    console.log('=== CHAT API DEBUG ===');
    console.log('API Key present:', !!process.env.OPENAI_API_KEY);
    console.log('API Key length:', process.env.OPENAI_API_KEY?.length || 0);
    console.log('API Key starts with:', process.env.OPENAI_API_KEY?.substring(0, 10) || 'undefined');
    
    const { messages }: { messages: Message[] } = await request.json();
    console.log('Received messages count:', messages.length);

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'No messages provided' },
        { status: 400 }
      );
    }

    console.log('Calling OpenAI API...');
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 500, // Reduzindo para economizar
      temperature: 0.7,
      stream: false,
    });

    console.log('OpenAI response received successfully');
    console.log('Response usage:', response.usage);

    const aiMessage = response.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.';

    return NextResponse.json({ 
      message: aiMessage,
      usage: response.usage,
      debug: 'Success'
    });

  } catch (error: any) {
    console.error('=== DETAILED ERROR ===');
    console.error('Error type:', typeof error);
    console.error('Error name:', error?.name);
    console.error('Error message:', error?.message);
    console.error('Error code:', error?.code);
    console.error('Error status:', error?.status);
    console.error('Full error:', error);
    
    // Verificar tipos específicos de erro OpenAI
    if (error?.status === 429) {
      console.error('Rate limit error details:', error?.error);
      return NextResponse.json(
        { 
          error: `Rate limit excedido. Detalhes: ${error?.message}`,
          debug: 'Rate limit error',
          details: error?.error
        },
        { status: 429 }
      );
    }
    
    if (error?.status === 401) {
      return NextResponse.json(
        { 
          error: 'API key inválida ou não configurada',
          debug: 'Auth error'
        },
        { status: 401 }
      );
    }

    if (error?.status === 402) {
      return NextResponse.json(
        { 
          error: 'Pagamento necessário - verifique billing OpenAI',
          debug: 'Payment error'
        },
        { status: 402 }
      );
    }
    
    return NextResponse.json(
      { 
        error: `Erro OpenAI: ${error?.message || 'Erro desconhecido'}`,
        debug: 'General error',
        status: error?.status,
        code: error?.code
      },
      { status: 500 }
    );
  }
} 