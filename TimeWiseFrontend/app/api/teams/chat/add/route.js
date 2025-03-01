import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req) {
  try {
    // Retrieve cookies for authentication
    const cookieStore = await cookies();
  const token = cookieStore.get("timewise-auth-token")?.value;


    // Redirect to login if no token is found
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Parse the request body for teamName and chat
    const body = await req.json();
    const { teamName, chat } = body;

    // Validate required fields
    if (!teamName || !chat) {
      return NextResponse.json(
        { error: 'Missing required fields: teamName or chat' },
        { status: 400 }
      );
    }

    // Send request to the backend
    const response = await fetch(
      `${process.env.BACKEND_SERVER_URL}/api/teams/chat/add`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ teamName, chat }),
      }
    );

    // Handle backend response
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || 'Failed to add team chat' },
        { status: response.status }
      );
    }

    // Return the updated team data as JSON
    const updatedTeam = await response.json();
    return NextResponse.json(updatedTeam);
  } catch (error) {
    console.error('Error adding team chat:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
