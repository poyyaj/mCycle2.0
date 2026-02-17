const http = require('http');

function makeRequest(method, path, body) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : null;
        const options = {
            hostname: 'localhost', port: 5000,
            path, method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (data) options.headers['Content-Length'] = Buffer.byteLength(data);

        const req = http.request(options, (res) => {
            let chunks = '';
            res.on('data', c => chunks += c);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, data: JSON.parse(chunks) }); }
                catch { resolve({ status: res.statusCode, data: chunks }); }
            });
        });
        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

async function test() {
    console.log('=== mCycle API Test ===\n');

    // Health check
    let r = await makeRequest('GET', '/api/health');
    console.log('1. Health check:', r.status === 200 ? 'PASS' : 'FAIL', r.data);

    // Signup
    r = await makeRequest('POST', '/api/auth/signup', { name: 'Test User', email: 'test@mcycle.com', password: 'test123' });
    console.log('2. Signup:', r.status === 201 ? 'PASS' : 'FAIL', r.status, r.data.user?.name || r.data.error);
    const token = r.data.token;

    // Login
    r = await makeRequest('POST', '/api/auth/login', { email: 'test@mcycle.com', password: 'test123' });
    console.log('3. Login:', r.status === 200 ? 'PASS' : 'FAIL', r.status);

    // Add cycle (with auth header)
    const cycleReq = http.request({
        hostname: 'localhost', port: 5000, path: '/api/cycles', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }
    }, (res) => {
        let chunks = '';
        res.on('data', c => chunks += c);
        res.on('end', () => {
            const data = JSON.parse(chunks);
            console.log('4. Add cycle:', res.statusCode === 201 ? 'PASS' : 'FAIL', res.statusCode, data.cycle?.start_date || data.error);

            // Add metrics
            const metricsData = JSON.stringify({ recorded_date: '2026-02-16', weight_kg: 65, height_cm: 165, waist_cm: 72, hip_cm: 98 });
            const metricsReq = http.request({
                hostname: 'localhost', port: 5000, path: '/api/metrics', method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token, 'Content-Length': Buffer.byteLength(metricsData) }
            }, (res2) => {
                let c2 = '';
                res2.on('data', c => c2 += c);
                res2.on('end', () => {
                    const d2 = JSON.parse(c2);
                    console.log('5. Add metrics:', res2.statusCode === 201 ? 'PASS' : 'FAIL', res2.statusCode, 'BMI:', d2.metric?.bmi, 'WHR:', d2.metric?.waist_hip_ratio);
                    console.log('\n=== All tests complete ===');
                });
            });
            metricsReq.write(metricsData);
            metricsReq.end();
        });
    });
    const cycleData = JSON.stringify({ start_date: '2026-01-15', end_date: '2026-01-20', notes: 'Test cycle' });
    cycleReq.setHeader('Content-Length', Buffer.byteLength(cycleData));
    cycleReq.write(cycleData);
    cycleReq.end();
}

test().catch(console.error);
