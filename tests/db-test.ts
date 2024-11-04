import { prisma } from '../lib/prisma'
// testing database connection direct to supabase
async function testDatabaseConnection() {
  try {
    // Try to create a test user
    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        user_id: 'test-user-123',
      },
    })
    
    console.log('✅ Successfully created test user:', testUser)
    
    // Try to read the user back
    const foundUser = await prisma.user.findUnique({
      where: {
        user_id: 'test-user-123',
      },
    })
    
    console.log('✅ Successfully retrieved test user:', foundUser)
    
    // Clean up by deleting the test user
    await prisma.user.delete({
      where: {
        user_id: 'test-user-123',
      },
    })
    
    console.log('✅ Successfully deleted test user')
    console.log('🎉 Database connection test completed successfully!')
    
  } catch (error) {
    console.error('❌ Database test failed:', error)
  } finally {
    // Disconnect from the database
    await prisma.$disconnect()
  }
}

// Run the test
testDatabaseConnection() 