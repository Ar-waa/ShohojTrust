// const Brevo = require("@getbrevo/brevo");

// const apiInstance = new Brevo.TransactionalEmailsApi();

// apiInstance.setApiKey(
//     Brevo.TransactionalEmailsApiApiKeys.apiKey,
//     process.env.BREVO_API_KEY
//     );

//     exports.sendEmail = async ({ to, subject, htmlContent }) => {
//     try {
//         await apiInstance.sendTransacEmail({
//         sender: {
//             email: process.env.EMAIL_FROM,
//             name: "ShohojTrust"
//         },
//         to: [{ email: to }],
//         subject,
//         htmlContent
//         });

//         console.log("📧 Email sent to:", to);
//     } catch (err) {
//         console.error("EMAIL ERROR:", err.response?.body || err.message);
//     }
// };

const axios = require("axios");

exports.sendEmail = async ({ to, subject, htmlContent }) => {
    try {
        const response = await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        {
            sender: {
            email: process.env.EMAIL_FROM,
            name: "ShohojTrust"
            },
            to: [{ email: to }],
            subject,
            htmlContent
        },
        {
            headers: {
            "api-key": process.env.BREVO_API_KEY,
            "Content-Type": "application/json"
            }
        }
        );

        console.log("📧 Email sent:", response.data);
    } catch (err) {
        console.error(
        "EMAIL ERROR FULL:",
        err.response?.data || err.message
        );
    }
};