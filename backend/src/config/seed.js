const bcrypt = require('bcryptjs');
const { pool } = require('./db');

const seedDatabase = async () => {
  console.log('🌱 Seeding database...\n');

  try {
    // Create Super Admin user
    const superAdminPassword = await bcrypt.hash('superadmin123', 12);
    await pool.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role, department, is_active, must_change_password)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (email) DO NOTHING
    `, ['superadmin@wellfluid.com', superAdminPassword, 'Super', 'Admin', 'Super_Admin', 'Management', true, true]);
    console.log('✅ Super Admin created (superadmin@wellfluid.com / superadmin123)');

    // Create Admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    await pool.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role, department, is_active, must_change_password)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (email) DO NOTHING
    `, ['admin@wellfluid.com', adminPassword, 'System', 'Administrator', 'Admin', 'IT', true, true]);
    console.log('✅ Admin user created (admin@wellfluid.com / admin123)');

    // Create all test users with different roles
    const testPassword = await bcrypt.hash('password123', 12);
    const testUsers = [
      // IT Support - can manage users, can't see business data
      ['itsupport@wellfluid.com', 'Isaac', 'Tech', 'IT_Support', 'IT'],
      
      // Managers (various departments)
      ['operations.manager@wellfluid.com', 'Mary', 'Operations', 'Operations_Manager', 'Operations'],
      ['maintenance.manager@wellfluid.com', 'Mike', 'Maintenance', 'Maintenance_Manager', 'Maintenance'],
      ['safety.manager@wellfluid.com', 'Sam', 'Safety', 'Safety_Manager', 'Safety'],
      ['logistics.manager@wellfluid.com', 'Larry', 'Logistics', 'Logistics_Manager', 'Logistics'],
      
      // Purchasing (Manager + Staff)
      ['purchasing.manager@wellfluid.com', 'Pete', 'Purchasing', 'Purchasing_Manager', 'Purchasing'],
      ['purchasing.staff@wellfluid.com', 'Paula', 'Stock', 'Purchasing_Staff', 'Purchasing'],

      // Accounts (Manager + Staff)
      ['accounts.manager@wellfluid.com', 'Angela', 'Accounts', 'Accounts_Manager', 'Finance'],
      ['accounts.staff@wellfluid.com', 'Aaron', 'Finance', 'Accounts_Staff', 'Finance'],
      
      // Field Engineers
      ['john@wellfluid.com', 'John', 'Engineer', 'Field_Engineer', 'Operations'],
      ['jane@wellfluid.com', 'Jane', 'Engineer', 'Field_Engineer', 'Operations'],
      ['james@wellfluid.com', 'James', 'Senior', 'Field_Engineer', 'Operations'],
      
      // Office Staff (regular staff)
      ['staff@wellfluid.com', 'Steve', 'Office', 'Staff', 'HR'],
      ['susan@wellfluid.com', 'Susan', 'Reception', 'Staff', 'HR'],
      ['sarah@wellfluid.com', 'Sarah', 'Secretary', 'Staff', 'Operations'],
    ];

    for (const [email, firstName, lastName, role, department] of testUsers) {
      await pool.query(`
        INSERT INTO users (email, password_hash, first_name, last_name, role, department, is_active, must_change_password)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (email) DO NOTHING
      `, [email, testPassword, firstName, lastName, role, department, true, true]);
    }
    console.log('✅ Test users created (password: password123)');

    // Seed some equipment
    const equipmentData = [
      ['High Pressure Pump Unit 1', 'HP-PUMP-001', 'PUMPING_UNIT', 'EQUIPMENT', 'Available', 'Warehouse A', 1250],
      ['High Pressure Pump Unit 2', 'HP-PUMP-002', 'PUMPING_UNIT', 'EQUIPMENT', 'In_Use', 'Field Site Alpha', 890],
      ['Coiled Tubing Unit 1', 'CT-001', 'WELL_INTERVENTION', 'EQUIPMENT', 'Available', 'Warehouse A', 2100],
      ['Nitrogen Pump Unit', 'N2-PUMP-001', 'PRESSURE_CONTROL', 'EQUIPMENT', 'Maintenance', 'Workshop', 3400],
      ['Wireline Unit 1', 'WL-001', 'WELL_INTERVENTION', 'EQUIPMENT', 'Available', 'Warehouse B', 560],
      ['Support Truck 1', 'TRUCK-001', 'VEHICLE', 'EQUIPMENT', 'Available', 'Motor Pool', 45000],
      ['Crane Unit 1', 'CRANE-001', 'OTHER_EQUIPMENT', 'EQUIPMENT', 'Available', 'Warehouse A', 890],
    ];

    for (const [name, serial, type, assetCategory, status, location, hours] of equipmentData) {
      await pool.query(`
        INSERT INTO equipment (name, serial_number, type, asset_category, status, location, current_hours, maintenance_interval_hours)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 500)
        ON CONFLICT (serial_number) DO NOTHING
      `, [name, serial, type, assetCategory, status, location, hours]);
    }
    console.log('✅ Equipment data seeded');

    // Seed inventory items
    const inventoryData = [
      ['Safety Helmet', 'PPE', 50, 'pieces', 20, 'Warehouse A'],
      ['Safety Goggles', 'PPE', 100, 'pieces', 30, 'Warehouse A'],
      ['Work Gloves', 'PPE', 200, 'pairs', 50, 'Warehouse A'],
      ['Steel Toe Boots', 'PPE', 30, 'pairs', 15, 'Warehouse A'],
      ['Coveralls', 'PPE', 45, 'pieces', 20, 'Warehouse A'],
      ['High Pressure Hose', 'Spare_Parts', 25, 'meters', 10, 'Warehouse B'],
      ['Pump Seals', 'Spare_Parts', 100, 'pieces', 30, 'Warehouse B'],
      ['Hydraulic Oil', 'Consumables', 500, 'liters', 100, 'Warehouse B'],
      ['Lubricant Grease', 'Consumables', 50, 'kg', 20, 'Warehouse B'],
      ['Printer Paper', 'Office_Supplies', 20, 'reams', 10, 'Office Store'],
    ];

    for (const [name, category, quantity, unit, reorderLevel, location] of inventoryData) {
      await pool.query(`
        INSERT INTO inventory (name, category, quantity, unit, reorder_level, location)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT DO NOTHING
      `, [name, category, quantity, unit, reorderLevel, location]);
    }
    console.log('✅ Inventory data seeded');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Login credentials:');
    console.log('─────────────────────────────────────────────────');
    console.log('  ROLE              EMAIL                          PASSWORD');
    console.log('─────────────────────────────────────────────────');
    console.log('  Super Admin       superadmin@wellfluid.com       superadmin123');
    console.log('  Admin             admin@wellfluid.com            admin123');
    console.log('  IT Support        itsupport@wellfluid.com        password123');
    console.log('  Operations Mgr    operations.manager@wellfluid.com  password123');
    console.log('  Maintenance Mgr   maintenance.manager@wellfluid.com password123');
    console.log('  Safety Officer    safety.manager@wellfluid.com   password123');
    console.log('  Logistics Mgr     logistics.manager@wellfluid.com   password123');
    console.log('  Purchasing Mgr    purchasing.manager@wellfluid.com  password123');
    console.log('  Purchasing Staff  purchasing.staff@wellfluid.com    password123');
    console.log('  Field Engineer    john@wellfluid.com             password123');
    console.log('  Office Staff      staff@wellfluid.com            password123');
    console.log('─────────────────────────────────────────────────');

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

seedDatabase();
