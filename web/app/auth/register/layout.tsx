import { Metadata } from 'next';
 
export const metadata: Metadata = {
  title: 'Caesar | Register',
};

 
export default function RootLayout({ children }: { children: React.ReactNode }) {
 return (
       <main>{children}</main>
  )
}