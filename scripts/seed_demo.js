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
    const fullName = 'Nguyễn Công Nghệ (Senior Fullstack)'

    // 1. Create/Update User
    let user = await User.findOne({ email })
    if (user) {
      console.log('Cleaning existing data for:', email)
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

    // 2. Create Rich Profile
    const profile = await Profile.create({
      userId: user._id,
      personalInfo: {
        fullName,
        role: 'Senior Fullstack Team Lead',
        dob: '1992-05-20',
        phone: '0988-777-666',
        email: email,
        address: 'Quận 1, TP. Hồ Chí Minh',
        summary: 'Hơn 8 năm kinh nghiệm trong việc xây dựng các hệ thống phân tán quy mô lớn. Chuyên gia về Node.js, React và kiến trúc Microservices. Đã từng dẫn dắt đội ngũ 15+ developer triển khai các dự án Fintech và E-commerce thành công.',
        github: 'https://github.com/congnghe_dev',
        linkedin: 'https://linkedin.com/in/congnghe_fullstack',
        portfolio: 'https://congnghe.dev',
        avatarUrl: 'https://i.pravatar.cc/300?u=student_demo@gmail.com'
      },
      skills: ['JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'NestJS', 'Docker', 'Kubernetes', 'AWS', 'PostgreSQL', 'Redis', 'GraphQL', 'CI/CD'],
      experiences: [
        {
          id: 'exp1',
          title: 'Senior Fullstack Team Lead',
          company: 'FPT Software',
          date: 'Tháng 6/2021 - Hiện tại',
          desc: 'Dẫn dắt team phát triển hệ thống Core Banking cho đối tác Nhật Bản. Tối ưu hóa hiệu năng API giúp giảm 40% latency. Triển khai kiến trúc Microservices trên AWS EKS.',
        },
        {
          id: 'exp2',
          title: 'Senior Backend Developer',
          company: 'VNG Corporation',
          date: 'Tháng 1/2018 - Tháng 5/2021',
          desc: 'Phát triển các dịch vụ thanh toán cho ZaloPay. Xử lý hàng triệu transaction mỗi ngày. Đảm bảo tính bảo mật và toàn vẹn dữ liệu.',
        },
        {
          id: 'exp3',
          title: 'Fullstack Developer',
          company: 'StartUp Tech',
          date: 'Tháng 9/2015 - Tháng 12/2017',
          desc: 'Xây dựng MVP cho nền tảng thương mại điện tử từ con số 0. Sử dụng React và Node.js.',
        }
      ],
      educations: [
        {
          id: 'edu1',
          title: 'Thạc sĩ Khoa học Máy tính',
          school: 'Đại học Bách Khoa TP.HCM',
          date: '2016 - 2018',
          desc: 'Nghiên cứu về Machine Learning và Distributed Systems.',
        },
        {
          id: 'edu2',
          title: 'Cử nhân CNTT',
          school: 'Đại học FPT',
          date: '2011 - 2015',
          desc: 'GPA 3.8/4.0. Giải nhất lập trình sinh viên cấp trường.',
        }
      ],
      projects: [
        {
          id: 'proj1',
          name: 'Social Network for Developers',
          date: '2023',
          role: 'Architect & Lead',
          technologies: 'Next.js 14, NestJS, Prisma, PostgreSQL',
          desc: 'Nền tảng kết nối cộng đồng dev với hơn 50k người dùng active.',
          link: 'https://devsocial.example.com'
        },
        {
          id: 'proj2',
          name: 'AI-Powered Job Matching',
          date: '2022',
          role: 'Fullstack Dev',
          technologies: 'React, Python, Fast API, OpenAI SDK',
          desc: 'Hệ thống gợi ý việc làm dựa trên kỹ năng của ứng viên sử dụng AI.',
          link: 'https://job-ai.example.com'
        }
      ],
      certifications: [
        {
          id: 'cert1',
          name: 'AWS Certified Solutions Architect – Professional',
          organization: 'Amazon Web Services',
          date: '2023',
        },
        {
          id: 'cert2',
          name: 'Google Professional Cloud Developer',
          organization: 'Google Cloud',
          date: '2022',
        }
      ],
      languages: [
        { id: 'lang1', name: 'Tiếng Anh', level: 'IELTS 7.5' },
        { id: 'lang2', name: 'Tiếng Nhật', level: 'N3' }
      ],
      hobbies: ['Leo núi', 'Đọc sách kỹ thuật', 'Cybersecurity Labs']
    })
    console.log('Updated Rich Profile for:', fullName)

    // 3. Create High-Quality CV
    const cv = await Cv.create({
      userId: user._id,
      name: 'CV Fullstack Cao Cấp - Nguyễn Công Nghệ',
      isDefault: true,
      cvData: {
        template: 'modern',
        sections: {
          personal: profile.personalInfo,
          summary: profile.personalInfo.summary,
          experience: profile.experiences,
          education: profile.educations,
          skills: profile.skills,
          projects: profile.projects,
          certifications: profile.certifications,
          languages: profile.languages
        },
      },
    })
    console.log('Updated CV:', cv.name)

    // 4. Export to JSON
    const exportData = {
      credentials: { email, password },
      user: { id: user._id, fullName, email, role: user.role },
      profile,
      cv,
    }

    const seedsDir = path.join(__dirname, '..', 'seeds')
    if (!fs.existsSync(seedsDir)) fs.mkdirSync(seedsDir)
    fs.writeFileSync(path.join(seedsDir, 'demo_account.json'), JSON.stringify(exportData, null, 2))
    
    console.log('Seed data updated successfully!')
    await mongoose.disconnect()
    process.exit(0)
  } catch (err) {
    console.error('Seed error:', err)
    process.exit(1)
  }
}

seed()
