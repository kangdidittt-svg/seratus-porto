import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import jwt from 'jsonwebtoken'

// POST /api/send-email - Send email notification
export async function POST(request: NextRequest) {
  try {
    // Verify JWT token for admin access
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { to, subject, message, downloadLink, attachmentUrl } = await request.json()
    
    // Validate required fields
    if (!to || !subject || !message) {
      return NextResponse.json(
        { error: 'Email recipient, subject, and message are required' },
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

    // For development/testing - use mock email service
    // In production, configure proper SMTP or email service
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    let transporter
    
    if (isDevelopment) {
      // Mock transporter for development
      transporter = {
        sendMail: async (options: any) => {
          console.log('=== MOCK EMAIL SENT ===')
          console.log('To:', options.to)
          console.log('Subject:', options.subject)
          console.log('Message:', options.text)
          console.log('HTML:', options.html)
          console.log('========================')
          
          return {
            messageId: `mock-${Date.now()}@seratus-studio.com`,
            accepted: [options.to],
            rejected: []
          }
        }
      }
    } else {
      // Production SMTP configuration
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        return NextResponse.json(
          { error: 'Email configuration not found. Please set EMAIL_USER and EMAIL_PASS environment variables.' },
          { status: 500 }
        )
      }
      
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS // Gmail App Password required
        }
      })
    }

    // Prepare email content
    let emailContent = message
    
    if (downloadLink) {
      emailContent += `\n\nDownload your file here: ${downloadLink}`
    }

    // Email options
    const mailOptions = {
      from: {
        name: 'Seratus Studio',
        address: process.env.EMAIL_USER || 'noreply@seratus-studio.com'
      },
      to: to,
      subject: subject,
      text: emailContent,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Seratus Studio</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Digital Art & Design</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">${subject}</h2>
            <div style="color: #555; line-height: 1.6; font-size: 16px;">
              ${message.replace(/\n/g, '<br>')}
            </div>
            
            ${downloadLink ? `
              <div style="margin-top: 30px; text-align: center;">
                <a href="${downloadLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; font-size: 16px;">Download Your File</a>
              </div>
            ` : ''}
          </div>
          
          <div style="text-align: center; color: #888; font-size: 14px;">
            <p>Thank you for choosing Seratus Studio!</p>
            <p style="margin: 5px 0;">© 2025 Seratus Studio. All rights reserved.</p>
          </div>
        </div>
      `
    }

    // Add attachment if provided
    if (attachmentUrl) {
      mailOptions.attachments = [{
        filename: 'download.zip',
        path: attachmentUrl
      }]
    }

    // Send email
    const info = await transporter.sendMail(mailOptions)
    
    return NextResponse.json({
      message: 'Email sent successfully',
      messageId: info.messageId,
      recipient: to
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
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}