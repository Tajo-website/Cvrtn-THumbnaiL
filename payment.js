let currentItem = { name: "", price: 0, file: "" };
let customText = "";

function buyThumbnail(thumbnailName, priceInINR, fileUrl) {
  currentItem = { name: thumbnailName, price: priceInINR, file: fileUrl };
  
  document.getElementById('modalItemName').innerText = thumbnailName;
  document.getElementById('modalPrice').innerText = '₹' + priceInINR;
  
  const downloadLink = document.getElementById('downloadLink');
  const downloadBtn = downloadLink.querySelector('button');
  
  downloadLink.href = fileUrl;
  downloadLink.setAttribute('download', `${thumbnailName.replace(/\s+/g, '_')}_Asset.zip`);
  downloadLink.removeAttribute('target');
  downloadBtn.innerText = "Download File";
  
  const upiUrl = `upi://pay?pa=nayeetanish@oksbi&pn=CVRTN&am=${priceInINR}&cu=INR`;
  document.getElementById('upiQrCode').src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;
  
  // Skip intake form for normal items
  if (document.getElementById('modalStep0')) {
    document.getElementById('modalStep0').style.display = 'none';
  }
  document.getElementById('modalStep1').style.display = 'block';
  document.getElementById('modalStep2').style.display = 'none';
  document.getElementById('paymentModal').style.display = 'flex';
}

function buyCustom(thumbnailName, priceInINR) {
  currentItem = { name: thumbnailName, price: priceInINR, file: '#' };
  
  document.getElementById('modalItemName').innerText = thumbnailName;
  document.getElementById('modalPrice').innerText = '₹' + priceInINR;
  
  const downloadLink = document.getElementById('downloadLink');
  const downloadBtn = downloadLink.querySelector('button');
  
  downloadLink.removeAttribute('download');
  downloadLink.href = '#';
  downloadLink.target = "_blank";
  downloadBtn.innerText = "Send Requirements on WhatsApp";
  
  // Show intake form for custom
  document.getElementById('modalStep0').style.display = 'block';
  document.getElementById('modalStep1').style.display = 'none';
  document.getElementById('modalStep2').style.display = 'none';
  document.getElementById('paymentModal').style.display = 'flex';
}

function proceedToPayment() {
  customText = document.getElementById('customDescription').value;
  if (!customText || customText.trim() === '') {
    alert("Please enter a description so I know what to design for you!");
    return;
  }
  
  const upiUrl = `upi://pay?pa=nayeetanish@oksbi&pn=CVRTN&am=${currentItem.price}&cu=INR`;
  document.getElementById('upiQrCode').src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;

  document.getElementById('modalStep0').style.display = 'none';
  document.getElementById('modalStep1').style.display = 'block';
}

function closeModal() {
  document.getElementById('paymentModal').style.display = 'none';
}

function verifyManualUPI() {
  const isCustom = currentItem.file === '#';
  let message = '';
  
  if (isCustom) {
    message = `Hi Tanish! I just paid ₹${currentItem.price} for a Custom Thumbnail Request via manual UPI.\n\nHere is my payment screenshot.\n\nHere are my requirements:\n${customText}\n\n[I will attach my photo/video here]`;
  } else {
    message = `Hi Tanish! I just paid ₹${currentItem.price} for the ${currentItem.name} pack via manual UPI.\n\nHere is my payment screenshot. Please send me the file!`;
  }
  
  // Use api.whatsapp.com for best native app support
  const waUrl = `https://api.whatsapp.com/send?phone=919725920066&text=${encodeURIComponent(message)}`;
  window.open(waUrl, '_blank');
  
  document.getElementById('verifyBtn').innerText = "Redirecting to WhatsApp...";
}

async function payViaNetbanking() {
  try {
    const amountInPaise = currentItem.price * 100;
    
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
            
            if (currentItem.file === '#') {
                const waMessage = `Hi Tanish! I successfully paid ₹${currentItem.price} for a Custom Thumbnail Request via Razorpay.\n\nHere are my requirements:\n${customText}\n\n[I will attach my photo/video here]`;
                document.getElementById('downloadLink').href = `https://api.whatsapp.com/send?phone=919725920066&text=${encodeURIComponent(waMessage)}`;
            }
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