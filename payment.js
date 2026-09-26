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
    downloadLink.href = '#';
    downloadBtn.innerText = "Success! We will contact you shortly.";
  } else {
    downloadLink.href = fileUrl;
    downloadLink.setAttribute('download', `${thumbnailName.replace(/\s+/g, '_')}_Asset.zip`);
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
  const btn = document.getElementById('verifyBtn');
  const originalText = btn.innerText;
  btn.innerText = 'Verifying Payment...';
  btn.disabled = true;
  
  setTimeout(() => {
    document.getElementById('modalStep1').style.display = 'none';
    document.getElementById('modalStep2').style.display = 'block';
    btn.innerText = originalText;
    btn.disabled = false;
  }, 2500);
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
            netbanking: {
              name: "Net Banking",
              instruments: [ { method: "netbanking" } ]
            }
          },
          sequence: ["block.netbanking"],
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