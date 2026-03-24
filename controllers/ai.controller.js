const https = require('https')

/**
 * Gọi Groq API qua HTTPS (Chuẩn OpenAI)
 * → Siêu nhanh, quota tốt hơn Gemini.
 */
function callGroq(prompt, model = 'llama-3.3-70b-versatile') {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return reject(new Error('GROQ_API_KEY chưa được cấu hình.'))
    }

    const body = JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: 'Bạn là trợ lý viết CV chuyên nghiệp. Chỉ trả về nội dung đã tối ưu, không giải thích thêm.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    })

    const options = {
      hostname: 'api.groq.com',
      path: '/openai/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(body)
      }
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          if (res.statusCode >= 400) return reject(new Error(json.error?.message || `HTTP ${res.statusCode}`))
          resolve(json.choices?.[0]?.message?.content?.trim() || '')
        } catch (e) { reject(new Error('PARSE_ERROR: ' + e.message)) }
      })
    })

    req.on('error', (e) => reject(e))
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('TIMEOUT')) })
    req.write(body)
    req.end()
  })
}

/**
 * Stream phản hồi từ Groq trực tiếp về client (SSE)
 */
function streamGroq(prompt, res, model = 'llama-3.3-70b-versatile') {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return res.status(500).write('data: [ERROR: NO_API_KEY]\n\n')

  const body = JSON.stringify({
    model: model,
    messages: [
      { role: 'system', content: 'Bạn là trợ lý viết CV chuyên nghiệp. Chỉ trả về nội dung đã tối ưu, không giải thích thêm.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    stream: true
  })

  // SSE Headers
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  const options = {
    hostname: 'api.groq.com',
    path: '/openai/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }
  }

  const req = https.request(options, (groqRes) => {
    groqRes.on('data', (chunk) => {
      // Chunk từ Groq có dạng "data: {...}\n\n"
      // Chúng ta sẽ đẩy thẳng chunk này về client
      res.write(chunk)
    })
    groqRes.on('end', () => {
       res.write('data: [DONE]\n\n')
       res.end()
    })
  })

  req.on('error', (e) => {
    res.write(`data: [ERROR: ${e.message}]\n\n`)
    res.end()
  })
  req.write(body)
  req.end()
}

// ─── Test endpoint ───────────────────────────────────────────────────────────
async function testAI(req, res) {
  try {
    const key = process.env.GROQ_API_KEY
    const maskedKey = key ? key.slice(0, 8) + '...' + key.slice(-4) : 'NOT SET'
    
    // Test đơn giản
    const result = await callGroq('Xin chào, hãy nói "Hệ thống Groq đã sẵn sàng" bằng tiếng Việt.', 'llama-3.1-8b-instant')
    res.json({ ok: true, result, key_status: maskedKey })
  } catch (err) {
    console.error('[GROQ TEST] FAIL:', err.message)
    res.status(500).json({ ok: false, error: err.message })
  }
}

// ─── Text optimizer ───────────────────────────────────────────────────────────
async function optimizeText(req, res) {
  const { text, type } = req.body
  const isStream = req.query.stream === 'true'

  if (!text || text.trim().length < 3) {
    return res.status(400).json({ error: 'Nội dung quá ngắn' })
  }

  const prompts = {
    summary: `Viết lại phần "Giới thiệu bản thân" dưới đây cho chuyên nghiệp, súc tích, ấn tượng. Gốc:\n${text}`,
    experience: `Viết lại "Kinh nghiệm làm việc" thành các bullet points bắt đầu bằng action verb mạnh. Gốc:\n${text}`,
    skills: `Lọc và nhóm các kỹ năng chuyên môn từ nội dung này. Gốc:\n${text}`,
    grammar: `Sửa lỗi chính tả và diễn đạt lại cho chuẩn CV chuyên nghiệp. Gốc:\n${text}`,
    translate: `Dịch sang tiếng Anh chuyên ngành cho CV quốc tế. Gốc:\n${text}`,
    concise: `Viết lại thật ngắn gọn nhưng vẫn giữ đủ ý chính. Gốc:\n${text}`,
    professional: `Dùng văn phong doanh nghiệp cao cấp để viết lại nội dung này. Gốc:\n${text}`,
  }

  const prompt = prompts[type] || `Dựa vào yêu cầu "${type}", hãy tối ưu nội dung này cho CV:\n${text}`

  if (isStream) {
    return streamGroq(prompt, res)
  }

  try {
    const optimized = await callGroq(prompt)
    res.json({ optimized })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ─── ATS Job Matcher ──────────────────────────────────────────────────────────
async function analyzeJobMatch(req, res) {
  const { jobDescription, cvContent } = req.body
  if (!jobDescription || !cvContent) {
    return res.status(400).json({ error: 'Thiếu thông tin phân tích JD/CV' })
  }

  const prompt = `Bạn là hệ thống ATS thông minh. Phân tích JD và CV. 
Trả về JSON duy nhất (không markdown):
{"score": 85, "missingKeywords": ["A", "B"], "advice": ["Lời khuyên 1", "Lời khuyên 2"]}

JD:\n${jobDescription}\n\nCV:\n${cvContent}`

  try {
    const raw = await callGroq(prompt)
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    res.json(JSON.parse(cleaned))
  } catch (err) {
    console.error('[GROQ] analyzeJobMatch fail:', err.message)
    res.status(500).json({ error: 'Lỗi phân tích JD (Groq): ' + err.message })
  }
}

async function tailorCV(req, res) {
  const { jobDescription, cvContent } = req.body
  if (!jobDescription || !cvContent) {
    return res.status(400).json({ error: 'Thiếu JD hoặc nội dung CV' })
  }

  const prompt = `Bạn là chuyên gia tối ưu hóa CV cho ATS. 
Dựa vào JD và CV hiện tại, hãy thực hiện:
1. Chấm điểm Match Score (0-100).
2. Tìm ra 5 từ khóa quan trọng nhất trong JD mà CV đang thiếu.
3. Viết lại phần "Giới thiệu bản thân" (Summary) sao cho lồng ghép các từ khóa đó một cách tự nhiên và chuyên nghiệp nhất.

Trả về JSON duy nhất (không markdown):
{
  "score": 75,
  "missingKeywords": ["React Context", "Unit Testing"],
  "tailoredSummary": "Đoạn tóm tắt mới..."
}

JD:\n${jobDescription}\n\nCV:\n${cvContent}`

  try {
    const raw = await callGroq(prompt)
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    res.json(JSON.parse(cleaned))
  } catch (err) {
    console.error('[AI] tailorCV fail:', err.message)
    res.status(500).json({ error: 'Lỗi tối ưu CV: ' + err.message })
  }
}

async function interviewPrep(req, res) {
  const { jobDescription, cvContent } = req.body
  if (!jobDescription || !cvContent) {
    return res.status(400).json({ error: 'Thiếu JD hoặc nội dung CV' })
  }

  const prompt = `Bạn là chuyên gia phỏng vấn cấp cao. 
Dựa vào JD và CV của ứng viên, hãy đưa ra 5 câu hỏi phỏng vấn hóc búa nhất (nhấn mạnh vào kỹ năng chuyên môn và kinh nghiệm thực tế).
Với mỗi câu hỏi, hãy cung cấp:
1. "question": Câu hỏi.
2. "why": Tại sao câu hỏi này quan trọng/khó.
3. "keyPoints": Danh sách các ý chính cần có trong câu trả lời.
4. "sampleAnswer": Một ví dụ câu trả lời mẫu xuất sắc.

Trả về JSON duy nhất (không markdown):
{
  "questions": [
    {
      "question": "...",
      "why": "...",
      "keyPoints": ["...", "..."],
      "sampleAnswer": "..."
    }
  ]
}

JD:\n${jobDescription}\n\nCV:\n${cvContent}`

  try {
    const raw = await callGroq(prompt)
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    res.json(JSON.parse(cleaned))
  } catch (err) {
    console.error('[AI] interviewPrep fail:', err.message)
    res.status(500).json({ error: 'Lỗi chuẩn bị phỏng vấn: ' + err.message })
  }
}

module.exports = { optimizeText, analyzeJobMatch, testAI, tailorCV, interviewPrep }
