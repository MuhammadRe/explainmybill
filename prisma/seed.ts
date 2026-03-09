// ─────────────────────────────────────────────────────
// Database Seed Script
// Creates a demo user account for local testing
// Run with: npm run db:seed
// ─────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('Demo1234', 12);

  const user = await prisma.user.upsert({
    where: { email: 'demo@explainmybill.com' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@explainmybill.com',
      password: hashedPassword,
      plan: 'FREE',
    },
  });

  console.log(`Created demo user: ${user.email}`);
  console.log('Password: Demo1234');

  // Create a sample completed document with analysis
  const doc = await prisma.document.upsert({
    where: { id: 'demo-doc-1' },
    update: {},
    create: {
      id: 'demo-doc-1',
      userId: user.id,
      name: 'Sample Energy Bill.pdf',
      type: 'ENERGY_BILL',
      mimeType: 'application/pdf',
      fileSize: 102400,
      status: 'COMPLETED',
      rawText: 'Sample energy bill text...',
    },
  });

  await prisma.analysis.upsert({
    where: { documentId: doc.id },
    update: {},
    create: {
      documentId: doc.id,
      simpleExplanation:
        'This is your monthly electricity bill from PowerGrid Ltd. You used 234 kWh this month and your total bill is €117.78. This is higher than average due to your current tariff rate.',
      documentType: 'Energy Bill',
      riskScore: 7,
      hiddenFees: [
        {
          title: 'Optional Green Energy Add-on',
          description: 'You are subscribed to a Green Energy premium tariff add-on that costs extra.',
          amount: '€7.00/month',
          severity: 'medium',
        },
      ],
      risks: [
        {
          title: 'Early Termination Fee',
          description: 'If you cancel your contract before the end date, you will be charged €150.',
          severity: 'high',
        },
        {
          title: 'Auto-Renewal Clause',
          description: 'Your contract will automatically renew for 12 months unless cancelled 30 days before end date.',
          severity: 'medium',
        },
      ],
      importantDates: [
        {
          label: 'Contract End Date',
          date: 'April 15, 2025',
          description: 'Your current contract ends in approximately 2 months. Start comparing rates now.',
        },
        {
          label: 'Payment Due Date',
          date: 'March 15, 2025',
          description: 'Late payments incur a €10 fee after 7 days.',
        },
      ],
      savingsSuggestions: [
        {
          title: 'Cancel Optional Green Energy Add-on',
          description: 'The Green Energy tariff add-on can be cancelled online without penalty.',
          potentialSaving: '€7/month',
        },
        {
          title: 'Switch Provider at Contract End',
          description: 'Multiple competitors offer rates below €0.30/kWh. Switch when your contract ends in April.',
          potentialSaving: 'Up to €25/month',
        },
      ],
      comparisonHints: [
        {
          title: 'Electricity Rate Comparison',
          description: 'Your current rate is significantly above the EU average for residential electricity.',
          benchmark: '€0.34/kWh (EU average)',
          userValue: '€0.42/kWh',
        },
      ],
      keyFigures: [
        { label: 'Total Due', value: '117.78', unit: 'EUR' },
        { label: 'Usage', value: '234', unit: 'kWh' },
        { label: 'Rate', value: '0.42', unit: 'EUR/kWh' },
        { label: 'Standing Charge', value: '12.50', unit: 'EUR' },
      ],
    },
  });

  console.log('Created sample document with analysis');
  console.log('\nDone! You can now log in with:');
  console.log('  Email: demo@explainmybill.com');
  console.log('  Password: Demo1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
