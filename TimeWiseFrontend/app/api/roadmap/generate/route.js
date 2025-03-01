import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/dist/server/api-utils';

export async function POST(req) {
  try {
    const roadMapDetails = await req.json();

    const cookieStore = await cookies();
    const token = cookieStore.get("timewise-auth-token")?.value;

    if (!token) {
      redirect("/login");
    }

    const response = await fetch(
      `${process.env.BACKEND_SERVER_URL}/api/ai/roadmap/generate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(roadMapDetails),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || 'Failed to create roadmap.' },
        { status: response.status }
      );
    }

    const createdRoadMap = await response.json();
    return NextResponse.json(createdRoadMap, { status: 201 });
  } catch (error) {
    console.error('Roadmap Creation Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
