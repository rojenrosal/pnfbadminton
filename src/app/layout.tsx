import Navbar from '@/components/Navbar/Navbar';
import './globals.css';


export const metadata = {
  title: 'Badminton Club',
  description: 'Manage teams, matches, and scores.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar/>
        <main className="container mx-auto p-4">{children}</main>
      </body>
    </html>
  );
}