import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isStaffRole } from '@/lib/auth/roles';

function withPathname(request: NextRequest) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-pathname', request.nextUrl.pathname);
    return NextResponse.next({ request: { headers: requestHeaders } });
}

function redirectToAdminLogin(request: NextRequest, unauthorized = false) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    url.search = unauthorized ? '?error=unauthorized' : '';
    return NextResponse.redirect(url);
}

export async function updateSession(request: NextRequest) {
    let supabaseResponse = withPathname(request);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
    const isAdminLogin = request.nextUrl.pathname === '/admin/login';

    // Storefront can still render without env; admin is never left unprotected.
    if (!supabaseUrl || !supabaseKey) {
        if (isAdminRoute && !isAdminLogin) {
            return redirectToAdminLogin(request);
        }
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
                    supabaseResponse = withPathname(request);
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

    if (isAdminRoute && !isAdminLogin) {
        if (!user) {
            return redirectToAdminLogin(request);
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role, is_active')
            .eq('user_id', user.id)
            .single();

        if (!profile || !isStaffRole(profile.role) || profile.is_active === false) {
            return redirectToAdminLogin(request, true);
        }
    }

    if (isAdminLogin && user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role, is_active')
            .eq('user_id', user.id)
            .single();

        if (profile && isStaffRole(profile.role) && profile.is_active !== false) {
            const url = request.nextUrl.clone();
            url.pathname = '/admin';
            return NextResponse.redirect(url);
        }
    }

    return supabaseResponse;
}
