"use client";

import { useState } from "react";
import { processPDF } from "./ocr";

export default function Home() {
  const [status, setStatus] = useState("พร้อมสำหรับการสแกน");
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);

    try {
      const result = await processPDF(file, (msg) => {
        if (msg.includes("Processing")) setStatus("กำลังจัดเตรียมหน้าเอกสาร...");
        if (msg.includes("OCR")) setStatus("AI กำลังวิเคราะห์ข้อมูลตัวอักษร...");
      });
      
      if (result) {
        // ใช้ @ts-ignore เพื่อข้าม Error ของ SharedArrayBuffer ตอน Build
        // @ts-ignore
        const blob = new Blob([result], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement("a");
        a.href = url;
        a.download = `Digitized_${file.name.split('.')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        setStatus("เปลี่ยนเอกสารสำเร็จ!");
      }
    } catch (error) {
      console.error(error);
      setStatus("ระบบขัดข้อง กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: '800px' }}>
      {/* Navigation Header สไตล์ K-Bank Corporate */}
      <nav className="nav">
        <div className="logo-container">
          <div className="logo-wrapper">
             <div className="logo-fallback">IT</div>
          </div>
          <div className="brand-text">
            <div className="app-name">IT SUPPORT <span className="pro-badge">DIGITIZER</span></div>
            <div className="app-subtitle">ระบบเปลี่ยนไฟล์ภาพเป็น PDF เพื่อการสืบค้นข้อมูล</div>
          </div>
        </div>
        <div className="status-pill">
          <div className="dot"></div>
          <span className="status-text">{status}</span>
        </div>
      </nav>

      {/* พื้นที่ประมวลผลหลัก */}
      <div className="app-container">
        <label className="dropzone">
          <input 
            type="file" 
            accept="application/pdf, image/png, image/jpeg" 
            onChange={handleFile} 
            disabled={loading}
            style={{ display: 'none' }}
          />
          <div style={{ fontSize: '56px', marginBottom: '20px' }}>📄</div>
          <h2 style={{ margin: '0 0 12px 0', color: 'var(--text)', fontSize: '24px' }}>
            {fileName ? fileName : "เลือกเอกสารเพื่อเริ่มระบบ"}
          </h2>
          <p style={{ margin: 0, opacity: 0.7, fontSize: '15px' }}>
            ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์ (PDF, PNG, JPG)
          </p>
        </label>

        {loading && (
          <div style={{ textAlign: 'center', padding: '30px', background: 'rgba(0,212,123,0.05)', borderRadius: '16px' }}>
            <div className="status-text" style={{ fontSize: '20px', animation: 'pulse 1.5s infinite', color: 'var(--accent)' }}>
              กำลังเปลี่ยนเป็นเอกสารสู่ระบบดิจิทัล...
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '12px' }}>
                ระบบกำลังสร้าง Searchable Layer เพื่อการค้นหาข้อความ
            </p>
          </div>
        )}

        <div className="controls-row">
          <div className="sorts">
          </div>
          <div style={{ color: 'var(--muted)', fontSize: '13px', fontWeight: '500' }}>
            🔐 ข้อมูลปลอดภัย ประมวลผลภายในเครื่องเท่านั้น
          </div>
        </div>
      </div>
      
      {/* ส่วน Corporate Pitch Footer */}
      <footer style={{ marginTop: '48px', padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid var(--line)' }}>
        <h3 style={{ color: 'var(--accent)', marginBottom: '16px', fontSize: '18px' }}>ยกระดับองค์กรด้วยการเปลี่ยนเอกสารเป็นดิจิทัล</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div>
            <h4 style={{ marginBottom: '4px' }}>🔍 ค้นหาได้ทันที</h4>
            <p style={{ fontSize: '13px', color: 'var(--muted)' }}>เปลี่ยนไฟล์สแกนให้ค้นหาคำสำคัญได้ผ่าน Ctrl+F ทันที</p>
          </div>
          <div>
            <h4 style={{ marginBottom: '4px' }}>🛡️ มาตรฐานความปลอดภัย</h4>
            <p style={{ fontSize: '13px', color: 'var(--muted)' }}>ประมวลผลที่เครื่องผู้ใช้ (Client-side) ข้อมูลไม่รั่วไหลสู่ Cloud ภายใต้ความปลอดภัยระดับสูงสุด</p>
          </div>
          <div>
            <h4 style={{ marginBottom: '4px' }}>🌱 ลดการใช้กระดาษ</h4>
            <p style={{ fontSize: '13px', color: 'var(--muted)' }}>เปลี่ยนเอกสารกระดาษให้เป็นข้อมูลดิจิทัลที่ใช้งานต่อได้ 100%</p>
          </div>
        </div>
      </footer>
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
         <p style={{ fontSize: '13px', color: 'var(--muted)', opacity: 0.8 }}>Thanakorn | IT Support Experience</p>
      </div>
    </div>
  );
}