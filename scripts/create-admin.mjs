import { createClient } from "@supabase/supabase-js";

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
  "ADMIN_FULL_NAME",
];

const missing = required.filter((name) => !process.env[name]?.trim());
if (missing.length > 0) {
  console.error(`Missing required values: ${missing.join(", ")}`);
  console.error("Add them to .env.local, then run npm run admin:create again.");
  process.exit(1);
}

const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const fullName = process.env.ADMIN_FULL_NAME.trim();

if (!/^\S+@\S+\.\S+$/.test(email)) {
  console.error("ADMIN_EMAIL must be a valid email address.");
  process.exit(1);
}

if (password.length < 12 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
  console.error("ADMIN_PASSWORD must contain at least 12 characters, including uppercase, lowercase, a number, and a symbol.");
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const { data, error: createError } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { full_name: fullName },
});

if (createError || !data.user) {
  console.error(createError?.message === "A user with this email address has already been registered"
    ? "An Auth user with this email already exists. Use the Supabase dashboard to reset its password or create its missing profile."
    : "The admin Auth user could not be created. Check the Supabase configuration and try again.");
  process.exit(1);
}

const { error: profileError } = await supabase.from("profiles").insert({
  id: data.user.id,
  full_name: fullName,
  role: "ADMIN",
});

if (profileError) {
  await supabase.auth.admin.deleteUser(data.user.id);
  console.error("The admin profile could not be created. The partial Auth user was removed. Apply the database migration, then try again.");
  process.exit(1);
}

console.log(`Admin created successfully for ${email}.`);
console.log("Remove ADMIN_PASSWORD from .env.local now that the account exists.");
