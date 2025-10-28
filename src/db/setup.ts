import { db } from '@/common/config/database';

export async function setupDatabase() {
    try {

        await db.raw('SELECT 1');
        console.log('✅ Database connection successful!');

        // Run migrations
        console.log('🔄 Running migrations...');
        await db.migrate.latest();
        console.log('✅ Migrations completed successfully!');

        // Run seeds
        console.log('🔄 Running seeds...');
        await db.seed.run();
        console.log('✅ Seeds completed successfully!');

        console.log('🎉 Database setup completed!');
    } catch (error) {
        console.error('❌ Database setup failed:', error);
        throw error;
    } finally {
        await db.destroy();
    }
}

// Run setup if this file is executed directly
if (require.main === module) {
    setupDatabase()
        .then(() => {
            console.log('Setup completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Setup failed:', error);
            process.exit(1);
        });
}
