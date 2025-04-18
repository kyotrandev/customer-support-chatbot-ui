import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const accessToken = request.headers.get('authorization')?.split(' ')[1];
  if (!accessToken) {
    return NextResponse.json({ success: false, error: 'No access token' }, { status: 401 });
  }
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/api/authenticate`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}