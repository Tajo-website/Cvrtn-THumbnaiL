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

  &cu=INR`;
  if (document.getElementById('upiQrCode')) {
      document.getElementById('upiQrCode').src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;
  }
  
  
  // Skip intake form for normal items
  if (document.getElementById('modalStep0')) {
    
  &cu=INR`;
  if (document.getElementById('upiQrCode')) {
      document.getElementById('upiQrCode').src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;
  }
  
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
  
  
  &cu=INR`;
  if (document.getElementById('upiQrCode')) {
      document.getElementById('upiQrCode').src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;
  }
  
  document.getElementById('modalStep0').style.display = 'none';
  document.getElementById('modalStep1').style.display = 'block';
}

function closeModal() {
  document.getElementById('paymentModal').style.display = 'none';
}


async function payViaNetbanking() {
  try {
    const amountInPaise = currentItem.price * 100;
    
    const orderRes = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: amountInPaise, currency: 'INR', itemName: currentItem.name })
    });
    
    const orderData = await orderRes.json();
    if (!orderData.payment_session_id) {
      alert("Error initializing Cashfree order. Please try again.");
      return;
    }

    const cashfree = Cashfree({ mode: "sandbox" });

    cashfree.checkout({
      paymentSessionId: orderData.payment_session_id,
      redirectTarget: "_modal",
    }).then(async (result) => {
      if (result.error) {
        alert("Payment Failed or Cancelled: " + result.error.message);
      }
      
      if (result.paymentDetails) {
        try {
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_id: orderData.order_id })
          });
          
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            document.getElementById('modalStep1').style.display = 'none';
            document.getElementById('modalStep2').style.display = 'block';
            
            if (currentItem.file === '#') {
                const waMessage = `Hi Tanish! I successfully paid ₹${currentItem.price} for a Custom Thumbnail Request via Cashfree.

Here are my requirements:
${customText}

[I will attach my photo/video here]`;
                const isMobile = /iPhone|Android|iPad|iPod/i.test(navigator.userAgent);
                if (isMobile) {
                    document.getElementById('downloadLink').href = `whatsapp://send?phone=919725920066&text=${encodeURIComponent(waMessage)}`;
                } else {
                    document.getElementById('downloadLink').href = `https://web.whatsapp.com/send?phone=919725920066&text=${encodeURIComponent(waMessage)}`;
                }
            }
          } else {
            alert("Payment verification failed! Please contact support.");
            window.location.reload();
          }
        } catch (e) {
          console.error("Verification error:", e);
          alert("Payment verified but an error occurred.");
        }
      }
    });
  } catch (error) {
    console.error("Checkout Error:", error);
    alert("Could not start checkout.");
  }
}
