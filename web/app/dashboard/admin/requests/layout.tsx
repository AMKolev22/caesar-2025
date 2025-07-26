import { Metadata } from 'next';
 
export const metadata: Metadata = {
  title: 'Caesar | Requests',
};

 
export default function RootLayout({ children }: { children: React.ReactNode }) {
 return (
    <html lang="en">
        <body><main>{children}</main></body>
    </html>
  )
}