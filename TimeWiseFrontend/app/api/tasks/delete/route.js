import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req) {
  try {
    const url = new URL(req.url);
    const taskName = url.searchParams.get('taskName');

   
    if (!taskName) {
      return NextResponse.json(
        { error: 'Task Name is required' }, 
        { status: 400 }
      );
    }
     const cookieStore = await cookies();
      const token = cookieStore.get("timewise-auth-token")?.value;
    
        if (!token) {
          redirect("/login");
        }

    const response = await fetch(
      `${process.env.BACKEND_SERVER_URL}/api/tasks/delete?taskName=${taskName}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
         },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || 'Failed to delete task' },
        { status: response.status }
      );
    }
    
    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error('Task Deleting Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}