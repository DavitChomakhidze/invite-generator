import { NextResponse, type NextRequest } from "next/server";

/**
 * Only the generator is private. Invitations, responses pages and the reply API
 * stay public because guests and customers open them without a password.
 */
export const config = { matcher: "/" };

const REALM = 'Basic realm="occasion generator", charset="UTF-8"';

function sameText(a: string, b: string) {
  const left = new TextEncoder().encode(a);
  const right = new TextEncoder().encode(b);
  // Compare every byte so the response time doesn't reveal how much matched.
  let difference = left.length ^ right.length;
  for (let index = 0; index < Math.max(left.length, right.length); index++)
    difference |= (left[index] ?? 0) ^ (right[index] ?? 0);
  return difference === 0;
}

function suppliedPassword(request: NextRequest) {
  const [scheme, encoded] = (request.headers.get("authorization") ?? "").split(
    " ",
  );
  if (scheme !== "Basic" || !encoded) return null;
  try {
    const decoded = new TextDecoder().decode(
      Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0)),
    );
    return decoded.slice(decoded.indexOf(":") + 1);
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const password = process.env.GENERATOR_PASSWORD;
  if (!password)
    return process.env.NODE_ENV === "production"
      ? new NextResponse(
          "The invitation generator is locked. Set GENERATOR_PASSWORD to open it.",
          { status: 503 },
        )
      : NextResponse.next();
  const supplied = suppliedPassword(request);
  if (supplied !== null && sameText(supplied, password))
    return NextResponse.next();
  return new NextResponse("Password required.", {
    status: 401,
    headers: { "WWW-Authenticate": REALM },
  });
}
