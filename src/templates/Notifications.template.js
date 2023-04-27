"use strict";
const nodemailer = require("nodemailer");
const sgMail = require('@sendgrid/mail')
const moment = require('moment')

class notificacionsSend{

    static async changeCPC(user, url,value, name){

        sgMail.setApiKey(process.env.SENDGRID_API_KEY)
        const msg = {
            //to: 'andresgiraldo117@gmail.com', 
            to: user.email, 
            from: 'afgiraldo@smdigital.com.co',
            template_id: 'd-33835b3402e446f4bed28b887557db81',
            dynamicTemplateData: {
                url,
                name,
                value,
              },
          }
          sgMail
          .send(msg)
          .then((response) => {
            console.log(response[0].statusCode)
            console.log(response[0].headers)
          })
          .catch((error) => {
            console.error(error)
          })
    }
    static async emailToken(user, token){

        sgMail.setApiKey(process.env.SENDGRID_API_KEY)
        const msg = {
            //to: 'andresgiraldo117@gmail.com', 
            to: user.email, 
            from: 'afgiraldo@smdigital.com.co',
            template_id: 'd-d9698a13915b41b5bd9a2e313c0151f8',
            dynamicTemplateData: {
                callbackUrl: `http://localhost:3001/api/users/confirm/${token}`,
              },
          }
          sgMail
          .send(msg)
          .then((response) => {
            //console.log(response[0].statusCode)
            //console.log(response[0].headers)
          })
          .catch((error) => {
            console.error(error)
          })
    }

    static async newCampaignUser(name, emaillist, url = 'https://stg-smcloud.smdigitalstage.com'){

        sgMail.setApiKey(process.env.SENDGRID_API_KEY)
        const msg = {
            to: emaillist, 
            //to: user.email, 
            from: 'afgiraldo@smdigital.com.co',
            template_id: 'd-b1e58ef073434068a0347592bc60e82f',
            dynamicTemplateData: {
                url: url,
                name: name
              },
          }
          sgMail
          .send(msg)
          .then((response) => {
            console.log(response[0].statusCode)
            //console.log(response[0].headers)
          })
          .catch((error) => {
            console.error(error)
          })
    }
    static async newCampaign(name, user, date_start, date_end, managerlist, url = 'https://stg-smcloud.smdigitalstage.com'){

        sgMail.setApiKey(process.env.SENDGRID_API_KEY)
        const msg = {
            to: managerlist, 
            //to: user.email, 
            from: 'afgiraldo@smdigital.com.co',
            template_id: 'd-ac5e121863ed4eb6a239f872e89122b3',
            dynamicTemplateData: {
                url: url,
                name: name,
                user: user,
                date_start: moment(date_start).locale('es').format('dddd, D MMMM, YYYY'),
                date_end: moment(date_end).locale('es').format('dddd, D MMMM, YYYY'),
              },
          }
          sgMail
          .send(msg)
          .then((response) => {
            console.log(response[0].statusCode)
            //console.log(response[0].headers)
          })
          .catch((error) => {
            console.error(error)
          })
    }

    static async changePassword(token){
        const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 465,
                // service: 'gmail',
                secure: true, 
                auth: {
                    user: 'smdclouda@gmail.com', 
                    pass: 'habdalampeiwwudf', 
                },
        });
        transporter.verify().then(() => {
            //console.log('Listo para enviar emails');
        }).catch(err => console.log(err));
        
        return await transporter.sendMail({
            from: '"notificacion" <smdclouda@gmail.com>', 
            to: "amolina@smdigital.com.co",    
            // to: user.email,    
            subject: "Hello ✔", 
            text: "Hello world?",  
            html: `
                <div>
                    <h2> Hola </h2>
                    <p> Para cambiar su contraseña clic en el siguiente enlace: </p>
                    <p>${token}</p>
                    <a href="http://localhost:3001/api/auth/new-password/${token}">
                        Confirmar cuenta
                    </a>
                </div>
            ` 
        });
    }

    //<a style="color: #fff" href="http://localhost:3001/api/user/confirm/${token}>
    static async emailAddToPauta(user, pauta){
        const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 465,
                // service: 'gmail',
                secure: true, 
                auth: {
                    user: 'smdclouda@gmail.com', 
                    pass: 'habdalampeiwwudf', 
                },
        });
        transporter.verify().then(() => {
            //console.log('Listo para enviar emails');
        }).catch(err => console.log(err));
        
        return await transporter.sendMail({
            from: '"notificacion" <smdclouda@gmail.com>', 
            to: "amolina@smdigital.com.co",  
            // to: user.email,  
            subject: "Hello ✔", 
            text: "Hello world?",  
            html: `
            <table border="0" cellpadding="0" cellspacing="0" width="600px" background-color="#2d3436" bgcolor="#2d3436">
            <tr height="200px">  
                <td bgcolor="" width="600px">
                    <h1 style="color: #fff; text-align:center">Hola ${user.name}</h1>
                    <p  style="color: #fff; text-align:center">
                        Este correo es para informarte que fuiste elegid@ para hacer parte de la pauta.
                        <br /> <span style="color: #e84393"> ${pauta.name}</span>
                    </p>
                </td>
            </tr>
            <tr bgcolor="#fff">
                <td style="text-align:center">
                    <p style="color: #000">¡Un mundo de servicios a su disposición!</p>
                </td>
            </tr>
            </table>
            ` 
        });
    }

    static async emailToApprovedPauta(user, pauta){
        const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 465,
                // service: 'gmail',
                secure: true, 
                auth: {
                    user: 'smdclouda@gmail.com', 
                    pass: 'habdalampeiwwudf', 
                },
        });
        transporter.verify().then(() => {
            //console.log('Listo para enviar emails');
        }).catch(err => console.log(err));
        
        return await transporter.sendMail({
            from: '"notificacion" <smdclouda@gmail.com>', 
            to: user.email,  
            // to: user.email,  
            subject: "Hello ✔", 
            text: "Hello world?",  
            html: `
            <table border="0" cellpadding="0" cellspacing="0" width="600px" background-color="#2d3436" bgcolor="#2d3436">
            <tr height="200px">  
                <td bgcolor="" width="600px">
                    <h1 style="color: #fff; text-align:center">Hola ${user.name}</h1>
                    <p  style="color: #fff; text-align:center">
                        Este correo es para informarte que la pauta <span style="color: #e84393"> ${pauta}</span> ya fue aprobada.
                    </p>
                </td>
            </tr>
            <tr bgcolor="#fff">
                <td style="text-align:center">
                    <p style="color: #000">¡Un mundo de servicios a su disposición!</p>
                </td>
            </tr>
            </table>
            ` 
        });
    }
    static async emailToDisapprovePauta(name, pauta){
        const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 465,
                // service: 'gmail',
                secure: true, 
                auth: {
                    user: 'smdclouda@gmail.com', 
                    pass: 'habdalampeiwwudf', 
                },
        });
        transporter.verify().then(() => {
            //console.log('Listo para enviar emails');
        }).catch(err => console.log(err));
        
        const email = await transporter.sendMail({
            from: '"notificacion" <smdclouda@gmail.com>', 
            to: "amolina@smdigital.com.co",  
            // to: user.email,  
            subject: "Hello ✔", 
            text: "Hello world?",  
            html: `
            <table border="0" cellpadding="0" cellspacing="0" width="600px" background-color="#2d3436" bgcolor="#2d3436">
            <tr height="200px">  
                <td bgcolor="" width="600px">
                    <h1 style="color: #fff; text-align:center">Hola ${name}</h1>
                    <p  style="color: #fff; text-align:center">
                        Este correo es para informarte que la pauta <span style="color: #e84393"> ${pauta}</span> ha sido desaprobada.
                    </p>
                </td>
            </tr>
            <tr bgcolor="#fff">
                <td style="text-align:center">
                    <p style="color: #000">¡Un mundo de servicios a su disposición!</p>
                </td>
            </tr>
            </table>
            ` 
        });
    }
}

module.exports = notificacionsSend;
