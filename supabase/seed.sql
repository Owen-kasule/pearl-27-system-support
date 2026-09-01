-- Pearl 27 System Support sample data
--
-- Safe for local development and staging only. These fictional email addresses
-- use the reserved .example domain and cannot deliver email to real employees.
-- No admin credentials are seeded; create the Auth user separately and add its
-- profile using the documented bootstrap process in README.md.

insert into public.tickets (
  id,
  ticket_number,
  employee_name,
  employee_email,
  issue_title,
  issue_description,
  status,
  resolution_notes,
  created_at,
  updated_at,
  resolved_at
)
values
  (
    '27000000-0000-4000-8000-000000000001',
    'P27-000001',
    'Amina N.',
    'amina@pearl27.example',
    'I cannot access my Sphere account',
    'After entering my email and password, Sphere returns an access denied message. I was able to sign in yesterday.',
    'SUBMITTED',
    null,
    now() - interval '35 minutes',
    now() - interval '35 minutes',
    null
  ),
  (
    '27000000-0000-4000-8000-000000000002',
    'P27-000002',
    'Daniel O.',
    'daniel@pearl27.example',
    'Password reset link has expired',
    'The password reset email arrived, but the link says it has expired when I open it. I requested a second link and received the same message.',
    'IN_PROGRESS',
    null,
    now() - interval '3 hours',
    now() - interval '40 minutes',
    null
  ),
  (
    '27000000-0000-4000-8000-000000000003',
    'P27-000003',
    'Grace T.',
    'grace@pearl27.example',
    'My department is incorrect in Sphere',
    'My Sphere profile currently lists Operations, but I moved to Partnerships this month. Please help update the department shown on my account.',
    'RESOLVED',
    'The employee profile was updated to Partnerships and the account cache was refreshed.',
    now() - interval '2 days',
    now() - interval '1 day',
    now() - interval '1 day'
  ),
  (
    '27000000-0000-4000-8000-000000000004',
    'P27-000004',
    'Isaac M.',
    'isaac@pearl27.example',
    'Verification code is not arriving',
    'Sphere asks for a verification code after sign-in, but no code has arrived after several attempts. I checked the spam folder as well.',
    'SUBMITTED',
    null,
    now() - interval '5 hours',
    now() - interval '5 hours',
    null
  ),
  (
    '27000000-0000-4000-8000-000000000005',
    'P27-000005',
    'Lydia K.',
    'lydia@pearl27.example',
    'Sphere page stays blank after sign-in',
    'Sign-in completes, but the dashboard remains blank. I have tried refreshing the page and using another browser.',
    'IN_PROGRESS',
    null,
    now() - interval '1 day 4 hours',
    now() - interval '2 hours',
    null
  ),
  (
    '27000000-0000-4000-8000-000000000006',
    'P27-000006',
    'Peter W.',
    'peter@pearl27.example',
    'Unable to update my profile photo',
    'When I select a new profile photo and save, Sphere continues showing the old image.',
    'RESOLVED',
    'The outdated image was removed from the profile cache and the new photo now appears correctly.',
    now() - interval '4 days',
    now() - interval '3 days',
    now() - interval '3 days'
  )
on conflict (id) do nothing;

-- Make the next generated ticket P27-000007 or higher while preserving a
-- sequence that may already have advanced beyond the sample range.
select setval(
  'public.ticket_number_seq',
  greatest((select last_value from public.ticket_number_seq), 6),
  true
);

-- Re-running this file is safe: the fixed sample rows are ignored.
