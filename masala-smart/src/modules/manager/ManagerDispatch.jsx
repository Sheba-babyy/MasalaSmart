import React, { useState, useEffect } from 'react';
import ManagerNavbar from "../../components/ManagerNavbar";
import ManagerSidebar from "./managersidebar";
import Footer from "../../components/Footer";
import backgroundImg from "../../assets/img2.png";
import { fetchReadyForDispatch, dispatchPackedOrder } from "../../services/api";

const ManagerDispatch = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const data = await fetchReadyForDispatch();
            setOrders(data);
        } catch (err) {
            console.error("Failed to load ready orders:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDispatch = async (id) => {
        if (window.confirm("Are you sure you want to dispatch this batch?")) {
            try {
                await dispatchPackedOrder(id);
                alert("🚀 Masala Dispatched Successfully!");
                loadOrders(); 
            } catch (err) {
                alert("Dispatch failed: " + (err.error || "Server Error"));
            }
        }
    };

    return (
        <>
            <div className="manager-layout">
                <ManagerSidebar activePage="batch-tracking" />
                
                <div className="main-content">
                     <ManagerNavbar />
                    <div className="dashboard">
                        <div className="page-header">
                            <h1>Order Dispatch Center</h1>
                            <p className="subtitle">
                                View packed masala batches ready for final shipment and delivery.
                            </p>
                        </div>

                        {loading ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>Checking ready stock...</p>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="empty-state">
                                <h3 style={{fontSize: '1.5rem', color: '#60a5fa'}}>📦 No Items Ready</h3>
                                <p>Staff hasn't marked any batches as "Ready" for dispatch yet.</p>
                            </div>
                        ) : (
                            <div className="table-wrapper">
                                <table className="tracking-table">
                                    <thead>
                                        <tr>
                                            <th>Batch ID</th>
                                            <th>Masala Product</th>
                                            <th>Total Units</th>
                                            <th>Unit Type</th>
                                            <th>Mfg Date</th>
                                            <th>Dispatch Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map(order => (
                                            <tr key={order._id} className="batch-row">
                                                <td><span className="batch-code">{order.batch_id}</span></td>
                                                <td className="product-cell">{order.product}</td>
                                                <td style={{fontWeight: '700', color: '#fff'}}>{order.total_units}</td>
                                                <td><span className="unit-tag">{order.unit_size}</span></td>
                                                <td>{order.mfg_date}</td>
                                                <td>
                                                    <button 
                                                        className="dispatch-btn"
                                                        onClick={() => handleDispatch(order._id)}
                                                    >
                                                        Finalize Dispatch
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                    <Footer />
                </div>
            </div>

            <style>
                {`
                .manager-layout {
                    display: flex;
                    min-height: 100vh;
                    background: url(${backgroundImg}) no-repeat center center fixed;
                    background-size: cover;
                    position: relative;
                }
                .manager-layout::before {
                    content: "";
                    position: absolute;
                    inset: 0;
                    background: rgba(15, 23, 42, 0.9);
                    z-index: 0;
                }
                .main-content {
                    margin-left: 280px;
                    width: calc(100% - 280px);
                    position: relative;
                    z-index: 1;
                    display: flex;
                    flex-direction: column;
                }
                .dashboard { padding: 40px 40px 60px; flex: 1; color: white; }
                .page-header h1 { 
                    font-size: 2.5rem; 
                    font-weight: 800; 
                    background: linear-gradient(90deg, #60a5fa, #a78bfa, #fff); 
                    -webkit-background-clip: text; 
                    -webkit-text-fill-color: transparent; 
                    margin-bottom: 5px;
                }
                .subtitle { color: #94a3b8; margin-bottom: 40px; }
                
                .table-wrapper { background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
                .tracking-table { width: 100%; border-collapse: collapse; }
                .tracking-table th { padding: 20px; text-align: left; background: rgba(255,255,255,0.05); color: #94a3b8; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; }
                .tracking-table td { padding: 18px 20px; border-top: 1px solid rgba(255,255,255,0.05); color: #cbd5e1; }
                
                .batch-code { background: rgba(96, 165, 250, 0.1); color: #60a5fa; padding: 5px 12px; border-radius: 6px; font-weight: 700; font-family: monospace; border: 1px solid rgba(96, 165, 250, 0.2); }
                .unit-tag { background: rgba(255,255,255,0.1); padding: 3px 8px; border-radius: 4px; font-size: 0.8rem; }
                .product-cell { font-weight: 700; color: #fff; font-size: 1.1rem; }
                
                .dispatch-btn {
                    background: linear-gradient(135deg, #3b82f6, #2563eb);
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 700;
                    transition: all 0.2s ease;
                }
                .dispatch-btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(59, 130, 246, 0.4); }

                .spinner { width: 45px; height: 45px; border: 3px solid rgba(255,255,255,0.1); border-top-color: #60a5fa; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px; }
                @keyframes spin { to { transform: rotate(360deg); } }
                .loading-state, .empty-state { text-align: center; padding: 100px 20px; background: rgba(0,0,0,0.2); border-radius: 12px; }
                `}
            </style>
        </>
    );
};

export default ManagerDispatch;