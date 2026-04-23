const axios = require("axios");

const generatePDF = async (req, res) => {
  try {
    const { title, terms, date, amount, penalty } = req.body;

    const html = `
      <html>
        <body>
          <h1>Agreement Confirmation</h1>
          <p><b>Title:</b> ${title || ""}</p>
          <p><b>Terms:</b> ${terms || ""}</p>
          <p><b>Deadline:</b> ${date || ""}</p>
          <p><b>Payment:</b> ${amount || ""} BDT</p>
          <p><b>Penalty:</b> ${penalty || ""}%</p>
        </body>
      </html>
    `;

    const response = await axios.post(
      "https://api.pdfshift.io/v3/convert/pdf",
      { source: html },
      {
      auth: {
      username: "api",
      password: process.env.PDFSHIFT_API_KEY
      },
      responseType: "arraybuffer"
     }

    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=agreement.pdf");

    res.send(response.data);

  } catch (err) {
  console.log("❌ PDF ERROR FULL:", err.response?.data || err.message);
  console.log("STATUS:", err.response?.status);

  return res.status(500).json({
    msg: "PDF generation failed",
    error: err.response?.data || err.message
  });
}
};

module.exports = { generatePDF };