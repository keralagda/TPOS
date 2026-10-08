import { redirect } from 'next/navigation';

export default function AdminBookingsRedirectPage() {
  redirect('/operations/control-tower');
}
