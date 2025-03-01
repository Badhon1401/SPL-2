// app/page.js
import { redirect } from "next/navigation";
import { cookies } from 'next/headers';
export const metadata = {
  title: "TimeWise - Home",
  description: "Welcome to TimeWise, manage your time and productivity.",
};

// Mark the component as async
async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("timewise-auth-token")?.value;

  if (!token) {
    redirect("/welcome");
  }

  redirect("/home");
}

export default HomePage;
