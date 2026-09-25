const modal = document.getElementById('paymentModal');
const step1 = document.getElementById('modalStep1');
const step2 = document.getElementById('modalStep2');
const qrImage = document.getElementById('upiQrCode');

function openModal(itemName, price) {
  document.getElementById('modalItemName').innerText = itemName;
  document.getElementById('modalPrice').innerText = '₹' + price;
  
  // Generate UPI QR Code using Google API or QR Server API
  // Format: upi://pay?pa=nayeetanish@oksbi&pn=Tanish&am=PRICE&cu=INR
  const upiUrl = `upi://pay?pa=nayeetanish@oksbi&pn=CVRTN&am=${price}&cu=INR`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;
  qrImage.src = qrApiUrl;
  
  // Reset steps
  step1.style.display = 'block';
  step2.style.display = 'none';
  
  modal.style.display = 'flex';
}

function closeModal() {
  modal.style.display = 'none';
}

function verifyPayment() {
  const btn = step1.querySelector('button');
  const originalText = btn.innerText;
  btn.innerText = 'Verifying Payment...';
  btn.disabled = true;
  
  // Simulate network request delay (2.5 seconds)
  setTimeout(() => {
    step1.style.display = 'none';
    step2.style.display = 'block';
    btn.innerText = originalText;
    btn.disabled = false;
  }, 2500);
}