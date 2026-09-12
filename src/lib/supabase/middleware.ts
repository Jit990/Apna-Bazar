import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Allow the app shell and admin login page to render in local setups
    // before Supabase environment variables have been configured.
    if (!supabaseUrl || !supabaseKey) {
        return supabaseResponse;
    }

    const supabase = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Refresh session if expired
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Protect /admin routes — EXCLUDE /admin/login to prevent infinite redirect loop
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
    const isAdminLogin = request.nextUrl.pathname === '/admin/login';

    if (isAdminRoute && !isAdminLogin) {
        if (!user) {
            const url = request.nextUrl.clone();
            url.pathname = '/admin/login';
            return NextResponse.redirect(url);
        }

        // Check admin role server-side
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', user.id)
            .single();

        if (!profile || !['admin', 'manager', 'staff'].includes(profile.role)) {
            const url = request.nextUrl.clone();
            url.pathname = '/admin/login';
            url.searchParams.set('error', 'unauthorized');
            return NextResponse.redirect(url);
        }
    }

    // If user is already logged in as admin and visits /admin/login, redirect to dashboard
    if (isAdminLogin && user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', user.id)
            .single();

        if (profile && ['admin', 'manager', 'staff'].includes(profile.role)) {
            const url = request.nextUrl.clone();
            url.pathname = '/admin';
            return NextResponse.redirect(url);
        }
    }

    return supabaseResponse;
}
