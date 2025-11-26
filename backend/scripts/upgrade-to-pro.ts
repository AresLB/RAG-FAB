/**
 * Upgrade User to PRO Plan
 *
 * Usage: npm run upgrade-pro <email>
 * Example: npm run upgrade-pro user@example.com
 */

import * as mongoose from 'mongoose';
import { User } from '../models/User.model';
import { SubscriptionPlan } from '../../shared/types/user.types';
import { env } from '../config/env';

async function upgradeUserToPro(email: string) {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log(`\nFound user: ${user.email}`);
    console.log(`Current plan: ${user.subscription.plan}`);
    console.log(`Questions used: ${user.subscription.questionsUsed}/${user.subscription.questionsLimit}`);
    console.log(`Documents used: ${user.subscription.documentsUsed}/${user.subscription.documentsLimit}`);

    // Upgrade to PRO
    user.subscription.plan = SubscriptionPlan.PRO;
    user.subscription.status = 'active';
    user.subscription.questionsUsed = 0; // Reset usage
    user.subscription.documentsUsed = 0; // Reset usage
    user.subscription.questionsLimit = 999999; // Effectively unlimited
    user.subscription.documentsLimit = 999999; // Effectively unlimited
    user.subscription.startDate = new Date();
    user.subscription.endDate = new Date('2099-12-31'); // Far future date

    await user.save();

    console.log('\n✅ Successfully upgraded to PRO plan!');
    console.log(`New plan: ${user.subscription.plan}`);
    console.log(`Questions limit: Unlimited`);
    console.log(`Documents limit: Unlimited`);
    console.log(`Status: ${user.subscription.status}`);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide an email address');
  console.log('Usage: npx ts-node scripts/upgrade-to-pro.ts <email>');
  process.exit(1);
}

upgradeUserToPro(email);
