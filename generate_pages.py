import os

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content.strip())

def main():
    # 1. style.css
    style_css = """
:root {
  --bg-cream: #fbf9f1;
  --accent-red: #ff3b3b;
  --accent-blue: #3b82f6;
  --accent-green: #27ae60;
  --border-color: #111;
  --shadow-color: #111;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

body {
  background-color: var(--bg-cream);
  color: var(--border-color);
  padding: 20px;
}

header {
  text-align: center;
  margin-bottom: 40px;
  margin-top: 20px;
}

h1 {
  font-size: 3.5rem;
  color: var(--accent-red);
  -webkit-text-stroke: 2px var(--border-color);
  text-transform: uppercase;
  font-weight: 900;
  letter-spacing: 2px;
}

h2, h3 {
  text-transform: uppercase;
  font-weight: 900;
  letter-spacing: 1px;
}

p {
  font-weight: bold;
}

a {
  text-decoration: none;
}

/* Back Button */
.back-btn {
  display: inline-block;
  margin-bottom: 20px;
  font-weight: bold;
  color: var(--border-color);
  border: 2px solid var(--border-color);
  padding: 5px 15px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 2px 2px 0px var(--shadow-color);
  transition: all 0.1s;
}
.back-btn:active {
  transform: translate(2px, 2px);
  box-shadow: 0px 0px 0px var(--shadow-color);
}

/* Chunky Y2K UI Elements */
.y2k-box {
  background: #fff;
  border: 3px solid var(--border-color);
  border-radius: 12px;
  box-shadow: 6px 6px 0px var(--shadow-color);
  padding: 20px;
  margin-bottom: 25px;
}

.y2k-button {
  background-color: var(--accent-red);
  color: white;
  border: 3px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 4px 4px 0px var(--shadow-color);
  padding: 10px 20px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  text-transform: uppercase;
  transition: all 0.1s;
}

.y2k-button:active {
  transform: translate(4px, 4px);
  box-shadow: 0px 0px 0px var(--shadow-color);
}

/* Layout */
.container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
  max-width: 900px;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .container {
    grid-template-columns: 1fr 1fr;
  }
}

/* Landing Page Cards */
.nav-card {
  background: #fff;
  border: 4px solid var(--border-color);
  border-radius: 16px;
  box-shadow: 8px 8px 0px var(--shadow-color);
  padding: 50px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
  cursor: pointer;
  color: var(--border-color);
}
.nav-card:hover { transform: translate(-2px, -2px); box-shadow: 10px 10px 0px var(--shadow-color); }
.nav-card:active { transform: translate(6px, 6px); box-shadow: 2px 2px 0px var(--shadow-color); }

.nav-card h2 { font-size: 2.5rem; margin-bottom: 10px; }
.nav-card.red h2 { color: var(--accent-red); -webkit-text-stroke: 1px var(--border-color); }
.nav-card.blue h2 { color: var(--accent-blue); -webkit-text-stroke: 1px var(--border-color); }

/* Grid for Thumbnails */
.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 20px;
}

.portfolio-item {
  width: 100%;
  height: 140px;
  background-color: #eee;
  border: 3px solid var(--border-color);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background-size: cover;
  background-position: center;
  overflow: hidden;
  position: relative;
}

.portfolio-item .y2k-button {
  width: 100%;
  border: none;
  border-top: 3px solid var(--border-color);
  border-radius: 0;
  box-shadow: none;
  padding: 8px;
  font-size: 0.9rem;
}

/* Shop Items for Elements */
.shop-item {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 15px;
  border: 3px solid var(--border-color);
  border-radius: 8px;
  margin-bottom: 15px;
  background: var(--bg-cream);
}
@media (min-width: 480px) {
  .shop-item {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.price-tag {
  font-size: 1.4rem;
  font-weight: 900;
  color: var(--accent-red);
  margin-bottom: 5px;
}

/* Modal */
.modal-overlay {
  display: none;
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(4px);
  z-index: 100;
  align-items: center;
  justify-content: center;
  padding: 15px;
}

.modal-content {
  background: var(--bg-cream);
  width: 100%;
  max-width: 420px;
  border: 4px solid var(--border-color);
  box-shadow: 8px 8px 0px var(--shadow-color);
  border-radius: 16px;
  padding: 25px;
  text-align: center;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
}

.close-btn {
  position: absolute;
  top: 10px; right: 15px;
  font-size: 1.5rem;
  cursor: pointer;
  font-weight: bold;
}

.qr-placeholder {
  width: 200px; height: 200px;
  background: white;
  border: 3px solid var(--border-color);
  border-radius: 8px;
  margin: 15px auto;
  display: flex; align-items: center; justify-content: center;
}
.qr-placeholder img {
  width: 100%; height: 100%; object-fit: contain; border-radius: 4px;
}

.step-2 { display: none; }
.download-btn { background-color: var(--accent-green); }
"""
    write_file('style.css', style_css)

    # 2. payment.js
    payment_js = """
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
"""
    write_file('payment.js', payment_js)

    # 3. index.html (Landing)
    index_html = """
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>CVRTN | Store</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header>
    <h1>CVRTN STORE</h1>
    <p>Premium Thumbnails & Digital Assets</p>
  </header>

  <div class="container">
    <a href="thumbnails.html" class="nav-card red">
      <h2>Thumbnails</h2>
      <p>Buy high-quality premade thumbnails & order custom designs for your videos.</p>
    </a>
    <a href="elements.html" class="nav-card blue">
      <h2>Elements</h2>
      <p>Download 3D renders, VFX, meme assets, and 500+ viral elements pack.</p>
    </a>
  </div>
</body>
</html>
"""
    write_file('index.html', index_html)

    # 4. thumbnails.html
    thumbnails_html = """
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>CVRTN | Buy Thumbnails</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <a href="index.html" class="back-btn">&larr; Back to Home</a>
  
  <header style="margin-bottom: 20px; margin-top:0;">
    <h1 style="font-size: 2.5rem;">Thumbnails</h1>
    <p>Select a style below to purchase</p>
  </header>

  <div class="container">
    <div class="y2k-box" style="grid-column: 1 / -1;">
      <h2>Premade Thumbnails</h2>
      <div class="portfolio-grid">
        <div class="portfolio-item" style="background-image: url('assets/portfolio/portfolio-1.jpg');">
          <button class="y2k-button" onclick="openModal('Valorant Montage', 150)">Buy ₹150</button>
        </div>
        <div class="portfolio-item" style="background-image: url('assets/portfolio/portfolio-2.webp');">
          <button class="y2k-button" onclick="openModal('Neon Cyber Style', 150)">Buy ₹150</button>
        </div>
        <div class="portfolio-item" style="background-image: url('assets/portfolio/portfolio-3.webp');">
          <button class="y2k-button" onclick="openModal('3D Glass Art', 150)">Buy ₹150</button>
        </div>
        <div class="portfolio-item" style="background-image: url('assets/portfolio/portfolio-4.webp');">
          <button class="y2k-button" onclick="openModal('Esports Championship', 150)">Buy ₹150</button>
        </div>
      </div>
    </div>

    <div class="y2k-box" style="grid-column: 1 / -1; border-color: var(--accent-blue);">
      <h2 style="color: var(--accent-blue);">Custom Thumbnail Request</h2>
      <p style="margin-top: 5px;">Price: ₹250</p>
      <p style="font-weight: normal; font-size: 0.9rem; margin-top: 5px;">Need something completely custom? Pay the fee and Tanish will contact you to build your vision!</p>
      <button class="y2k-button" style="width: 100%; margin-top: 15px; background: var(--accent-blue);" onclick="openModal('Custom Thumbnail Request', 250)">Submit Request & Pay ₹250</button>
    </div>
  </div>

  <!-- PAYMENT MODAL -->
  <div class="modal-overlay" id="paymentModal">
    <div class="modal-content">
      <span class="close-btn" onclick="closeModal()">X</span>
      
      <!-- Step 1: Pay -->
      <div id="modalStep1">
        <h2>PAY VIA UPI</h2>
        <p style="margin-top:5px; font-weight:bold;">Buying: <span id="modalItemName" style="color: var(--accent-red);">Item</span></p>
        <h1 id="modalPrice" style="font-size: 3rem; margin: 10px 0;">₹0</h1>
        
        <div class="qr-placeholder">
          <img id="upiQrCode" src="" alt="UPI QR Code">
        </div>
        <p style="font-weight:bold; margin-bottom: 20px;">Scan QR or Copy UPI ID<br><span style="color:var(--accent-red); font-size:1.1rem; user-select:all;">nayeetanish@oksbi</span></p>
        
        <button class="y2k-button" style="width: 100%;" onclick="verifyPayment()">I've Paid — Verify</button>
      </div>

      <!-- Step 2: Download -->
      <div id="modalStep2" class="step-2">
        <h2 style="color: var(--accent-green);">Payment Verified!</h2>
        <p style="margin: 20px 0; font-weight: bold;">Your transaction was successful.</p>
        
        <a href="/CVRTNS_THumbnaiL.zip" download style="text-decoration: none;">
          <button class="y2k-button download-btn" style="width: 100%; margin-bottom: 10px;">Download Thumbnail (PSD)</button>
        </a>
        <p style="font-size: 0.8rem; color: #555;">For custom requests, Tanish will DM you shortly.</p>
      </div>
    </div>
  </div>

  <script src="payment.js"></script>
</body>
</html>
"""
    write_file('thumbnails.html', thumbnails_html)

    # 5. elements.html
    elements_html = """
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>CVRTN | Buy Elements</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <a href="index.html" class="back-btn">&larr; Back to Home</a>
  
  <header style="margin-bottom: 20px; margin-top:0;">
    <h1 style="font-size: 2.5rem; color: var(--accent-blue);">Elements</h1>
    <p>Download 4K viral assets for your edits</p>
  </header>

  <div class="container">
    <div class="y2k-box" style="grid-column: 1 / -1;">
      <h2>Thumbnail Element Packs</h2>
      
      <div class="shop-item">
        <div>
          <h3>Y2K 3D Render Pack</h3>
          <p style="font-weight: normal; margin-top:5px;">Transparent PNGs (No quality limits). Includes bursts, arrows, and cash stacks.</p>
        </div>
        <div style="text-align: right; min-width: 120px;">
          <div class="price-tag">₹100</div>
          <button class="y2k-button" onclick="openModal('Y2K 3D Render Pack', 100)">Buy Now</button>
        </div>
      </div>

      <div class="shop-item">
        <div>
          <h3>Starter Pack (150 PNGs)</h3>
          <p style="font-weight: normal; margin-top:5px;">Essential pack for beginners. Basic glows, memes, and UI overlays.</p>
        </div>
        <div style="text-align: right; min-width: 120px;">
          <div class="price-tag">₹50</div>
          <button class="y2k-button" onclick="openModal('Starter Pack', 50)">Buy Now</button>
        </div>
      </div>

      <div class="shop-item" style="border-color: var(--accent-blue); background: #f0f7ff;">
        <div>
          <h3 style="color: var(--accent-blue);">500+ Viral Elements Pack</h3>
          <p style="font-weight: normal; margin-top:5px;">The ultimate creator bundle. 4K renders, anime effects, emojis, memes, and lighting.</p>
        </div>
        <div style="text-align: right; min-width: 120px;">
          <div class="price-tag">₹200</div>
          <button class="y2k-button" style="background: var(--accent-blue);" onclick="openModal('500+ Viral Elements Pack', 200)">Buy Now</button>
        </div>
      </div>
    </div>
  </div>

  <!-- PAYMENT MODAL -->
  <div class="modal-overlay" id="paymentModal">
    <div class="modal-content">
      <span class="close-btn" onclick="closeModal()">X</span>
      
      <!-- Step 1: Pay -->
      <div id="modalStep1">
        <h2>PAY VIA UPI</h2>
        <p style="margin-top:5px; font-weight:bold;">Buying: <span id="modalItemName" style="color: var(--accent-red);">Item</span></p>
        <h1 id="modalPrice" style="font-size: 3rem; margin: 10px 0;">₹0</h1>
        
        <div class="qr-placeholder">
          <img id="upiQrCode" src="" alt="UPI QR Code">
        </div>
        <p style="font-weight:bold; margin-bottom: 20px;">Scan QR or Copy UPI ID<br><span style="color:var(--accent-red); font-size:1.1rem; user-select:all;">nayeetanish@oksbi</span></p>
        
        <button class="y2k-button" style="width: 100%;" onclick="verifyPayment()">I've Paid — Verify</button>
      </div>

      <!-- Step 2: Download -->
      <div id="modalStep2" class="step-2">
        <h2 style="color: var(--accent-green);">Payment Verified!</h2>
        <p style="margin: 20px 0; font-weight: bold;">Your transaction was successful.</p>
        
        <a href="/CVRTNS_THumbnaiL.zip" download style="text-decoration: none;">
          <button class="y2k-button download-btn" style="width: 100%;">Download Element Pack (ZIP)</button>
        </a>
      </div>
    </div>
  </div>

  <script src="payment.js"></script>
</body>
</html>
"""
    write_file('elements.html', elements_html)

if __name__ == '__main__':
    main()
