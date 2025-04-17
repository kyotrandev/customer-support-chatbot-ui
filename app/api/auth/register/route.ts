import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/api/sign-up`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  console.log(data)
  return NextResponse.json(data, { status: response.status });
}