import { NextResponse } from "next/server";
import { z } from "zod";

/** Keep malformed JSON and invalid forms out of the database, with readable errors. */
export async function parseRequest<T extends z.ZodType>(
  request: Request,
  schema: T,
): Promise<
  | { data: z.output<T>; error?: never }
  | { data?: never; error: NextResponse }
> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { error: NextResponse.json({ error: "El cuerpo de la solicitud debe ser JSON válido." }, { status: 400 }) };
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return {
      error: NextResponse.json(
        { error: result.error.issues[0]?.message ?? "Revisa los datos del formulario." },
        { status: 400 },
      ),
    };
  }
  return { data: result.data };
}
