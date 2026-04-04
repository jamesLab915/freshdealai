import { NextResponse } from "next/server";

export type ApiSuccess<T> = {
  success: true;
  source: "database" | "mock";
  data: T;
  meta: Record<string, unknown>;
};

export type ApiFailure = {
  success: false;
  error: string;
};

export function jsonOk<T>(
  source: "database" | "mock",
  data: T,
  meta: Record<string, unknown> = {}
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, source, data, meta });
}

export function jsonErr(
  message: string,
  status = 400
): NextResponse<ApiFailure> {
  return NextResponse.json({ success: false, error: message }, { status });
}
