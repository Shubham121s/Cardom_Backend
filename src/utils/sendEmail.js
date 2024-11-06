const nodeMailer = require("nodemailer");

const sendEmailMessage = async (options) => {
    const Transport = nodeMailer.createTransport({
        host: process.env.SMPT_HOST,
        post: process.env.SMPT_PORT,
        secure: process.env.SMPT_SECURE,
        service: process.env.SMPT_SERVICE,
        auth: {
            user: process.env.SMPT_USER,
            pass: process.env.SMPT_PASS
        }
    })

    const mailOptions = {
        from:process.env.SMPT_MAIL,
        to: options.email,
        subject: options.subject,
        html: options.message
    }
    await Transport.sendMail(mailOptions)

}
module.exports = sendEmailMessage;