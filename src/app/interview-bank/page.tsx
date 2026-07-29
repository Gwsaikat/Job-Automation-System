import { redirect } from 'next/navigation';

export default function InterviewBankRedirect() {
  redirect('/personal?tab=star-bank');
}
