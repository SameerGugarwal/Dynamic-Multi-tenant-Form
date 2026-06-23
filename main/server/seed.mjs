import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

// Import target model blueprints
import Permission from './src/database/models/Permission.model.mjs';
import Role from './src/database/models/Role.model.mjs';
import Organization from './src/database/models/Organization.model.mjs';
import Center from './src/database/models/Center.model.mjs';
import User from './src/database/models/User.model.mjs';
import Form from './src/database/models/Form.model.mjs';
import Question from './src/database/models/Question.model.mjs';

// Load environment config
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

const systemPermissions = [
  // Forms Management Module Permissions
  { name: 'CREATE_FORM', module: 'Forms', description: 'Allows building master templates or tenant forms.' },
  { name: 'VIEW_FORM', module: 'Forms', description: 'Allows reading form schemas.' },
  { name: 'UPDATE_FORM', module: 'Forms', description: 'Allows modifying existing unsubmitted draft templates.' },
  { name: 'DELETE_FORM', module: 'Forms', description: 'Allows purging forms from registry pools.' },
  { name: 'CLONE_FORM', module: 'Forms', description: 'Allows duplicating master forms to local layouts.' },

  // Submissions Module Permissions
  { name: 'CREATE_SUBMISSION', module: 'Submissions', description: 'Allows entry creators to save drafts or submit finalized answers.' },
  { name: 'VIEW_SUBMISSION', module: 'Submissions', description: 'Allows looking up completed submission metric items.' },
  
  // Administrative Control Permissions
  { name: 'MANAGE_USERS', module: 'Users', description: 'Allows managing user accounts within a tenant scope.' },
  { name: 'MANAGE_ORGANIZATIONS', module: 'Organizations', description: 'Global authority to manage business tenants.' },
  { name: 'VIEW_REPORTS', module: 'Reports', description: 'Allows querying and exporting data calculation spreads.' }
];

const seedEcosystem = async () => {
  try {
    if (!MONGO_URI) {
      console.error('❌ Error: MONGODB_URI is missing from your environment setup.');
      process.exit(1);
    }

    console.log('🚀 Connecting to database to initiate master seeding sequence...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Database connected successfully.');

    // 1. Flush Existing Collections
    console.log('🧹 Clearing out old platform registry collections...');
    await Promise.all([
      Permission.deleteMany({}),
      Role.deleteMany({}),
      Organization.deleteMany({}),
      Center.deleteMany({}),
      User.deleteMany({}),
      Form.deleteMany({}),
      Question.deleteMany({})
    ]);
    console.log('✅ Database cleaned.');

    // 2. Seed Permissions
    console.log('📦 Seeding fine-grained system permission matrix tokens...');
    const createdPermissions = await Permission.insertMany(systemPermissions);
    console.log(`✅ Seeded ${createdPermissions.length} core platform permissions.`);

    const permMap = createdPermissions.reduce((acc, p) => {
      acc[p.name] = p._id;
      return acc;
    }, {});

    // 3. Seed Roles
    console.log('⚙️ Compiling roles definitions...');
    const rolesConfiguration = [
      {
        name: 'Super Admin',
        description: 'Global corporate overseer. Has absolute visibility across all scopes.',
        permissions: createdPermissions.map(p => p._id)
      },
      {
        name: 'Organization Admin',
        description: 'Tenant scope administrator. Manages local forms, users, centers, and reports.',
        permissions: [
          permMap['CREATE_FORM'], permMap['VIEW_FORM'], permMap['UPDATE_FORM'], 
          permMap['DELETE_FORM'], permMap['CLONE_FORM'], permMap['VIEW_SUBMISSION'], 
          permMap['MANAGE_USERS'], permMap['VIEW_REPORTS']
        ]
      },
      {
        name: 'Center Admin',
        description: 'Localized regional manager. Reviews local form answers and field outputs.',
        permissions: [
          permMap['VIEW_FORM'], permMap['VIEW_SUBMISSION'], permMap['VIEW_REPORTS']
        ]
      },
      {
        name: 'User',
        description: 'Standard operational desk agent. Fills out forms and manages their own drafts.',
        permissions: [
          permMap['VIEW_FORM'], permMap['CREATE_SUBMISSION']
        ]
      }
    ];

    const createdRoles = await Role.insertMany(rolesConfiguration);
    console.log(`✅ Seeded ${createdRoles.length} standard system roles.`);

    const superAdminRole = createdRoles.find(r => r.name === 'Super Admin');
    const orgAdminRole = createdRoles.find(r => r.name === 'Organization Admin');

    // 4. Seed Default Tenants
    console.log('🏢 Initializing default business tenant infrastructure...');
    const defaultOrg = await Organization.create({
      name: 'Acme Global Enterprise Inc.',
      slug: 'acme-global',
      status: 'ACTIVE',
      contactEmail: 'info@acme.com'
    });

    const defaultCenter = await Center.create({
      name: 'North Regional Operations Hub',
      organizationId: defaultOrg._id,
      code: 'NROH-01',
      contactEmail: 'center-north@acme.com'
    });
    console.log(`✅ Seeded Org: [${defaultOrg.name}] with Center: [${defaultCenter.name}]`);

    // 5. Seed Users
    console.log('👤 Registering platform anchor user identities...');
    const sharedSalt = await bcrypt.genSalt(10);
    const commonPasswordHash = await bcrypt.hash('Admin@Secure2026', sharedSalt);

    const superAdminUser = await User.create({
      name: 'Master Super Controller',
      email: 'superadmin@platform.com',
      passwordHash: commonPasswordHash,
      role: superAdminRole._id,
      organizationId: null
    });

    const orgAdminUser = await User.create({
      name: 'Acme Operational Director',
      email: 'admin@acme.com',
      passwordHash: commonPasswordHash,
      role: orgAdminRole._id,
      organizationId: defaultOrg._id,
      centerId: defaultCenter._id
    });
    console.log(`✅ Seeded Users:\n   - SuperAdmin: ${superAdminUser.email}\n   - OrgAdmin: ${orgAdminUser.email}\n   - Password for both: Admin@Secure2026`);

    // 6. Seed Form Template
    console.log('📝 Engineering master structural template configuration containers...');
    const masterForm = await Form.create({
      title: 'Standard Onboarding Assessment Pipeline',
      description: 'The definitive template profile utilized to capture operational onboarding telemetry.',
      isMaster: true,
      organizationId: null,
      status: 'PUBLISHED',
      createdBy: superAdminUser._id,
      version: 1
    });

    // 7. Seed Questions (FIXED: Changed SELECT to DROPDOWN to match enum restrictions)
    console.log('❓ Injecting chronological field elements...');
    const questionDeck = [
      {
        formId: masterForm._id,
        label: 'Provide your absolute corporate legal identification name.',
        fieldType: 'TEXT',
        order: 1,
        isRequired: true,
        placeholder: 'Johnathan Doe'
      },
      {
        formId: masterForm._id,
        label: 'Please specify your operational sector group classification.',
        fieldType: 'DROPDOWN', // 👈 FIXED: Swapped out 'SELECT' for 'DROPDOWN'
        order: 2,
        isRequired: true,
        options: [
          { label: 'Logistics Engine Core', value: 'Logistics Engine Core', text: 'Logistics Engine Core' },
          { label: 'Financial Risk Verification Unit', value: 'Financial Risk Verification Unit', text: 'Financial Risk Verification Unit' },
          { label: 'Client Success Portal', value: 'Client Success Portal', text: 'Client Success Portal' }
        ]
      },
      {
        formId: masterForm._id,
        label: 'Provide primary structural security clearance assessment rating score.',
        fieldType: 'NUMBER',
        order: 3,
        isRequired: false,
        placeholder: 'Enter values ranging 1 - 100'
      }
    ];

    await Question.insertMany(questionDeck);
    console.log('✅ Form and questions loaded.');

    console.log('\n🎉 ====================================================== 🎉');
    console.log('🔥 SERVER DATA SEEDING EXECUTED WITH 100% SUCCESS INTEGRITY 🔥');
    console.log('🎉 ====================================================== 🎉\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ CRITICAL EXCEPTION INTERCEPTED DURING SEED CYCLE:');
    console.error(error);
    process.exit(1);
  }
};

seedEcosystem();