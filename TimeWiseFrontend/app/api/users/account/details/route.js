// app/api/userData/route.js
import { cookies } from "next/headers";
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const cookieStore =  await cookies(); // Corrected cookie retrieval
    const token = cookieStore.get("timewise-auth-token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/welcome', req.url));
    }

    const url = new URL(req.url);
    const userName = url.searchParams.get('userName');

    const backendUrl = userName
      ? `${process.env.BACKEND_SERVER_URL}/api/users/account/details?userName=${userName}`
      : `${process.env.BACKEND_SERVER_URL}/api/users/account/details`; // If no userName, send request without userName

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
        if(response.status === 401){
            return NextResponse.redirect(new URL('/login', req.url));
        }
      return new Response("Backend Error", {status: response.status});
    }

    const userData = await response.json();
    return NextResponse.json(userData, { status: 200 }); // Use NextResponse.json
  } catch (error) {
    console.error("Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}