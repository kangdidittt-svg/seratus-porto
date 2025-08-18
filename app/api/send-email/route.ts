import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import jwt from 'jsonwebtoken'

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

// POST /api/send-email - Send email notification
export async function POST(request: NextRequest) {
  try {
    // Verify JWT token for admin access (optional for this endpoint)
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
        if (decoded.role !== 'admin') {
          return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
        }
      } catch (tokenError) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }
    }

    const { to, subject, fileLink } = await request.json()
    
    // Validate required fields
    if (!to) {
      return NextResponse.json(
        { error: 'Missing required field: to' },
        { status: 400 }
      )
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Use provided subject or default
    const emailSubject = subject || 'File dari SERATUS STUDIO'
    
    // Create friendly email template
    let emailMessage = `Halo,

Terima kasih sudah menggunakan layanan kami 🙌

Saya sudah menyiapkan file yang kamu butuhkan.`
    
    // Add file link if provided
    if (fileLink) {
      emailMessage += ` Kamu bisa mengaksesnya melalui link berikut:
${fileLink}`
    }
    
    emailMessage += `

Semoga bermanfaat ya. Jika ada kendala, jangan ragu untuk membalas email ini 😊

Salam hangat,
Tim SERATUS STUDIO`

    // Create HTML version of the email
    let emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${emailSubject}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #e0e0e0;">
          <h1 style="color: #333; margin: 0; font-size: 28px;">SERATUS STUDIO</h1>
          <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Digital Art & Design</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px 0;">
          <p style="color: #555; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
            Halo,
          </p>
          
          <p style="color: #555; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
            Terima kasih sudah menggunakan layanan kami 🙌
          </p>
          
          <p style="color: #555; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
            Saya sudah menyiapkan file yang kamu butuhkan.`
    
    if (fileLink) {
      emailHtml += ` Kamu bisa mengaksesnya melalui link berikut:
          </p>
          
          <!-- Download Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${fileLink}" 
               style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3); transition: all 0.3s ease;">
              📥 Akses File
            </a>
          </div>
          
          <p style="color: #555; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">`
    } else {
      emailHtml += `
          </p>
          
          <p style="color: #555; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">`
    }
    
    emailHtml += `
            Semoga bermanfaat ya. Jika ada kendala, jangan ragu untuk membalas email ini 😊
          </p>
          
          <p style="color: #555; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
            Salam hangat,<br>
            <strong>Tim SERATUS STUDIO</strong>
          </p>
        </div>
        
        <!-- Footer -->
        <div style="border-top: 2px solid #e0e0e0; padding: 20px 0; text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            © 2025 SERATUS STUDIO. All rights reserved.
          </p>
          <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">
            Jika Anda memiliki pertanyaan, silakan hubungi kami di support@seratus-studio.com
          </p>
        </div>
        
      </div>
    </body>
    </html>
    `

    // Email options
    const mailOptions = {
      from: {
        name: 'SERATUS STUDIO',
        address: process.env.EMAIL_USER || 'noreply@seratus-studio.com'
      },
      to: to,
      subject: emailSubject,
      text: emailMessage,
      html: emailHtml
    }

    // Send email using nodemailer
    const info = await transporter.sendMail(mailOptions)
    
    // Create email log for demonstration
    const fs = require('fs')
    const path = require('path')
    
    const emailLog = {
      timestamp: new Date().toISOString(),
      to: to,
      subject: emailSubject,
      content: {
        text: emailMessage,
        html: emailHtml
      },
      fileLink: fileLink || null,
      messageId: info.messageId,
      status: 'sent'
    }
    
    // Save email log to file for demonstration
    const logDir = path.join(process.cwd(), 'email-logs')
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true })
    }
    
    const logFile = path.join(logDir, `email-${Date.now()}.json`)
    fs.writeFileSync(logFile, JSON.stringify(emailLog, null, 2))
    
    console.log('📧 EMAIL SENT SUCCESSFULLY!')
    console.log('='.repeat(50))
    console.log('📬 To:', to)
    console.log('📋 Subject:', emailSubject)
    if (fileLink) {
      console.log('🔗 File Link:', fileLink)
    }
    console.log('📄 Message ID:', info.messageId)
    console.log('💾 Email log saved to:', logFile)
    console.log('='.repeat(50))

    // Return successful response
    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId,
      recipients: info.accepted,
      logFile: logFile,
      emailContent: {
        to: to,
        subject: emailSubject,
        fileLink: fileLink || null
      }
    }, { status: 200 })
    
  } catch (error) {
    console.error('Send email error:', error)
    
    // Handle specific nodemailer errors
    if (error.code === 'EAUTH') {
      return NextResponse.json(
        { error: 'Email authentication failed. Please check EMAIL_USER and EMAIL_PASS credentials.' },
        { status: 500 }
      )
    }
    
    if (error.code === 'ECONNECTION') {
      return NextResponse.json(
        { error: 'Failed to connect to email server. Please check your internet connection.' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to send email', details: error.message },
      { status: 500 }
    )
  }
}