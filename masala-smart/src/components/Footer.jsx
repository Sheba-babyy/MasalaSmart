function Footer() {
  return (
    <footer className="footer">
      <p>&copy; 2025 BlendMaster Blend Plan System (BMS) - All Rights Reserved</p>
      <p>Intelligent Production Planning for Zero Expiry Waste</p>

      <style jsx>{`
        .footer {
          height: 80px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          border-top: 1px solid rgba(255, 215, 0, 0.3);
          padding-top: 10px;  
        }

        .footer p:first-child {
          margin: 0;
          font-weight: bold;
          color: #ffd700;
        }

        .footer p:last-child {
          margin: 5px 0 0;
          opacity: 0.8;
        }
      `}</style>
    </footer>
  );
}

export default Footer;