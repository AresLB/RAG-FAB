/**
 * Quick Upgrade to PRO - Simple JavaScript version
 */

const mongoose = require('mongoose');

// MongoDB URI from env
const MONGODB_URI = process.env.MONGODB_URI;
const email = process.argv[2];

if (!email) {
  console.error('Usage: node scripts/upgrade-pro.js <email>');
  process.exit(1);
}

if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in environment');
  process.exit(1);
}

async function upgrade() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');

    const result = await mongoose.connection.db.collection('users').updateOne(
      { email: email.toLowerCase() },
      {
        $set: {
          'subscription.plan': 'pro',
          'subscription.status': 'active',
          'subscription.questionsUsed': 0,
          'subscription.questionsLimit': 999999,
          'subscription.documentsUsed': 0,
          'subscription.documentsLimit': 999999,
          'subscription.startDate': new Date(),
          'subscription.endDate': new Date('2099-12-31')
        }
      }
    );

    if (result.matchedCount === 0) {
      console.error(`User not found: ${email}`);
      process.exit(1);
    }

    console.log(`\n✅ Successfully upgraded ${email} to PRO plan!`);
    console.log('- Questions: Unlimited');
    console.log('- Documents: Unlimited');
    console.log('- Status: Active');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nDone!');
  }
}

upgrade();
