import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const refreshToken = request.headers.get('authorization')?.split(' ')[1];
  if (!refreshToken) {
    return NextResponse.json({ success: false, error: 'No refresh token' }, { status: 400 });
  }
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/api/refreshToken`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${refreshToken}` },
  });
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}