import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface OpenAIError {
  status?: number;
  message?: string;
  code?: string;
  error?: any;
  name?: string;
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

  } catch (error: unknown) {
    console.error('=== DETAILED ERROR ===');
    console.error('Error type:', typeof error);
    
    const openAIError = error as OpenAIError;
    
    console.error('Error name:', openAIError?.name);
    console.error('Error message:', openAIError?.message);
    console.error('Error code:', openAIError?.code);
    console.error('Error status:', openAIError?.status);
    console.error('Full error:', error);
    
    // Verificar tipos específicos de erro OpenAI
    if (openAIError?.status === 429) {
      console.error('Rate limit error details:', openAIError?.error);
      return NextResponse.json(
        { 
          error: `Rate limit excedido. Detalhes: ${openAIError?.message || 'Limite de requisições atingido'}`,
          debug: 'Rate limit error',
          details: openAIError?.error
        },
        { status: 429 }
      );
    }
    
    if (openAIError?.status === 401) {
      return NextResponse.json(
        { 
          error: 'API key inválida ou não configurada',
          debug: 'Auth error'
        },
        { status: 401 }
      );
    }

    if (openAIError?.status === 402) {
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
        error: `Erro OpenAI: ${openAIError?.message || 'Erro desconhecido'}`,
        debug: 'General error',
        status: openAIError?.status,
        code: openAIError?.code
      },
      { status: 500 }
    );
  }
} 