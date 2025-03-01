import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("timewise-auth-token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    const url = new URL(req.url);
    const teamName = url.searchParams.get('teamName');
   

    const response = await fetch(
      `${process.env.BACKEND_SERVER_URL}/api/teams/details?teamName=${teamName}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || 'Failed to fetch team details' },
        { status: response.status }
      );
    }

    const team = await response.json();
    return NextResponse.json(team);
  } catch (error) {
    console.error('Team Fetching Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
