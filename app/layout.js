import './globals.css';

export const metadata = {
  title: '2026 FIFA World Cup - Official Annex C Sync',
  description: 'Official Annex C combinations synced from Wikipedia',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
