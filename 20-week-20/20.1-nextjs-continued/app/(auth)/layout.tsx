export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <h1 className="text-3xl font-semibold text-center py-6">
          Authentication
        </h1>
      </header>
      <main className="max-w-md mx-auto px-4 py-8">{children}</main>
      <footer className="text-center text-gray-600 text-sm py-4">
        © {new Date().getFullYear()} All rights reserved
      </footer>
    </div>
  );
}
