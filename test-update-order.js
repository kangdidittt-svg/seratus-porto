const { MongoClient, ObjectId } = require('mongodb');

async function updateOrder() {
  const client = new MongoClient('mongodb://localhost:27017/seratus-studio');
  
  try {
    await client.connect();
    const db = client.db('seratus-studio');
    const orders = db.collection('orders');
    
    const result = await orders.updateOne(
      { _id: new ObjectId('68a1cdd1735b4ed83ecd98ae') },
      { 
        $set: { 
          payment_status: 'paid',
          delivery_status: 'delivered',
          download_expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      }
    );
    
    console.log('Order updated:', result);
    
    // Verify update
    const updatedOrder = await orders.findOne({ _id: new ObjectId('68a1cdd1735b4ed83ecd98ae') });
    console.log('Updated order status:', {
      payment_status: updatedOrder.payment_status,
      delivery_status: updatedOrder.delivery_status
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

updateOrder();