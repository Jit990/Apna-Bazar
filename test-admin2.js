
async function test() {
    const res = await fetch('https://apna-bazar-seven.vercel.app/admin/login', { redirect: 'manual' });
    console.log('Login page status:', res.status);
}
test();

