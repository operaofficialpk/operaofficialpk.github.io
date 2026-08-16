import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";

function ManageOrders({ initialTab = "All" }) {
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderTab, setOrderTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [adminNote, setAdminNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => { setOrderTab(initialTab); }, [initialTab]);
  useEffect(() => { fetchOrders(); }, []);
  useEffect(() => { setSelectedOrderIds([]); }, [orderTab]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "orders"));
      const orderList = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      orderList.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setOrders(orderList);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      console.error(error);
      alert("سٹیٹس اپ ڈیٹ کرنے میں مسئلہ پیش آیا۔");
    }
  };

  const handleSaveNote = async (orderId) => {
    setSavingNote(true);
    try {
      await updateDoc(doc(db, "orders", orderId), { adminNote });
      setOrders(orders.map(o => o.id === orderId ? { ...o, adminNote } : o));
      setSelectedOrder(prev => ({ ...prev, adminNote }));
      alert("نوٹ کامیابی سے محفوظ ہو گیا!");
    } catch (error) {
      console.error(error);
      alert("نوٹ سیو کرنے میں مسئلہ پیش آیا۔");
    } finally {
      setSavingNote(false);
    }
  };

  const handleMoveToBin = async (orderId) => {
    if (!window.confirm("کیا آپ واقعی اس آرڈر کو Bin میں منتقل کرنا چاہتے ہیں؟")) return;
    try {
      await updateDoc(doc(db, "orders", orderId), { isDeleted: true, status: "Bin" });
      setOrders(orders.map(o => o.id === orderId ? { ...o, isDeleted: true, status: "Bin" } : o));
      if (selectedOrder?.id === orderId) setSelectedOrder(null);
    } catch (error) {
      console.error(error);
      alert("آرڈر منتقل کرنے میں مسئلہ پیش آیا۔");
    }
  };

  const handlePermanentDelete = async (orderId) => {
    if (!window.confirm("کیا آپ واقعی اس آرڈر کو ہمیشہ کے لیے ڈیٹا بیس سے ڈیلیٹ کرنا چاہتے ہیں؟")) return;
    try {
      await deleteDoc(doc(db, "orders", orderId));
      setOrders(orders.filter(o => o.id !== orderId));
      if (selectedOrder?.id === orderId) setSelectedOrder(null);
    } catch (error) {
      console.error(error);
      alert("ڈیلیٹ کرنے میں مسئلہ پیش آیا۔");
    }
  };

  const handleRestore = async (orderId) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { isDeleted: false, status: "Pending" });
      setOrders(orders.map(o => o.id === orderId ? { ...o, isDeleted: false, status: "Pending" } : o));
    } catch (error) {
      console.error(error);
      alert("ری سٹور کرنے میں مسئلہ پیش آیا۔");
    }
  };

  const handleBulkMoveToBin = async () => {
    if (selectedOrderIds.length === 0) return;
    if (!window.confirm(`${selectedOrderIds.length} آرڈرز کو Bin میں منتقل کریں؟`)) return;
    try {
      await Promise.all(selectedOrderIds.map(id => updateDoc(doc(db, "orders", id), { isDeleted: true, status: "Bin" })));
      setOrders(orders.map(o => selectedOrderIds.includes(o.id) ? { ...o, isDeleted: true, status: "Bin" } : o));
      setSelectedOrderIds([]);
    } catch (error) {
      console.error(error);
      alert("کچھ آرڈرز منتقل کرنے میں مسئلہ پیش آیا۔");
    }
  };

  const handleBulkPermanentDelete = async () => {
    if (selectedOrderIds.length === 0) return;
    if (!window.confirm(`${selectedOrderIds.length} آرڈرز ہمیشہ کے لیے ڈیلیٹ کریں؟ یہ واپس نہیں ہو سکتا۔`)) return;
    try {
      await Promise.all(selectedOrderIds.map(id => deleteDoc(doc(db, "orders", id))));
      setOrders(orders.filter(o => !selectedOrderIds.includes(o.id)));
      setSelectedOrderIds([]);
    } catch (error) {
      console.error(error);
      alert("ڈیلیٹ کرنے میں مسئلہ پیش آیا۔");
    }
  };

  const exportToCSV = () => {
    if (orders.length === 0) { alert("ایکسپورٹ کرنے کے لیے کوئی آرڈر موجود نہیں!"); return; }
    const headers = ["Order ID", "Customer Name", "Phone", "Address & City", "Total Price", "Status", "Date"];
    const rows = orders.filter(o => !o.isDeleted).map(o => [
      o.id, 
      `"${o.customerName || "Guest"}"`, 
      o.phone || o.customerPhone || "N/A",
      `"${o.address && o.city ? `${o.address}, ${o.city}` : (o.address || o.city || o.customerAddress || "N/A")}"`, 
      o.total || o.totalPrice || 0,
      o.status || "Pending",
      o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000).toLocaleDateString() : "N/A"
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `orders_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredOrders = orders.filter(order => {
    const status = order.status || "Pending";
    if (orderTab === "Bin") {
      if (!order.isDeleted) return false;
    } else {
      if (order.isDeleted) return false;
      if (orderTab !== "All" && status.toLowerCase() !== orderTab.toLowerCase()) return false;
    }
    const q = searchQuery.toLowerCase();
    return (order.customerName || "").toLowerCase().includes(q) || (order.id || "").toLowerCase().includes(q);
  });

  const allFilteredSelected = filteredOrders.length > 0 && filteredOrders.every(o => selectedOrderIds.includes(o.id));
  const handleSelectAll = (checked) => setSelectedOrderIds(checked ? filteredOrders.map(o => o.id) : []);
  const toggleSelectOne = (id, checked) =>
    setSelectedOrderIds(prev => checked ? [...prev, id] : prev.filter(x => x !== id));

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {orderTab === "Bin" ? "🗑️ Deleted Orders (Bin)" : "📦 Manage Orders"}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Manage customer orders, update statuses, or clear trash.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOrderTab(orderTab === "Bin" ? "All" : "Bin")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${orderTab === "Bin" ? "bg-black text-white" : "bg-rose-50 text-rose-600 hover:bg-rose-100"}`}
          >
            {orderTab === "Bin" ? "🔙 Back to Orders" : `🗑️ Bin (${orders.filter(o => o.isDeleted).length})`}
          </button>
          <button onClick={exportToCSV} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer">
            📥 Export CSV
          </button>
        </div>
      </div>

      {orderTab !== "Bin" && (
        <div className="flex overflow-x-auto border-b border-gray-100 px-6 pt-4 gap-6 scrollbar-none bg-gray-50/50">
          {["All", "Pending", "Dispatched", "Delivered", "Completed", "Returned", "Cancelled"].map((tab) => {
            const count = tab === "All"
              ? orders.filter(o => !o.isDeleted).length
              : orders.filter(o => !o.isDeleted && (o.status || "Pending").toLowerCase() === tab.toLowerCase()).length;
            return (
              <button key={tab} onClick={() => setOrderTab(tab)}
                className={`pb-3 text-xs font-bold tracking-wide uppercase transition relative whitespace-nowrap cursor-pointer ${orderTab === tab ? "text-black border-b-2 border-black" : "text-gray-400 hover:text-gray-700"}`}>
                {tab} <span className="ml-0.5 text-[10px] text-gray-400 font-normal">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="p-4 border-b border-gray-100">
        <input type="text" placeholder="Search by customer name or order ID..." value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-black transition" />
      </div>

      {selectedOrderIds.length > 0 && (
        <div className="px-6 py-3 bg-black text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span className="text-xs font-semibold">{selectedOrderIds.length} آرڈرز منتخب ہیں</span>
          <div className="flex items-center gap-2">
            {orderTab === "Bin" ? (
              <button onClick={handleBulkPermanentDelete} className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 rounded-lg text-[11px] font-bold transition cursor-pointer">
                🗑️ Delete Permanently
              </button>
            ) : (
              <button onClick={handleBulkMoveToBin} className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 rounded-lg text-[11px] font-bold transition cursor-pointer">
                🗑️ Move to Bin
              </button>
            )}
            <button onClick={() => setSelectedOrderIds([])} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-[11px] font-bold transition cursor-pointer">
              Cancel
            </button>
          </div>
        </div>
      )}

      {ordersLoading ? (
        <div className="p-12 text-center text-gray-400 text-xs animate-pulse">Loading orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16"><p className="text-gray-400 text-xs font-medium">No orders found in this section.</p></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/30">
                <th className="py-3 px-6">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={allFilteredSelected} onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer" title="Select all" />
                    <span>Customer / Item</span>
                  </div>
                </th>
                <th className="py-3 px-6">Phone & Address</th>
                <th className="py-3 px-6">Total Price</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredOrders.map((order) => {
                const firstItem = order.items?.[0] || order.cartItems?.[0] || {};
                const itemsList = order.items || order.cartItems || [];
                const currentStatus = order.status || "Pending";
                return (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={selectedOrderIds.includes(order.id)}
                          onChange={(e) => toggleSelectOne(order.id, e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer shrink-0" />
                        <img src={firstItem.image || firstItem.imageUrl || "https://placehold.co/100"} alt="Product"
                          className="w-10 h-10 object-cover rounded-lg border border-gray-200 shrink-0" />
                        <div>
                          <p className="font-bold text-gray-900">{order.customerName || "Guest Customer"}</p>
                          <p className="text-[11px] text-gray-500 truncate max-w-[180px]">
                            {firstItem.name || "Product"} {itemsList.length > 1 ? `(+${itemsList.length - 1} more)` : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-gray-700">
                      <p className="font-medium">{order.phone || order.customerPhone || "N/A"}</p>
                      <p className="text-gray-400 text-[10px]">
                        {order.address && order.city ? `${order.address}, ${order.city}` : (order.address || order.city || order.customerAddress || "N/A")}
                      </p>
                    </td>
                    <td className="py-3.5 px-6 font-bold text-gray-900">Rs. {(order.total || order.totalPrice || 0).toLocaleString()}</td>
                    <td className="py-3.5 px-6">
                      <select value={currentStatus} onChange={(e) => handleStatusChange(order.id, e.target.value)} disabled={order.isDeleted}
                        className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg cursor-pointer outline-none border border-gray-200 bg-white disabled:bg-gray-100">
                        <option value="Pending">Pending</option>
                        <option value="Dispatched">Dispatched</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Completed">Completed</option>
                        <option value="Returned">Returned</option>
                        <option value="Cancelled">Cancelled</option>
                        {order.isDeleted && <option value="Bin">Bin</option>}
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => { setSelectedOrder(order); setAdminNote(order.adminNote || ""); }}
                          className="px-2.5 py-1.5 bg-gray-100 hover:bg-black hover:text-white text-gray-800 text-[11px] font-semibold rounded-lg transition cursor-pointer">
                          View 👁️
                        </button>
                        {order.isDeleted ? (
                          <>
                            <button onClick={() => handleRestore(order.id)}
                              className="px-2.5 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-[11px] font-semibold rounded-lg transition cursor-pointer" title="Restore Order">
                              ♻️ Restore
                            </button>
                            <button onClick={() => handlePermanentDelete(order.id)}
                              className="px-2.5 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 text-[11px] font-semibold rounded-lg transition cursor-pointer" title="Delete Permanently">
                              🗑️ Delete
                            </button>
                          </>
                        ) : (
                          <button onClick={() => handleMoveToBin(order.id)}
                            className="px-2.5 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 text-[11px] font-semibold rounded-lg transition cursor-pointer" title="Move to Bin">
                            🗑️ Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-end z-50 transition-all">
          <div className="bg-white w-full max-w-md h-full overflow-y-auto p-6 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Order Details</h3>
                <button onClick={() => setSelectedOrder(null)}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-bold text-sm transition cursor-pointer">✕</button>
              </div>
              <div className="mt-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs font-bold text-gray-900">👤 {selectedOrder.customerName || "Guest Customer"}</p>
                <p className="text-xs text-gray-600 mt-1">📞 {selectedOrder.phone || selectedOrder.customerPhone || "N/A"}</p>
                <p className="text-xs text-gray-600 mt-0.5">📍 {selectedOrder.address && selectedOrder.city ? `${selectedOrder.address}, ${selectedOrder.city}` : (selectedOrder.address || selectedOrder.city || selectedOrder.customerAddress || "N/A")}</p>
              </div>

              {/* Customer Note Section */}
              <div className="mt-4 bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">💬 Customer's Note</h4>
                <p className="text-xs text-gray-700">
                  {selectedOrder.orderNote || "Customer ne koi note nahi diya."}
                </p>
              </div>

              <div className="mt-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Items</h4>
                <div className="space-y-2">
                  {(selectedOrder.items || selectedOrder.cartItems || []).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2.5 bg-white border border-gray-100 rounded-xl">
                      <img src={item.image || item.imageUrl || "https://placehold.co/100"} alt={item.name} className="w-10 h-10 object-cover rounded-lg" />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-gray-900">{item.name}</p>
                        <p className="text-[11px] text-gray-500">Qty: {item.quantity || 1} x Rs. {(item.price || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Admin Remarks / Notes</h4>
                <textarea rows="3" value={adminNote} onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="آرڈر نوٹ یہاں لکھیں..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-black transition resize-none"></textarea>
                <button onClick={() => handleSaveNote(selectedOrder.id)} disabled={savingNote}
                  className="mt-2 px-4 py-2 bg-black text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition cursor-pointer">
                  {savingNote ? "Saving..." : "Save Note 💾"}
                </button>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100 mt-4 flex justify-between items-center">
              <span className="text-xs font-bold text-gray-400">TOTAL:</span>
              <span className="text-lg font-black text-emerald-600">Rs. {(selectedOrder.total || selectedOrder.totalPrice || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageOrders;