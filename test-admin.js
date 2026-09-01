
async function test() {
    const res1 = await fetch('https://apna-bazar-seven.vercel.app/admin', { redirect: 'manual' });
    console.log('Unauthenticated /admin status:', res1.status, res1.headers.get('location'));
}
test();

