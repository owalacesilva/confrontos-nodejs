import mailer from 'nodemailer'
import { defaultMail } from '../../config'

export const sendMail = ({
  name,
  email,
  subject,
  content,
  fromName = defaultMail.fromName,
  fromEmail = defaultMail.fromEmail
}) => {
  // create reusable transporter object using the default SMTP transport
  let transporter = mailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'confrontos.vc@gmail.com', // generated ethereal user
      pass: 'qwertyuiop[' // generated ethereal password
    }
  })

  // setup email data with unicode symbols
  let mailOptions = {
    from: `"${fromName}" <${fromEmail}>`, // sender address
    to: `"${name}" <${email}>`, // list of receivers
    subject: subject, // Subject line
    // text: '** Plain text body **', // plain text body
    html: content // html body
  }

  // send mail with defined transport object
  return transporter.sendMail(mailOptions)
}