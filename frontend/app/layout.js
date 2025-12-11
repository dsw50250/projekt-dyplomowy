import "./globals.css";
import { AuthProvider } from "../context/AuthContext";

export const metadata = {
  title: "My App",
  description: "Authentication",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
