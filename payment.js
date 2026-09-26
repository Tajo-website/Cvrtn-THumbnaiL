// Razorpay Checkout Logic

async function buyThumbnail(thumbnailName, priceInINR, fileUrl) {
  try {
    const amountInPaise = priceInINR * 100;
    
    // 1. Create Order on Backend
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

    // 2. Open Razorpay Checkout Modal
    const options = {
      key: "rzp_test_Tga7ldfHzH1m8o", // Public Key is safe here
      amount: orderData.amount,
      currency: orderData.currency,
      name: "CVRTN Studio",
      description: `Purchase: ${thumbnailName}`,
      order_id: orderData.order_id,
      theme: { color: "#D97A7A" },
      handler: async function (response) {
        // 3. Verify Payment on Backend
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
            // Trigger the download for the specific file
            const link = document.createElement("a");
            link.href = fileUrl;
            link.download = `${thumbnailName.replace(/\s+/g, '_')}_Asset.zip`; 
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            alert("Payment verified successfully! Your file is downloading.");
          } else {
            alert("Payment verification failed! Please contact support.");
          }
        } catch (e) {
          console.error("Verification error:", e);
          alert("Payment verified but an error occurred triggering download.");
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

async function buyCustom(thumbnailName, priceInINR) {
  try {
    const amountInPaise = priceInINR * 100;
    
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
      description: `Purchase: ${thumbnailName}`,
      order_id: orderData.order_id,
      theme: { color: "#7A9E9F" },
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
            alert("Payment verified! Tanish will contact you shortly to begin the custom design.");
          } else {
            alert("Payment verification failed! Please contact support.");
          }
        } catch (e) {
          console.error("Verification error:", e);
          alert("Payment was successful, but verification script failed.");
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