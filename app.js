import dotenv from 'dotenv';
dotenv.config()
import express from 'express';
import logger from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import nodemailer from 'nodemailer';
import bodyParser from 'body-parser';

const mailer = nodemailer.createTransport({
    host: process.env.mail_HOST,
    port: 465,
    secure: true,
    auth: {
        user: process.env.mail_USER,
        pass: process.env.mail_PASS
    }
})

const app = express()
const port = 8000

app.set('json spaces', 2)
app.use(cors())
app.use(logger('dev'))
app.use(express.json())
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(express.static('public'))
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

app.get("/", (req, res) => {
    res.sendFile('./public/index.html')
})

app.post("/send", (req, res) => {
    const to = req.body.to,
        subject = req.body.subject,
        text = req.body.text

    if (!to || !subject || !text) return res.status(400).json({
        status: false,
        message: ":/"
    })

    mailer.sendMail({
        from: `"API-MAIL"`,
        to,
        subject,
        html: text
    }, (err) => {
        if (err) {
            console.log(err)
            return res.status(400).json({
                status: false,
                message: "Gagal"
            })
        }
        res.status(200).json({
            status: true,
            message: "Sukses send email"
        })
    })
})
// Handling 404
app.use(function (req, res, next) {
    res.status(404).json({
        status: false,
        message: "Page not found"
    })
})

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
})