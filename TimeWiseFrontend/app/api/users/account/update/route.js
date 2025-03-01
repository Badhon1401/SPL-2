import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/dist/server/api-utils';

export async function PUT(req) {
  try {
    const userAcccountDetails = await req.json();

    const cookieStore = await cookies();
  const token = cookieStore.get("timewise-auth-token")?.value;

    if (!token) {
      redirect("/login");
    }

    const response = await fetch(
      `${process.env.BACKEND_SERVER_URL}/api/users/account/update`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userAcccountDetails),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || 'Failed to update account detials' },
        { status: response.status }
      );
    }

    const updatedUserAccount = await response.json();
    return NextResponse.json(updatedUserAccount, { status: 201 });
  } catch (error) {
    console.error('Account details modification Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
