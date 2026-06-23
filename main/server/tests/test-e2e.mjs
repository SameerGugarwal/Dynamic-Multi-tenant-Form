import fs from 'fs';

const API_BASE = 'http://localhost:3501/api/v1';

async function runTests() {
    console.log("=========================================");
    console.log("🚀 STARTING E2E API INTEGRATION TEST SUITE");
    console.log("=========================================\n");

    let superAdminToken = '';
    let centerId = '';
    let organizationId = '';
    let formId = '';

    const executeRequest = async (name, method, endpoint, body = null, token = null) => {
        try {
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const response = await fetch(`${API_BASE}${endpoint}`, {
                method,
                headers,
                body: body ? JSON.stringify(body) : null
            });

            const data = await response.json();
            
            if (response.ok && data.success !== false) {
                console.log(`✅ [SUCCESS] ${name}`);
                return data.data || data; // Return payload
            } else {
                console.log(`❌ [FAILED] ${name}`);
                console.log(`   Status: ${response.status}`);
                console.log(`   Response:`, data);
                return null;
            }
        } catch (error) {
            console.log(`❌ [ERROR] ${name}`);
            console.log(`   Message: ${error.message}`);
            return null;
        }
    };

    // --- 1. AUTHENTICATION & USERS ---
    console.log("--- 🔑 AUTHENTICATION FLOW ---");
    const uniqueEmail = `admin_${Date.now()}@test.com`;
    const registerRes = await executeRequest('Register Super Admin', 'POST', '/auth/register', {
        name: "Automated Super Admin",
        email: uniqueEmail,
        password: "SecurePassword123!",
        roleName: "Super Admin"
    });

    if (!registerRes) {
        console.log("\n🛑 CRITICAL FAILURE: Cannot proceed without Super Admin. Stopping tests.");
        return;
    }

    const loginRes = await executeRequest('Login Super Admin', 'POST', '/auth/login', {
        email: uniqueEmail,
        password: "SecurePassword123!"
    });
    
    if (loginRes && loginRes.accessToken) {
        superAdminToken = loginRes.accessToken;
    } else {
        console.log("\n🛑 CRITICAL FAILURE: Could not retrieve Access Token. Stopping tests.");
        return;
    }

    // --- 2. CENTERS ---
    console.log("\n--- 🏢 CENTERS FLOW ---");
    const centerRes = await executeRequest('Create Center', 'POST', '/centers', {
        name: `Test Center ${Date.now()}`,
        contactEmail: `center_${Date.now()}@test.com`,
        location: "Automated Test Zone"
    }, superAdminToken);

    if (centerRes) {
        centerId = centerRes._id;
        await executeRequest('Get All Centers', 'GET', '/centers', null, superAdminToken);
    }

    // --- 3. ORGANIZATIONS ---
    console.log("\n--- 💼 ORGANIZATIONS FLOW ---");
    if (centerId) {
        const orgRes = await executeRequest('Create Organization', 'POST', '/organizations', {
            name: `Test Org ${Date.now()}`,
            contactEmail: `org_${Date.now()}@test.com`,
            centers: [centerId]
        }, superAdminToken);

        if (orgRes) {
            organizationId = orgRes._id;
            await executeRequest('Get All Organizations', 'GET', '/organizations', null, superAdminToken);
        }
    }

    // --- 4. FORMS ---
    console.log("\n--- 📄 FORMS FLOW ---");
    const formRes = await executeRequest('Create Form', 'POST', '/forms', {
        title: `E2E Test Form ${Date.now()}`,
        description: "Automated form description"
    }, superAdminToken);

    if (formRes) {
        formId = formRes._id;
        await executeRequest('Get Forms Library', 'GET', '/forms/master', null, superAdminToken);
    }

    // --- 5. QUESTIONS ---
    console.log("\n--- ❓ QUESTIONS FLOW ---");
    if (formId) {
        const questionRes = await executeRequest('Add Question to Form', 'POST', '/questions', {
            formId: formId,
            label: "What is your automated test name?",
            fieldType: "TEXT",
            isRequired: true,
            order: 1
        }, superAdminToken);

        await executeRequest('Fetch Questions for Form', 'GET', `/questions/form/${formId}`, null, superAdminToken);
    }

    console.log("\n=========================================");
    console.log("🏁 E2E API INTEGRATION TEST SUITE FINISHED");
    console.log("=========================================");
}

runTests();
