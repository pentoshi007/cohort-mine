import Link from "next/link";


export default function Home() {
  return (
    <div>
    <h1>Home</h1>
      <br/><br/>
      <Link href="/auth/signup">Signup</Link>
      <br/><br/>
      <Link href="/auth/signin">Login</Link>
      <br/><br/>
      <Link href="/user">User</Link>
    </div>
  );
}
