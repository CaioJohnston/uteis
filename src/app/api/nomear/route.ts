import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export interface NomearRequest {
  description: string;
  references?: string;
  languages?: string;
  vibe?: string;
}

export interface GeneratedName {
  name: string;
  origin: string;
  vibe: string;
}

function buildPrompt(body: NomearRequest): string {
  const extras: string[] = [];
  if (body.references) extras.push(`REFERÊNCIAS PESSOAIS: ${body.references}`);
  if (body.languages) extras.push(`IDIOMAS QUE GOSTA: ${body.languages}`);
  if (body.vibe) extras.push(`ESTILO / VIBE: ${body.vibe}`);

  return `Você é um especialista em naming criativo para projetos tech.
Gere exatamente 8 nomes únicos para um projeto com as seguintes características:

PROJETO: ${body.description}
${extras.length > 0 ? "\n" + extras.join("\n") : ""}

Regras obrigatórias:
- Misture referências pessoais com o contexto do projeto quando houver
- Evite nomes genéricos como Hub, App, Pro, Plus, AI, Genius, Smart
- Prefira nomes curtos (1-2 palavras), memoráveis e com personalidade
- Varie idiomas: português, inglês, latim, ou outros que façam sentido
- Cada nome deve ter uma explicação clara e específica da sua origem
- O campo "vibe" deve ter 3-5 palavras que descrevam o tom do nome
- Seja criativo — pense em metáforas, referências culturais, etimologia, sonoridade

Retorne SOMENTE um array JSON válido, sem markdown, sem explicação extra:
[{"name":"...","origin":"...","vibe":"..."}]`;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY não configurada." },
      { status: 500 }
    );
  }

  let body: NomearRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  if (!body.description || body.description.trim().length < 5) {
    return NextResponse.json(
      { error: "Descrição muito curta. Descreva melhor o seu projeto." },
      { status: 400 }
    );
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: buildPrompt(body),
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = result.text ?? "";
    const names: GeneratedName[] = JSON.parse(text);

    if (!Array.isArray(names)) {
      throw new Error("Resposta inesperada do modelo.");
    }

    return NextResponse.json({ names });
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    const isUnavailable =
      message.includes("503") ||
      message.includes("UNAVAILABLE") ||
      message.includes("high demand");
    const userMessage = isUnavailable
      ? "Modelo indisponível por alta demanda. Tente novamente em alguns instantes."
      : "Erro ao gerar nomes. Tente novamente.";
    return NextResponse.json({ error: userMessage }, { status: 500 });
  }
}
