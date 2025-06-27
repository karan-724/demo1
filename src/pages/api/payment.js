// pages/api/facebookPixel.js

import { connectToDatabase } from '../../utils/mongodb';
import FacebookPixel from '../../models/FacebookPixel';
import authenticateToken from './middleware/auth';
import { Cashfree } from "cashfree-pg";

connectToDatabase();

export default async function handler(req, res) {
  // Apply the middleware for token verification
  authenticateToken(req, res, () => handleRequest(req, res));
}


Cashfree.XClientId = process.env.CLIENT_ID;
Cashfree.XClientSecret = process.env.CLIENT_SECRET;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;

function generateOrderId() {
    const uniqueId = crypto.randomBytes(16).toString('hex');

    const hash = crypto.createHash('sha256');
    hash.update(uniqueId);

    const orderId = hash.digest('hex');

    return orderId.substr(0, 12);
}
async function handleRequest(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
    try {

        let request = {
            "order_amount": 1.00,
            "order_currency": "INR",
            "order_id": await generateOrderId(),
            "customer_details": {
                "customer_id": "webcodder01",
                "customer_phone": "9999999999",
                "customer_name": "Web Codder",
                "customer_email": "webcodder@example.com"
            },
        }

        Cashfree.PGCreateOrder("2023-08-01", request).then(response => {
            console.log(response.data);
            res.json(response.data);

        }).catch(error => {
            console.error(error.response.data.message);
        })


    } catch (error) {
        console.log(error);
    }
      break;

    default:
      res.status(405).json({ status: 0, message: 'Method Not Allowed' });
      break;
  }
}
