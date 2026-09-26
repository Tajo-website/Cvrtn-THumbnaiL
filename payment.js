// Razorpay Checkout Logic

function buyThumbnail(thumbnailName, priceInINR, fileUrl) {
  const options = {
    key: "rzp_test_TgZarEirmWgxQk", // Use rzp_test_... for testing
    amount: priceInINR * 100, // Razorpay takes amounts in paise (₹49 = 4900)
    currency: "INR",
    name: "CVRTN Studio",
    description: `Purchase: ${thumbnailName}`,
    theme: { color: "#D97A7A" },
    config: {
      display: {
        blocks: {
          upi: {
            name: "Pay via UPI",
            instruments: [
              { method: "upi" }
            ]
          }
        },
        sequence: ["block.upi"],
        preferences: {
          show_default_blocks: false
        }
      }
    },
 // Updated to match the new cream/beige theme accent
    handler: function (response) {
      // THIS ONLY RUNS IF PAYMENT IS SUCCESSFUL & VERIFIED
      console.log("Payment Success ID: ", response.razorpay_payment_id);
      
      // Trigger the download for the specific file
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = `${thumbnailName.replace(/\s+/g, '_')}_Asset.zip`; // Using .zip since they are packs/psds
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert("Payment successful! Your file is downloading.");
    }
  };
  
  const rzp = new window.Razorpay(options);
  rzp.open();
}

// Fallback logic for custom requests where they don't immediately download a file
function buyCustom(thumbnailName, priceInINR) {
  const options = {
    key: "rzp_test_TgZarEirmWgxQk", 
    amount: priceInINR * 100, 
    currency: "INR",
    name: "CVRTN Studio",
    description: `Purchase: ${thumbnailName}`,
    theme: { color: "#7A9E9F" },
    config: {
      display: {
        blocks: {
          upi: {
            name: "Pay via UPI",
            instruments: [
              { method: "upi" }
            ]
          }
        },
        sequence: ["block.upi"],
        preferences: {
          show_default_blocks: false
        }
      }
    },

    handler: function (response) {
      console.log("Payment Success ID: ", response.razorpay_payment_id);
      alert("Payment successful! Tanish will contact you shortly to begin the custom design.");
    }
  };
  
  const rzp = new window.Razorpay(options);
  rzp.open();
}