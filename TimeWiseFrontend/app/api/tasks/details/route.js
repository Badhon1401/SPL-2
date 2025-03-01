import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/dist/server/api-utils';

export async function GET(req) { // Corrected GET function
    try {
        
        const cookieStore = await cookies();
        const token = cookieStore.get("timewise-auth-token")?.value;
      

        if (!token) {
          redirect("/login");
        }
    
        const url = new URL(req.url);
        const taskName = url.searchParams.get('taskName');
        const taskOwner = url.searchParams.get('taskOwner');

        if (!taskName || !taskOwner) {
            return NextResponse.json(
                { error: 'Missing taskName or taskOwner' },
                { status: 400 }
            );
        }

        const response = await fetch(
            `${process.env.BACKEND_SERVER_URL}/api/tasks/details?taskName=${taskName}&taskOwner=${taskOwner}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            }
          );

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { error: errorText || 'Failed to fetch from backend' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Error fetching task details:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}