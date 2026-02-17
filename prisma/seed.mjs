import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10)
    return bcrypt.hash(password, salt)
}

async function main() {
    // 1. Create Super Admin
    const password = await hashPassword('admin123')
    const admin = await prisma.admin.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            name: 'Super Admin',
            password: password,
            role: 'SUPER_ADMIN',
        },
    })
    console.log({ admin })

    // 2. Create Dummy Users
    const user1 = await prisma.user.upsert({
        where: { email: 'student1@example.com' },
        update: {},
        create: {
            email: 'student1@example.com',
            name: 'Alice Student',
            password: await hashPassword('student123'),
            referralCode: 'ALICE1',
            points: 150,
        }
    })

    const user2 = await prisma.user.upsert({
        where: { email: 'student2@example.com' },
        update: {},
        create: {
            email: 'student2@example.com',
            name: 'Bob Learner',
            password: await hashPassword('student123'),
            referralCode: 'BOB1',
            referredByCode: 'ALICE1',
            points: 50,
        }
    })
    console.log({ user1, user2 })

    // 3. Create Tasks
    const task1 = await prisma.task.create({
        data: {
            title: 'Complete React Course',
            description: 'Finish the intro to React course.',
            points: 100,
            requirements: ['Watch all videos', 'Submit final project'],
        }
    })

    const task2 = await prisma.task.create({
        data: {
            title: 'Invite 3 Friends',
            description: 'Refer 3 active students.',
            points: 50,
            requirements: ['Share referral link'],
        }
    })
    console.log({ task1, task2 })

    // 4. Create Pending Submission
    await prisma.taskSubmission.create({
        data: {
            userId: user2.id,
            taskId: task1.id,
            status: 'PENDING',
            proofUrl: 'https://example.com/screenshot.png',
        }
    })

    // 5. Create Pending Redeem Request
    await prisma.redeemRequest.create({
        data: {
            userId: user1.id,
            amount: 100,
            status: 'PENDING',
        }
    })

    console.log("Seeding completed!")
}
main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
