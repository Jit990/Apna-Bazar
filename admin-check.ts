import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function checkAdmin() {
    const { data: users, error } = await supabase.auth.admin.listUsers();
    console.log("Users:", users.users.map(u => ({ email: u.email, phone: u.phone, id: u.id })));

    const { data: profiles } = await supabase.from('profiles').select('user_id, role, full_name, email').eq('role', 'admin');
    console.log("Admin Profiles:", profiles);
}
checkAdmin();
