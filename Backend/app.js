const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 8000;
const pdf = require("pdf-lib");
const { PDFDocument, Rectangle } = pdf;
const fs = require("fs");
const calculateHash = require("./calculateHash");
const web3i = require("./web3i");
const confirm = require("./confirm");
const qr = require("qr-image");
const QRCode = require("qrcode");
const { fromPath } = require("pdf2pic");
const { PNG } = require("pngjs");
const jsQR = require("jsqr");

var pdfBytes;

function extractCertificateInfo(qrCodeText) {
  const lines = qrCodeText.split("\n");
  const certificateInfo = {
    "Certificate Hash": "",
    "Certificate Number": "",
  };

  for (const line of lines) {
    const parts = line.trim().split(":");
    if (parts.length === 2) {
      const key = parts[0].trim();
      let value = parts[1].trim();

      // Remove commas from the value if present
      value = value.replace(/,/g, "");

      if (key === "Certificate Hash") {
        certificateInfo["Certificate Hash"] = value;
      } else if (key === "Certificate Number") {
        certificateInfo["Certificate Number"] = value;
      }
    }
  }

  return certificateInfo;
}

// Function to extract QR code from a PDF
async function extractQRCodeDataFromPDF(pdfFilePath) {
  try {
    const pdf2picOptions = {
      quality: 100,
      density: 300,
      format: "png",
      width: 2000,
      height: 2000,
    };

    /**
     * Initialize PDF to image conversion by supplying a file path
     */
    const base64Response = await fromPath(pdfFilePath, pdf2picOptions)(
      1, // page number to be converted to image
      true // returns base64 output
    );
    const dataUri = base64Response?.base64;

    if (!dataUri)
      throw new Error("PDF could not be converted to Base64 string");

    const buffer = Buffer.from(dataUri, "base64");
    const png = PNG.sync.read(buffer);

    const code = jsQR(Uint8ClampedArray.from(png.data), png.width, png.height);
    const qrCodeText = code?.data;

    if (!qrCodeText)
      throw new Error("QR Code Text could not be extracted from PNG image");

    console.log("QR Code Text:==> ", qrCodeText);

    const certificateInfo = extractCertificateInfo(qrCodeText);

    return certificateInfo;
  } catch (error) {
    console.error(error);
    throw error; 
  }
}

app.use(cors());
// Set up multer storage and file filter
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads"); // Set the destination where files will be saved
  },
  filename: (req, file, cb) => {
    const Certificate_Number = req.body.Certificate_Number;
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only JPEG and PNG files are allowed."),
      false
    );
  }
};

const upload = multer({ storage, fileFilter });

var qrX, qrY, qrWidth, qrHeight;

async function addLinkToPdf(
  inputPath,
  outputPath,
  linkUrl,
  qrCode,
  combinedHash
) {
  const existingPdfBytes = fs.readFileSync(inputPath);

  const pdfDoc = await pdf.PDFDocument.load(existingPdfBytes);

  const page = pdfDoc.getPage(0);

  const width = page.getWidth();
  const height = page.getHeight();

  page.drawText(linkUrl, {
    x: 62,
    y: 30,
    size: 8,
  });

  // page.drawText(combinedHash, {
  //   x: 5,
  //   y: 10,
  //   size: 3
  // });

  //Adding qr code
  const pdfDc = await PDFDocument.create();
  const pngImage = await pdfDoc.embedPng(qrCode);
  const pngDims = pngImage.scale(0.3);

  page.drawImage(pngImage, {
    x: width - pngDims.width - 132,
    y: 116,
    width: pngDims.width,
    height: pngDims.height,
  });
  qrX = width - pngDims.width - 75;
  qrY = 75;
  qrWidth = pngDims.width;
  qrHeight = pngDims.height;

  pdfBytes = await pdfDoc.save();

  fs.writeFileSync(outputPath, pdfBytes);
  return pdfBytes;
}

// POST route to handle file upload and form data processing
app.post("/api/upload", upload.single("pdfFile"), async (req, res) => {
  const Certificate_Number = req.body.Certificate_Number;
  const name = req.body.name;
  const courseName = req.body.courseName;
  const Grant_Date = req.body.Grant_Date;
  const Expiration_Date = req.body.Expiration_Date;

  const fields = {
    Certificate_Number: req.body.Certificate_Number,
    name: req.body.name,
    courseName: req.body.courseName,
    Grant_Date: req.body.Grant_Date,
    Expiration_Date: req.body.Expiration_Date,
  };
  const hashedFields = {};
  for (const field in fields) {
    hashedFields[field] = calculateHash(fields[field]);
  }
  const combinedHash = calculateHash(JSON.stringify(hashedFields));

  console.log("combinedHash", combinedHash);

  //Blockchain processing.
  const contract = await web3i();

  const val = await contract.methods.verifyCertificate(combinedHash).call();

  if (val[0] == true && val[1] == Certificate_Number) {
    res.status(400).json({ message: 'Certificate already issued' });
  } else {
    const tx = contract.methods.issueCertificate(
      fields.Certificate_Number,
      combinedHash
    );

    hash = await confirm(tx);

    console.log("hashhashhash", hash);

    // qr code processing.
    const qrCodeData = `Transaction Hash: "${hash}",
Certificate Hash: ${combinedHash},
Certificate Number: ${fields.Certificate_Number},
Name: ${fields.name},
Course Name: ${fields.courseName},
Grant Date: ${fields.Grant_Date},
Expiration Date: ${fields.Expiration_Date}`;

    // Generate the QR code with the updated data
    const qrCodeImage = await QRCode.toBuffer(qrCodeData, {
      errorCorrectionLevel: "H",
    });

    file = req.file.path;
    const outputPdf = `${fields.Certificate_Number}${name}.pdf`;
    const linkUrl = `https://mumbai.polygonscan.com/tx/${hash}`;

    const opdf = await addLinkToPdf(
      __dirname + "/" + file,
      outputPdf,
      linkUrl,
      qrCodeImage,
      combinedHash
    );

    const fileBuffer = fs.readFileSync(outputPdf);
    console.log("fileBuffer", fileBuffer);
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="certificate.pdf"',
    });
    res.send(fileBuffer);

  }
});

//Verify page
app.post("/api/verify", upload.single("pdfFile"), async (req, res) => {
  file = req.file.path;
  try {
    const certificateData = await extractQRCodeDataFromPDF(file);
    console.log("Certificate Hash:", certificateData["Certificate Hash"]);
    console.log("Certificate Number:", certificateData["Certificate Number"]);

    const contract = await web3i();
    const certificateNumber = Number(certificateData["Certificate Number"]);
    const val = await contract.methods
      .verifyCertificate(certificateData["Certificate Hash"])
      .call();
    console.log(val[0], val[1]);

    if (val[0] == true && val[1] == certificateNumber) {
      res.status(200).json({ message: "Verified: Certificate is valid" });
    } else {
      res.status(400).json({ message: "Certificate is not valid" });
    }
  } catch (error) {
    // Handle the error and send the response to the frontend
    res.status(400).json({ message: "Certificate is not valid" });
  }
});


app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Start the server
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
