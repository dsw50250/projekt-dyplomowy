import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext"; // Новый
import ToastProvider from "../components/ToastProvider"; // Создай этот файл, как ниже

export const metadata = {
  title: "Task Management System",
  description: "Diploma Project",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
      </head>
      <body>
        <ThemeProvider> {/* Новый */}
          <AuthProvider>
            <ToastProvider>         
              {children}
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}