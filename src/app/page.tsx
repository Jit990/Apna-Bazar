import { redirect } from 'next/navigation';

// Redirect root to /(customer) layout / home page
export default function RootPage() {
  redirect('/');
}
