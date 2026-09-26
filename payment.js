let currentItem = { name: "", price: 0, file: "" };

function buyThumbnail(thumbnailName, priceInINR, fileUrl) {
  currentItem = { name: thumbnailName, price: priceInINR, file: fileUrl };
  
  // Set up modal UI
  document.getElementById('modalItemName').innerText = thumbnailName;
  document.getElementById('modalPrice').innerText = '₹' + priceInINR;
  
  const downloadLink = document.getElementById('downloadLink');
  const downloadBtn = downloadLink.querySelector('button');
  
  if (fileUrl === '#') {
    downloadLink.removeAttribute('download');
    const waMessage = `Hi Tanish! I successfully paid ₹${priceInINR} for a ${thumbnailName} via Razorpay.\n\nHere are my requirements, video/photo, and where to send the final design:`;
    downloadLink.href = `https://wa.me/919725920066?text=${encodeURIComponent(waMessage)}`;
    downloadLink.target = "_blank";
    downloadBtn.innerText = "Send Requirements on WhatsApp";
  } else {
    downloadLink.href = fileUrl;
    downloadLink.setAttribute('download', `${thumbnailName.replace(/\s+/g, '_')}_Asset.zip`);
    downloadLink.removeAttribute('target');
    downloadBtn.innerText = "Download File";
  }
  
  // Create QR for the manual UPI bypass
  const upiUrl = `upi://pay?pa=nayeetanish@oksbi&pn=CVRTN&am=${priceInINR}&cu=INR`;
  document.getElementById('upiQrCode').src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;
  
  // Reset states
  document.getElementById('modalStep1').style.display = 'block';
  document.getElementById('modalStep2').style.display = 'none';
  document.getElementById('paymentModal').style.display = 'flex';
}

function buyCustom(thumbnailName, priceInINR) {
  buyThumbnail(thumbnailName, priceInINR, '#');
}

function closeModal() {
  document.getElementById('paymentModal').style.display = 'none';
}

function verifyManualUPI() {
  const isCustom = currentItem.file === '#';
  let message = '';
  
  if (isCustom) {
    message = `Hi Tanish! I just paid ₹${currentItem.price} for a ${currentItem.name} via manual UPI.\n\nHere is my payment screenshot.\n\n[Please attach your video/photo and describe what you want here. Also include where you want the final thumbnail sent!]`;
  } else {
    message = `Hi Tanish! I just paid ₹${currentItem.price} for the ${currentItem.name} pack via manual UPI.\n\nHere is my payment screenshot. Please send me the file!`;
  }
  
  const waUrl = `https://wa.me/919725920066?text=${encodeURIComponent(message)}`;
  window.open(waUrl, '_blank');
  
  // Update UI to show they clicked it
  document.getElementById('verifyBtn').innerText = "Redirecting to WhatsApp...";
}

async function payViaNetbanking() {
  try {
    const amountInPaise = currentItem.price * 100;
    
    // 1. Create Order
    const orderRes = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`
      })
    });
    
    const orderData = await orderRes.json();
    if (!orderData.order_id) {
      alert("Error initializing checkout order. Please try again.");
      return;
    }

    const options = {
      key: "rzp_test_Tga7ldfHzH1m8o",
      amount: orderData.amount,
      currency: orderData.currency,
      name: "CVRTN Studio",
      description: `Purchase: ${currentItem.name}`,
      order_id: orderData.order_id,
      theme: { color: "#FF007A" },
      config: {
        display: {
          blocks: {
            upi: {
              name: "UPI (Google Pay, Paytm, PhonePe)",
              instruments: [ { method: "upi" } ]
            },
            netbanking: {
              name: "Net Banking",
              instruments: [ { method: "netbanking" } ]
            }
          },
          sequence: ["block.upi", "block.netbanking"],
          preferences: { show_default_blocks: false }
        }
      },
      prefill: {
        name: "Test User",
        email: "test@example.com",
        contact: "9999999999"
      },
      handler: async function (response) {
        try {
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          });
          
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            document.getElementById('modalStep1').style.display = 'none';
            document.getElementById('modalStep2').style.display = 'block';
          } else {
            alert("Payment verification failed! Please contact support.");
          }
        } catch (e) {
          console.error("Verification error:", e);
          alert("Payment verified but an error occurred.");
        }
      }
    };
    
    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (response){
        alert("Payment Failed: " + response.error.description);
    });
    rzp.open();
  } catch (error) {
    console.error("Checkout Error:", error);
    alert("Could not start checkout.");
  }
}