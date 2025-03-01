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

    const response = await fetch(
      `${process.env.BACKEND_SERVER_URL}/api/report/performance/previous`,
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
const previousPerformanceReports = text ? JSON.parse(text) : [];

return NextResponse.json(previousPerformanceReports, { status: 200 });

  } catch (error) {
    console.error('Previous Performance Reports Fetching Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}