import './globals.css';

export const metadata = {
  title: 'User Agreement Activity Timeline',
  description: 'Agreement event logging for service providers and clients',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
