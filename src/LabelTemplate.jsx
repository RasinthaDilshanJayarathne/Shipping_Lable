import React, { useRef, useState } from "react";
import Barcode from "react-barcode";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "bootstrap/dist/css/bootstrap.min.css";

const LabelTemplate = () => {
  const [formData, setFormData] = useState({
    companyFrom: "",
    addressFrom: "",
    cityFrom: "",
    companyTo: "",
    addressTo: "",
    cityTo: "",
    refNumber: "",
    lotNumber: "",
    orderNumber: "",
    deliveryInstructions: "",
  });

  const [additionalFields, setAdditionalFields] = useState([]);
  const [logo, setLogo] = useState(null);
  const previewRef = useRef();

  const placeholders = {
    companyFrom: "Enter From Company Name",
    addressFrom: "Enter From Address Here",
    cityFrom: "Enter From City",
    companyTo: "Enter To Company Name",
    addressTo: "Enter To Address Here",
    cityTo: "Enter To City",
    refNumber: "Enter Reference Number",
    lotNumber: "Enter Lot Number",
    orderNumber: "Enter Order Number",
    deliveryInstructions: "Enter Your Delivery Instructions...",
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addField = () => {
    setAdditionalFields((prev) => [
      ...prev,
      { id: Date.now(), name: "", value: "" },
    ]);
  };

  const removeField = (id) => {
    setAdditionalFields((prev) => prev.filter((field) => field.id !== id));
  };

  const handleAdditionalFieldChange = (e, id) => {
    const { name, value } = e.target;
    setAdditionalFields((prev) =>
      prev.map((field) =>
        field.id === id ? { ...field, [name]: value } : field
      )
    );
  };

  // const downloadPDF = () => {
  //   html2canvas(previewRef.current, { scale: 2 }).then((canvas) => {
  //     const imgData = canvas.toDataURL("image/png");
  //     const pdf = new jsPDF("landscape", "pt", [canvas.width, canvas.height]);
  //     pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
  //     pdf.save("label.pdf");
  //   });
  // };

  const downloadPDF = () => {
    const A4_WIDTH = 841.89; // points (landscape)
    const A4_HEIGHT = 595.28;

    html2canvas(previewRef.current, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("landscape", "pt", [A4_WIDTH, A4_HEIGHT]);

      // Calculate image dimensions to fit in A4 while maintaining aspect ratio
      const ratio = Math.min(A4_WIDTH / canvas.width, A4_HEIGHT / canvas.height);
      const imgWidth = canvas.width * ratio;
      const imgHeight = canvas.height * ratio;
      const x = (A4_WIDTH - imgWidth) / 2;
      const y = (A4_HEIGHT - imgHeight) / 2;

      pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
      pdf.save("label.pdf");
    });
  };

  const downloadImage = () => {
    html2canvas(previewRef.current, { scale: 2 }).then((canvas) => {
      const link = document.createElement("a");
      link.download = "label.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  };

  return (
    <div className="container-fluid py-5 bg-light">
      <h2 className="mb-4 text-center">Shipping Label Generator</h2>

      {/* Inputs */}
      <div className="row mb-5">
        {/* Logo upload */}
        <div className="col-md-6 col-12 mb-3">
          <label className="form-label">Upload Logo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="form-control"
          />
        </div>

        {/* Text Inputs */}
        {Object.keys(formData).map((key) => (
          <div key={key} className="col-md-6 col-12 mb-3">
            <label className="form-label text-capitalize">
              {key.replace(/([A-Z])/g, " $1")}
            </label>
            <input
              type="text"
              name={key}
              value={formData[key]}
              onChange={handleChange}
              placeholder={placeholders[key]}
              className="form-control"
            />
          </div>
        ))}

        {/* Additional Fields */}
        {additionalFields.map((field) => (
          <div key={field.id} className="col-md-6 col-12 mb-3">
            <label className="form-label">Custom Field</label>
            <div className="d-flex align-items-center">
              <input
                type="text"
                name="name"
                value={field.name}
                onChange={(e) => handleAdditionalFieldChange(e, field.id)}
                placeholder="Field Name"
                className="form-control me-2"
              />
              <input
                type="text"
                name="value"
                value={field.value}
                onChange={(e) => handleAdditionalFieldChange(e, field.id)}
                placeholder="Field Value"
                className="form-control"
              />
              <button
                type="button"
                onClick={() => removeField(field.id)}
                className="btn btn-danger ms-2"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className="mb-5 d-flex gap-3 justify-content-center">
        <button onClick={downloadPDF} className="btn btn-primary">
          Download PDF
        </button>
        <button onClick={downloadImage} className="btn btn-success">
          Download Image
        </button>
        <button onClick={addField} className="btn btn-secondary">
          Add Custom Field
        </button>
      </div>

      {/* Preview */}
      <div
        className="bg-white p-4 border border-dark"
        style={{
          maxWidth: "100%",
          margin: "0 auto",
          borderWidth: "10px",
          position: "relative",
        }}
        ref={previewRef}
      >
        {/* Top Row: Logo + FROM/TO */}
        <div className="row mb-3">
          {/* Logo */}
          <div className="col-md-3 col-12 d-flex flex-column align-items-center justify-content-center border-end border-dark">
            {logo ? (
              <img
                src={logo}
                alt="Uploaded Logo"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100px",
                  objectFit: "contain",
                }}
              />
            ) : (
              <>
                <h3 className="fw-bold m-0">YOUR</h3>
                <h3 className="fw-bold m-0">LOGO</h3>
              </>
            )}
          </div>

          {/* FROM and TO */}
          <div className="col-md-9 col-12">
            <div className="row">
              <div className="col-md-6 col-12 border-end border-dark">
                <div className="fw-bold">FROM:</div>
                <div>{formData.companyFrom || placeholders.companyFrom}</div>
                <div>{formData.addressFrom || placeholders.addressFrom}</div>
                <div>{formData.cityFrom || placeholders.cityFrom}</div>
              </div>
              <div className="col-md-6 col-12">
                <div className="fw-bold">TO:</div>
                <div>{formData.companyTo || placeholders.companyTo}</div>
                <div>{formData.addressTo || placeholders.addressTo}</div>
                <div>{formData.cityTo || placeholders.cityTo}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Line */}
        <hr className="border-dark border-2" />

        {/* Ref No, Lot No, Order No */}
        <div className="row mb-4">
          <div className="col-md-6 col-12">
            <div>
              <b>Ref Number:</b> {formData.refNumber || placeholders.refNumber}
            </div>
            <div>
              <b>Lot Number:</b> {formData.lotNumber || placeholders.lotNumber}
            </div>
          </div>
          <div className="col-md-6 col-12 text-end">
            <div className="fw-bold">Order No.</div>
            <div className="fs-4 fw-bold">
              {formData.orderNumber || placeholders.orderNumber}
            </div>
          </div>
        </div>

        {/* Barcode */}
        <div className="d-flex flex-column align-items-center mb-3">
          {formData.orderNumber && (
            <Barcode
              value={formData.orderNumber}
              width={2}
              height={80}
              displayValue={false}
            />
          )}
        </div>

        {/* Horizontal Line */}
        <hr className="border-dark border-2" />

        {/* Additional Fields */}
        {additionalFields.map(
          (field) =>
            field.value && (
              <div key={field.id} className="mb-2">
                <b>{field.name || "Custom Field"}:</b> {field.value}
              </div>
            )
        )}

        {/* Bottom Section */}
        <div className="text-sm">
          <div className="mb-2">
            <b>Order No:</b> {formData.orderNumber || placeholders.orderNumber}
          </div>
          <div className="mb-2">
            <b>Delivery Instructions:</b>{" "}
            {formData.deliveryInstructions || placeholders.deliveryInstructions}
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-md-12 text-center">
          <p>
            Copyright &copy;
            <script>document.write(new Date().getFullYear());</script> All rights reserved | Designed &
            Developed <i class="icon-heart color-danger" aria-hidden="true"></i> by <a
              href="https://codespherelabs.vercel.app/" target="_blank">Codesphere Labs</a>
          </p>
        </div>
      </div>
    </div>


  );
};

export default LabelTemplate;
