import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("timewise-auth-token")?.value;

    if (!token) {
      // Redirect to login if no token is found
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const url = new URL(req.url);
    const previousNumberOfDays = url.searchParams.get('previousNumberOfDays');

    const response = await fetch(
      `${process.env.BACKEND_SERVER_URL}/api/report/performance/current?previousNumberOfDays=${previousNumberOfDays}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );


if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
}

const text = await response.text(); // Get raw text first

// Check if text is empty before parsing JSON
const performanceReport = text ? JSON.parse(text) : [];

return NextResponse.json(performanceReport, { status: 200 });

  } catch (error) {
    console.error('Performance Report Fetching Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}