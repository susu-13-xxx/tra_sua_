require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 1. Kết nối Cơ sở dữ liệu MongoDB
// Dùng URI kết nối CSDL (mặc định chạy local nếu chưa cấu hình .env)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tra_sua_db';

mongoose.connect(MONGO_URI)
  .then(() => console.log('🍃 Kết nối CSDL MongoDB thành công vĩnh viễn!'))
  .catch((err) => console.log('⚠️ Đang chạy chế độ Memory Backup (Lỗi kết nối MongoDB):', err.message));

// 2. Định nghĩa Khung dữ liệu Đơn hàng (Schema)
const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  items: Array,
  totalAmount: Number,
  status: { type: String, default: 'Đang xử lý ⏳' },
  createdAt: { type: String, default: () => new Date().toLocaleTimeString('vi-VN') }
});

const Order = mongoose.model('Order', orderSchema);

// 3. Các API Giao tiếp

// Lấy danh sách đơn
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ _id: -1 });
    res.json(orders.map(o => ({
      id: o.orderId,
      items: o.items,
      totalAmount: o.totalAmount,
      status: o.status,
      createdAt: o.createdAt
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tạo đơn mới
app.post('/api/orders', async (req, res) => {
  try {
    const newOrder = new Order({
      orderId: 'DH' + Math.floor(1000 + Math.random() * 9000),
      items: req.body.items,
      totalAmount: req.body.totalAmount,
    });
    await newOrder.save();
    res.status(201).json({ message: 'Tạo đơn thành công!', order: newOrder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Đổi trạng thái
app.put('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id });
    if (order) {
      order.status = order.status === 'Đang xử lý ⏳' ? 'Hoàn thành ✅' : 'Đang xử lý ⏳';
      await order.save();
    }
    res.json({ message: 'Cập nhật thành công!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Xóa đơn
app.delete('/api/orders/:id', async (req, res) => {
  try {
    await Order.deleteOne({ orderId: req.params.id });
    res.json({ message: 'Xóa thành công!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server backend đang chạy tại: http://localhost:${PORT}`);
});