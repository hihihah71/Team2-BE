require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const fs = require('fs')
const path = require('path')

const User = require('../models/User')
const Profile = require('../models/Profile')
const Cv = require('../models/Cv')

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/team2_db'

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    const email = 'student_demo@gmail.com'
    const password = 'Password123456'
    const fullName = 'Demo Student'

    // 1. Create User
    let user = await User.findOne({ email })
    if (user) {
      console.log('User already exists, deleting for fresh seed...')
      await User.deleteOne({ _id: user._id })
      await Profile.deleteOne({ userId: user._id })
      await Cv.deleteMany({ userId: user._id })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    user = await User.create({
      fullName,
      email,
      passwordHash,
      role: 'student',
    })
    console.log('Created User:', user.email)

    // 2. Create Profile
    const profile = await Profile.create({
      userId: user._id,
      personalInfo: {
        fullName,
        role: 'Fullstack Developer',
        dob: '2000-01-01',
        phone: '0123456789',
        email: email,
        address: 'Hanoi, Vietnam',
        summary: 'I am a passionate developer with experience in React and Node.js.',
      },
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'MongoDB'],
      experiences: [
        {
          title: 'Frontend Intern',
          company: 'Tech Solutions',
          date: 'Jan 2023 - June 2023',
          desc: 'Worked on building responsive UI components using React.',
        },
      ],
      educations: [
        {
          title: 'Bachelor of Computer Science',
          school: 'FPT University',
          date: '2018 - 2022',
          desc: 'Specialized in Software Engineering.',
        },
      ],
    })
    console.log('Created Profile for:', user.fullName)

    // 3. Create CV
    const cv = await Cv.create({
      userId: user._id,
      name: 'Default Demo CV',
      isDefault: true,
      cvData: {
        template: 'modern',
        sections: {
          personal: profile.personalInfo,
          summary: profile.personalInfo.summary,
          experience: profile.experiences,
          education: profile.educations,
          skills: profile.skills,
        },
      },
    })
    console.log('Created CV:', cv.name)

    // 4. Export to JSON
    const exportData = {
      credentials: {
        email,
        password,
      },
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
      profile,
      cv,
    }

    const seedsDir = path.join(__dirname, '..', 'seeds')
    if (!fs.existsSync(seedsDir)) {
      fs.mkdirSync(seedsDir)
    }

    fs.writeFileSync(
      path.join(seedsDir, 'demo_account.json'),
      JSON.stringify(exportData, null, 2)
    )
    console.log('Data exported to seeds/demo_account.json')

    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
    process.exit(0)
  } catch (err) {
    console.error('Seed error:', err)
    process.exit(1)
  }
}

seed()
