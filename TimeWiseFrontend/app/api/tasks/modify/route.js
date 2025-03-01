import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/dist/server/api-utils';

export async function POST(req) {
  try {
    const taskDetails = await req.json();

    const cookieStore = await cookies();
  const token = cookieStore.get("timewise-auth-token")?.value;

    if (!token) {
      redirect("/login");
    }

    const response = await fetch(
      `${process.env.BACKEND_SERVER_URL}/api/tasks/modify`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskDetails),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || 'Failed to modify task' },
        { status: response.status }
      );
    }

    const modifiedTasks = await response.json();
    return NextResponse.json(modifiedTasks, { status: 201 });
  } catch (error) {
    console.error('Task modification Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
